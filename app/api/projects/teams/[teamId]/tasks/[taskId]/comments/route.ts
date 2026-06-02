import { NextResponse } from 'next/server';
import { prismadb } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { teamId: string; taskId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json('Non autorisé', { status: 401 });

  const task = await prismadb.teamTask.findUnique({
    where: { id: params.taskId },
    include: {
      TaskComments: {
        include: {
          assigned_user: { select: { name: true, image: true } },
          employee: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return NextResponse.json(task?.TaskComments ?? []);
}

export async function POST(req: Request, { params }: { params: { teamId: string; taskId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json('Non autorisé', { status: 401 });

  const { comment } = await req.json();
  if (!comment?.trim()) return NextResponse.json('Commentaire vide', { status: 400 });

  const employee = await prismadb.employee.findFirst({
    where: { assigned_to: session.user.id },
  });
  if (!employee) {
    return NextResponse.json('Profil employé requis pour commenter.', { status: 403 });
  }

  const newComment = await prismadb.tasksComments.create({
    data: {
      comment: comment.trim(),
      task: params.taskId,
      user: session.user.id,
      employeeID: employee.id,
      teamTasks: { connect: { id: params.taskId } },
    },
    include: {
      assigned_user: { select: { name: true, image: true } },
      employee: { select: { firstName: true, lastName: true } },
    },
  });

  return NextResponse.json(newComment);
}
