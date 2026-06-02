import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import type { TreasuryAccountType } from '@prisma/client';

export const dynamic = 'force-dynamic';

// GET — liste des comptes actifs
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const accounts = await prismadb.treasuryAccount.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(accounts);
}

// POST — créer un nouveau compte
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const { name, type, currency, accountNumber, initialBalance } = await req.json();

  if (!name || !type) {
    return new NextResponse('Nom et type requis', { status: 400 });
  }

  const account = await prismadb.$transaction(async (tx) => {
    const newAccount = await tx.treasuryAccount.create({
      data: {
        name,
        type:          type as TreasuryAccountType,
        currency:      currency || 'XOF',
        accountNumber: accountNumber || null,
        isActive:      true,
      },
    });

    // Solde d'ouverture
    if (initialBalance && Number(initialBalance) > 0) {
      await tx.treasuryEntry.create({
        data: {
          accountId:     newAccount.id,
          type:          'ENTREE',
          amount:        Number(initialBalance),
          description:   'Solde d\'ouverture',
          date:          new Date(),
          paymentMethod: 'VIREMENT',
          createdBy:     session.user.id,
        },
      });
    }

    return newAccount;
  });

  return NextResponse.json(account, { status: 201 });
}
