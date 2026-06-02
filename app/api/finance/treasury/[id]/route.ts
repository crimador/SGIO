import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import type { TreasuryAccountType } from '@prisma/client';

export const dynamic = 'force-dynamic';

// PATCH — modifier un compte
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const { name, type, currency, accountNumber } = await req.json();

  const account = await prismadb.treasuryAccount.update({
    where: { id: params.id },
    data: {
      ...(name                        && { name }),
      ...(type                        && { type: type as TreasuryAccountType }),
      ...(currency                    && { currency }),
      accountNumber: accountNumber || null,
    },
  });

  return NextResponse.json(account);
}

// DELETE — désactiver un compte (soft delete)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  // Vérifier s'il y a des mouvements liés
  const count = await prismadb.treasuryEntry.count({
    where: { accountId: params.id },
  });

  if (count > 0) {
    // On désactive seulement, on ne supprime pas
    const account = await prismadb.treasuryAccount.update({
      where: { id: params.id },
      data:  { isActive: false },
    });
    return NextResponse.json({ ...account, warning: 'Compte désactivé (mouvements existants)' });
  }

  await prismadb.treasuryAccount.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
