import { NextResponse } from 'next/server';
import { prismadb } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const expense = await prismadb.expense.findUnique({ where: { id: params.id } });
  if (!expense) return new NextResponse('Not found', { status: 404 });

  await prismadb.expense.delete({ where: { id: params.id } });

  return new NextResponse(null, { status: 204 });
}
