import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';

export async function DELETE(
  _req: Request,
  { params }: { params: { trainingId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });
  if (!['DG', 'RH'].includes(session.user.userRole))
    return new NextResponse('Forbidden', { status: 403 });

  await prismadb.training.delete({ where: { id: params.trainingId } });
  return NextResponse.json({ success: true });
}
