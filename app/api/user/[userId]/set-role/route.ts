import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import type { UserRole } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

const VALID_ROLES: UserRole[] = ['DG', 'COMPTABLE', 'COMMERCIAL', 'RH'];

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });
  if (session.user.userRole !== 'DG') return new NextResponse('Forbidden', { status: 403 });

  const { role } = await req.json();

  if (!VALID_ROLES.includes(role)) {
    return new NextResponse('Invalid role', { status: 400 });
  }

  const updated = await prismadb.users.update({
    where: { id: params.userId },
    data: { userRole: role },
    select: { id: true, name: true, email: true, userRole: true },
  });

  return NextResponse.json(updated);
}
