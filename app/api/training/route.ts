import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const data = await prismadb.training.findMany({
    include: {
      employee: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
    orderBy: { date: 'desc' },
  });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });
  if (!['DG', 'RH'].includes(session.user.userRole))
    return new NextResponse('Forbidden', { status: 403 });

  const { employeeID, type, date, time } = await req.json();

  if (!employeeID || !type || !date || !time)
    return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 });

  const training = await prismadb.training.create({
    data: {
      employeeID,
      type,
      date: new Date(date),
      time: new Date(time),
    },
    include: {
      employee: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  return NextResponse.json(training, { status: 201 });
}
