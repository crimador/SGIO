import { NextResponse } from 'next/server';
import { prismadb } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: { teamId: string; taskId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json('Non autorisé', { status: 401 });

  const body = await req.json();
  const teamTask = await prismadb.teamTask.update({
    where: { id: params.taskId },
    data: body,
  });
  return NextResponse.json(teamTask);
}

export async function DELETE(_req: Request, { params }: { params: { teamId: string; taskId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json('Non autorisé', { status: 401 });

  await prismadb.teamTask.delete({ where: { id: params.taskId } });
  return NextResponse.json({ success: true });
}
