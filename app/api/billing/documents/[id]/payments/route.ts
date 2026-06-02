import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const payments = await prismadb.billingPayment.findMany({
    where:   { documentId: params.id },
    include: { treasuryAccount: { select: { name: true } } },
    orderBy: { date: 'asc' },
  });

  return NextResponse.json(payments);
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const body = await req.json();
  const { amount, date, paymentMethod, treasuryAccountId, notes } = body;

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
  }
  if (!date) {
    return NextResponse.json({ error: 'Date requise' }, { status: 400 });
  }
  if (!paymentMethod) {
    return NextResponse.json({ error: 'Mode de paiement requis' }, { status: 400 });
  }

  const doc = await prismadb.billingDocument.findUnique({
    where:   { id: params.id },
    include: { payments: true, crmAccount: { select: { name: true } }, occasionalClient: { select: { name: true } } },
  });

  if (!doc) return new NextResponse('Not found', { status: 404 });
  if (doc.type !== 'FACTURE') {
    return NextResponse.json({ error: 'Les acomptes ne s\'appliquent qu\'aux factures' }, { status: 400 });
  }
  if (doc.status === 'PAYEE' || doc.status === 'ANNULEE') {
    return NextResponse.json({ error: 'Facture déjà soldée ou annulée' }, { status: 400 });
  }

  const totalDejaRecu = doc.payments.reduce((s, p) => s + p.amount, 0);
  const reste = doc.totalTTC - totalDejaRecu;

  if (amount > reste + 0.01) {
    return NextResponse.json(
      { error: `Le montant saisi (${amount} FCFA) dépasse le reste dû (${Math.round(reste)} FCFA)` },
      { status: 400 }
    );
  }

  const clientName = doc.crmAccount?.name ?? doc.occasionalClient?.name ?? 'Client';
  const paymentDate = new Date(date);
  const nowPaid = totalDejaRecu + amount;
  const isFullyPaid = nowPaid >= doc.totalTTC - 0.01;

  const result = await prismadb.$transaction(async (tx) => {
    // Créer le paiement
    const payment = await tx.billingPayment.create({
      data: {
        documentId:        params.id,
        amount,
        date:              paymentDate,
        paymentMethod,
        treasuryAccountId: treasuryAccountId || null,
        notes:             notes || null,
        createdBy:         session.user?.id,
      },
    });

    // Créer l'entrée de trésorerie si un compte est sélectionné
    let treasuryEntry = null;
    if (treasuryAccountId) {
      const isAcompte = !isFullyPaid;
      treasuryEntry = await tx.treasuryEntry.create({
        data: {
          accountId:     treasuryAccountId,
          type:          'ENTREE',
          amount,
          date:          paymentDate,
          paymentMethod,
          description:   isAcompte
            ? `Acompte facture ${doc.number} — ${clientName}`
            : `Règlement facture ${doc.number} — ${clientName}`,
          reference:     doc.number,
          createdBy:     session.user?.id,
        },
      });
    }

    // Si soldée → mettre à jour le statut de la facture
    if (isFullyPaid) {
      await tx.billingDocument.update({
        where: { id: params.id },
        data: {
          status:         'PAYEE',
          paidAt:         paymentDate,
          paymentMethod,
          treasuryEntryId: treasuryEntry?.id ?? undefined,
        },
      });
    }

    return { payment, isFullyPaid };
  });

  return NextResponse.json(result, { status: 201 });
}
