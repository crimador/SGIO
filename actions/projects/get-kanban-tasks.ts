import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function getKanbanTasks() {
  const session = await getServerSession(authOptions);
  if (!session) return [];

  const userId = session.user.id;

  const boards = await prismadb.boards.findMany({
    where: {
      OR: [{ user: userId }, { visibility: 'public' }],
    },
    select: { id: true, title: true },
  });

  const boardMap = Object.fromEntries(boards.map((b) => [b.id, b.title]));
  const boardIds = boards.map((b) => b.id);

  const sections = await prismadb.sections.findMany({
    where: { board: { in: boardIds } },
    select: { id: true, board: true },
  });

  const sectionToBoardId = Object.fromEntries(sections.map((s) => [s.id, s.board]));
  const sectionIds = sections.map((s) => s.id);

  const tasks = await prismadb.tasks.findMany({
    where: {
      section: { in: sectionIds },
      taskStatus: { not: 'COMPLETE' }, // Exclure les tâches terminées pour alléger
    },
    select: {
      id: true,
      title: true,
      priority: true,
      taskStatus: true,
      dueDateAt: true,
      section: true,
      assigned_user: { select: { name: true } },
    },
    orderBy: { dueDateAt: 'asc' },
    take: 150,
  });

  return tasks.map((t) => ({
    id: t.id,
    title: t.title,
    priority: t.priority,
    taskStatus: t.taskStatus ?? 'ACTIVE',
    dueDateAt: t.dueDateAt ? t.dueDateAt.toISOString() : null,
    assignedTo: t.assigned_user?.name ?? null,
    boardTitle: t.section ? boardMap[sectionToBoardId[t.section]] ?? '—' : '—',
  }));
}
