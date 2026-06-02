import { NextResponse } from 'next/server';
import { prismadb } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json('Non autorisé', { status: 401 });

  const teams = await prismadb.teams.findMany({
    include: {
      members: { select: { id: true, firstName: true, lastName: true, photo: true, position: true } },
      TeamTask: { select: { id: true, done: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(teams);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json('Non autorisé', { status: 401 });
  if (session.user.userRole !== 'DG') return new NextResponse('Forbidden', { status: 403 });

  const { name } = await req.json();
  if (!name || name.trim().length < 2) {
    return NextResponse.json('Le nom doit contenir au moins 2 caractères', { status: 400 });
  }

  const team = await prismadb.teams.create({ data: { name: name.trim() } });
  return NextResponse.json(team);
}
