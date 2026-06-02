import { NextResponse } from 'next/server';
import { prismadb } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { PaymentMethod } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const { description, amount, category, date, receipt, accountId, treasuryAccountId, paymentMethod } =
    await req.json();

  if (!description || !amount || !category || !date) {
    return new NextResponse('Champs requis manquants', { status: 400 });
  }

  const expense = await prismadb.$transaction(async (tx) => {
    const newExpense = await tx.expense.create({
      data: {
        description,
        amount:            Number(amount),
        category,
        date:              new Date(date),
        receipt:           receipt || null,
        paymentMethod:     (paymentMethod as PaymentMethod) || 'ESPECES',
        accountId:         accountId || null,
        treasuryAccountId: treasuryAccountId || null,
        createdBy:         session.user.id,
      },
    });

    if (treasuryAccountId && Number(amount) > 0) {
      await tx.treasuryEntry.create({
        data: {
          accountId:     treasuryAccountId,
          type:          'SORTIE',
          amount:        Number(amount),
          description,
          date:          new Date(date),
          paymentMethod: (paymentMethod as PaymentMethod) || 'ESPECES',
          reference:     receipt || null,
          createdBy:     session.user.id,
        },
      });
    }

    return newExpense;
  });

  return NextResponse.json(expense, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const expenses = await prismadb.expense.findMany({
    include: {
      account:         { select: { name: true } },
      treasuryAccount: { select: { name: true, type: true } },
    },
    orderBy: { date: 'desc' },
  });

  return NextResponse.json(expenses);
}
