import { NextResponse } from 'next/server';
import { prismadb } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { teamId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json('Non autorisé', { status: 401 });

  const messages = await prismadb.teamMessage.findMany({
    where: { toID: params.teamId },
    include: { from: { select: { id: true, firstName: true, lastName: true, photo: true } } },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(messages);
}

export async function POST(req: Request, { params }: { params: { teamId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json('Non autorisé', { status: 401 });

  const { message } = await req.json();
  if (!message?.trim()) return NextResponse.json('Message vide', { status: 400 });

  const employee = await prismadb.employee.findFirst({
    where: { assigned_to: session.user.id },
  });
  if (!employee) {
    return NextResponse.json(
      'Vous devez avoir un profil employé pour envoyer des messages.',
      { status: 403 }
    );
  }

  const msg = await prismadb.teamMessage.create({
    data: { fromID: employee.id, toID: params.teamId, message: message.trim() },
    include: {
      from: { select: { id: true, firstName: true, lastName: true, photo: true } },
    },
  });
  return NextResponse.json(msg);
}
