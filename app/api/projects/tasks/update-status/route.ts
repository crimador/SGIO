import { NextResponse } from 'next/server';
import { prismadb } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const { taskId, taskStatus } = await req.json();

  if (!taskId || !taskStatus) {
    return new NextResponse('Missing taskId or taskStatus', { status: 400 });
  }

  const validStatuses = ['ACTIVE', 'PENDING', 'COMPLETE'];
  if (!validStatuses.includes(taskStatus)) {
    return new NextResponse('Invalid taskStatus', { status: 400 });
  }

  try {
    await prismadb.tasks.update({
      where: { id: taskId },
      data: { taskStatus, updatedBy: session.user.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[UPDATE_TASK_STATUS]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
