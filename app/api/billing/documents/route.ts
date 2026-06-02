import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import { generateDocumentNumber } from '@/lib/billing/generate-number';
import type { BillingDocumentType, TvaRegime, PaymentMethod } from '@prisma/client';

// GET — liste tous les documents de facturation
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') as BillingDocumentType | null;

  try {
    const documents = await prismadb.billingDocument.findMany({
      where: type ? { type } : undefined,
      include: {
        crmAccount: { select: { id: true, name: true, nif: true } },
        occasionalClient: { select: { id: true, name: true, nif: true } },
        lines: { orderBy: { position: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(documents, { status: 200 });
  } catch (error) {
    console.error('[BILLING_DOCUMENTS_GET]', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}

// POST — créer un nouveau document
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  try {
    const body = await req.json();
    const {
      type,
      status,
      crmAccountId,
      occasionalClient,  // { name, nif, phone, email, address, city }
      tvaRegime,
      tvaRate,
      issueDate,
      dueDate,
      notes,
      lines,             // [{ position, designation, quantity, unitPrice, totalHT, totalTVA, totalTTC }]
    } = body;

    const document = await prismadb.$transaction(async (tx) => {
      // Créer le client occasionnel si besoin
      let occasionalClientId: string | undefined;
      if (!crmAccountId && occasionalClient?.name) {
        const oc = await tx.occasionalClient.create({ data: occasionalClient });
        occasionalClientId = oc.id;
      }

      // Calculer les totaux à partir des lignes
      const totalHT  = lines.reduce((s: number, l: any) => s + l.totalHT,  0);
      const totalTVA = lines.reduce((s: number, l: any) => s + l.totalTVA, 0);
      const totalTTC = lines.reduce((s: number, l: any) => s + l.totalTTC, 0);

      // Générer le numéro séquentiel
      const number = await generateDocumentNumber(type as BillingDocumentType, tx as any);

      // Créer le document
      return tx.billingDocument.create({
        data: {
          type,
          number,
          status: status ?? (type === 'DEVIS' ? 'BROUILLON' : 'BROUILLON'),
          crmAccountId:       crmAccountId || null,
          occasionalClientId: occasionalClientId || null,
          tvaRegime:  tvaRegime  as TvaRegime,
          tvaRate:    tvaRate    ?? 18,
          issueDate:  issueDate  ? new Date(issueDate)  : new Date(),
          dueDate:    dueDate    ? new Date(dueDate)    : null,
          totalHT,
          totalTVA,
          totalTTC,
          notes: notes || null,
          createdBy: session.user.id,
          updatedBy: session.user.id,
          lines: {
            create: lines.map((l: any) => ({
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
        include: { lines: true },
      });
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('[BILLING_DOCUMENTS_POST]', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}
