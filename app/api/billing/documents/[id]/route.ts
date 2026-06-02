import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import { generateDocumentNumber } from '@/lib/billing/generate-number';
import type { BillingDocumentType, PaymentMethod } from '@prisma/client';

// GET — détail d'un document
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const doc = await prismadb.billingDocument.findUnique({
    where: { id: params.id },
    include: {
      crmAccount:       { select: { id: true, name: true, nif: true, billing_street: true, billing_city: true } },
      occasionalClient: true,
      lines:            { orderBy: { position: 'asc' } },
      sourceQuote:      { select: { id: true, number: true } },
      creditedInvoice:  { select: { id: true, number: true } },
      creditNotes:      { select: { id: true, number: true, totalTTC: true } },
    },
  });

  if (!doc) return new NextResponse('Non trouvé', { status: 404 });
  return NextResponse.json(doc);
}

// PATCH — changer le statut, encaisser, transformer, ou créer un avoir
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const body = await req.json();
  const { action } = body;

  const doc = await prismadb.billingDocument.findUnique({
    where: { id: params.id },
    include: { lines: true },
  });
  if (!doc) return new NextResponse('Non trouvé', { status: 404 });

  // ── Encaissement ────────────────────────────────────────────────────────────
  if (action === 'payer') {
    const { treasuryAccountId, paymentMethod, paymentDate, reference } = body;

    if (!treasuryAccountId || !paymentMethod || !paymentDate) {
      return new NextResponse('Données de paiement manquantes', { status: 400 });
    }

    const updated = await prismadb.$transaction(async (tx) => {
      // Créer l'écriture de trésorerie
      const entry = await tx.treasuryEntry.create({
        data: {
          accountId:     treasuryAccountId,
          type:          'ENTREE',
          amount:        doc.totalTTC,
          description:   `Encaissement ${doc.number} — ${doc.crmAccountId ? 'client CRM' : 'client occasionnel'}`,
          date:          new Date(paymentDate),
          paymentMethod: paymentMethod as PaymentMethod,
          reference:     reference || null,
          createdBy:     session.user.id,
        },
      });

      // Mettre à jour la facture
      return tx.billingDocument.update({
        where: { id: params.id },
        data: {
          status:         'PAYEE',
          paidAt:         new Date(paymentDate),
          paymentMethod:  paymentMethod as PaymentMethod,
          treasuryEntryId: entry.id,
          updatedBy:      session.user.id,
        },
      });
    });

    return NextResponse.json(updated);
  }

  // ── Avoir ────────────────────────────────────────────────────────────────────
  if (action === 'avoir') {
    const { mode = 'TOTAL', motif, montantPartiel, notes: avoirNotes } = body;

    if (!motif?.trim()) {
      return new NextResponse('Le motif de l\'avoir est requis', { status: 400 });
    }

    const tvaRate = doc.tvaRate / 100;

    let lines: { position: number; designation: string; quantity: number; unitPrice: number; totalHT: number; totalTVA: number; totalTTC: number }[];
    let totalHT: number;
    let totalTVA: number;
    let totalTTC: number;

    if (mode === 'PARTIEL') {
      const ttc = Number(montantPartiel);
      if (!ttc || ttc <= 0) {
        return new NextResponse('Montant invalide', { status: 400 });
      }
      const ht  = ttc / (1 + tvaRate);
      const tva = ttc - ht;
      totalHT   = ht;
      totalTVA  = tva;
      totalTTC  = ttc;
      lines = [{
        position:    1,
        designation: motif,
        quantity:    1,
        unitPrice:   ht,
        totalHT:     ht,
        totalTVA:    tva,
        totalTTC:    ttc,
      }];
    } else {
      totalHT  = doc.totalHT;
      totalTVA = doc.totalTVA;
      totalTTC = doc.totalTTC;
      lines = doc.lines.map((l) => ({
        position:    l.position,
        designation: l.designation,
        quantity:    l.quantity,
        unitPrice:   l.unitPrice,
        totalHT:     l.totalHT,
        totalTVA:    l.totalTVA,
        totalTTC:    l.totalTTC,
      }));
    }

    const { treasuryAccountId, paymentMethod: avoirPaymentMethod, refundDate } = body;

    // Si la facture est déjà payée, un remboursement de trésorerie est obligatoire
    if (doc.status === 'PAYEE' && (!treasuryAccountId || !avoirPaymentMethod)) {
      return new NextResponse('Compte et mode de remboursement requis pour une facture déjà encaissée', { status: 400 });
    }

    const avoir = await prismadb.$transaction(async (tx) => {
      const number = await generateDocumentNumber('AVOIR', tx as any);

      const newAvoir = await tx.billingDocument.create({
        data: {
          type:               'AVOIR',
          number,
          status:             'BROUILLON',
          crmAccountId:       doc.crmAccountId,
          occasionalClientId: doc.occasionalClientId,
          tvaRegime:          doc.tvaRegime,
          tvaRate:            doc.tvaRate,
          issueDate:          new Date(),
          totalHT,
          totalTVA,
          totalTTC,
          notes:              avoirNotes || null,
          creditedInvoiceId:  doc.id,
          creditNoteMode:     mode,
          creditNoteMotif:    motif,
          createdBy:          session.user.id,
          updatedBy:          session.user.id,
          lines:              { create: lines },
        },
      });

      // Mouvement de trésorerie uniquement si la facture était déjà payée
      if (doc.status === 'PAYEE' && treasuryAccountId) {
        await tx.treasuryEntry.create({
          data: {
            accountId:     treasuryAccountId,
            type:          'SORTIE',
            amount:        totalTTC,
            description:   `Remboursement avoir ${number} — motif : ${motif}`,
            date:          refundDate ? new Date(refundDate) : new Date(),
            paymentMethod: avoirPaymentMethod as PaymentMethod,
            createdBy:     session.user.id,
          },
        });
      }

      return newAvoir;
    });
    return NextResponse.json(avoir, { status: 201 });
  }

  // ── Transformer devis → facture ──────────────────────────────────────────────
  if (action === 'transformer') {
    if (doc.type !== 'DEVIS' || doc.status !== 'ACCEPTE') {
      return new NextResponse('Action impossible', { status: 400 });
    }
    const facture = await prismadb.$transaction(async (tx) => {
      const number = await generateDocumentNumber('FACTURE', tx as any);
      const newDoc = await tx.billingDocument.create({
        data: {
          type:               'FACTURE',
          number,
          status:             'BROUILLON',
          crmAccountId:       doc.crmAccountId,
          occasionalClientId: doc.occasionalClientId,
          tvaRegime:          doc.tvaRegime,
          tvaRate:            doc.tvaRate,
          issueDate:          new Date(),
          dueDate:            doc.dueDate,
          totalHT:            doc.totalHT,
          totalTVA:           doc.totalTVA,
          totalTTC:           doc.totalTTC,
          notes:              doc.notes,
          quoteId:            doc.id,
          createdBy:          session.user.id,
          updatedBy:          session.user.id,
          lines: {
            create: doc.lines.map((l) => ({
              position:    l.position,
              designation: l.designation,
              quantity:    l.quantity,
              unitPrice:   l.unitPrice,
              totalHT:     l.totalHT,
              totalTVA:    l.totalTVA,
              totalTTC:    l.totalTTC,
            })),
          },
        },
      });
      await tx.billingDocument.update({
        where: { id: doc.id },
        data:  { status: 'TRANSFORME', updatedBy: session.user.id },
      });
      return newDoc;
    });
    return NextResponse.json(facture, { status: 201 });
  }

  // ── Transitions simples (envoyer, accepter, refuser) ─────────────────────────
  const STATUS_TRANSITIONS: Record<string, Record<string, string>> = {
    DEVIS:   { envoyer: 'ENVOYE', accepter: 'ACCEPTE', refuser: 'REFUSE' },
    FACTURE: { envoyer: 'EMISE' },
  };

  const newStatus = STATUS_TRANSITIONS[doc.type]?.[action];
  if (!newStatus) return new NextResponse('Action inconnue', { status: 400 });

  const updated = await prismadb.billingDocument.update({
    where: { id: params.id },
    data:  { status: newStatus, updatedBy: session.user.id },
  });
  return NextResponse.json(updated);
}
