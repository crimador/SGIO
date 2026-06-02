import { NextResponse } from 'next/server';
import { prismadb } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: Request,
  { params }: { params: { employeeId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const { photo } = await req.json();
  if (!photo) return new NextResponse('Missing photo URL', { status: 400 });

  try {
    await prismadb.employee.update({
      where: { id: params.employeeId },
      data:  { photo },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log('[EMPLOYEE_PATCH]', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}