import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import dayjs from 'dayjs';

export async function getProjectsDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const userId = session.user.id;
  const today = new Date();
  const nextWeek = dayjs().add(7, 'day').endOf('day').toDate();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  // Boards accessibles par l'utilisateur
  const boards = await prismadb.boards.findMany({
    where: {
      OR: [{ user: userId }, { visibility: 'public' }],
    },
    select: { id: true, title: true },
  });

  const boardIds = boards.map((b) => b.id);

  // Sections de ces boards
  const sections = await prismadb.sections.findMany({
    where: { board: { in: boardIds } },
    select: { id: true, board: true },
  });

  const sectionIds = sections.map((s) => s.id);

  // Toutes les tâches de ces sections
  const allTasks = await prismadb.tasks.findMany({
    where: { section: { in: sectionIds } },
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
  });

  // KPIs
  const totalBoards = boards.length;
  const totalTasks = allTasks.length;
  const activeTasks = allTasks.filter((t) => t.taskStatus === 'ACTIVE').length;
  const pendingTasks = allTasks.filter((t) => t.taskStatus === 'PENDING').length;
  const completedTasks = allTasks.filter((t) => t.taskStatus === 'COMPLETE').length;

  const overdueTasks = allTasks.filter(
    (t) =>
      t.taskStatus !== 'COMPLETE' &&
      t.dueDateAt &&
      new Date(t.dueDateAt) < today
  );

  const dueSoonTasks = allTasks.filter(
    (t) =>
      t.taskStatus !== 'COMPLETE' &&
      t.dueDateAt &&
      new Date(t.dueDateAt) >= today &&
      new Date(t.dueDateAt) <= nextWeek
  );

  const completedThisMonth = allTasks.filter(
    (t) =>
      t.taskStatus === 'COMPLETE' &&
      t.dueDateAt &&
      new Date(t.dueDateAt) >= monthStart
  ).length;

  // Répartition par priorité (pour graphique)
  const priorityMap: Record<string, number> = {};
  for (const t of allTasks) {
    if (t.taskStatus !== 'COMPLETE') {
      priorityMap[t.priority] = (priorityMap[t.priority] ?? 0) + 1;
    }
  }
  const priorityChart = [
    { name: 'Faible',    count: priorityMap['low']      ?? 0 },
    { name: 'Normale',   count: priorityMap['normal']   ?? 0 },
    { name: 'Moyenne',   count: priorityMap['medium']   ?? 0 },
    { name: 'Haute',     count: priorityMap['high']     ?? 0 },
    { name: 'Critique',  count: priorityMap['critical'] ?? 0 },
  ].filter((d) => d.count > 0);

  // Avancement par projet
  const sectionByBoard: Record<string, string[]> = {};
  for (const s of sections) {
    if (!sectionByBoard[s.board]) sectionByBoard[s.board] = [];
    sectionByBoard[s.board].push(s.id);
  }

  const boardsProgress = boards.map((board) => {
    const boardSectionIds = sectionByBoard[board.id] ?? [];
    const boardTasks = allTasks.filter((t) => t.section && boardSectionIds.includes(t.section));
    const done = boardTasks.filter((t) => t.taskStatus === 'COMPLETE').length;
    const total = boardTasks.length;
    return {
      id: board.id,
      title: board.title,
      total,
      done,
      overdue: boardTasks.filter(
        (t) => t.taskStatus !== 'COMPLETE' && t.dueDateAt && new Date(t.dueDateAt) < today
      ).length,
    };
  }).sort((a, b) => b.total - a.total);

  return {
    totalBoards,
    totalTasks,
    activeTasks,
    pendingTasks,
    completedTasks,
    overdueCount: overdueTasks.length,
    completedThisMonth,
    priorityChart,
    overdueTasks: overdueTasks.slice(0, 6).map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      dueDateAt: t.dueDateAt ? t.dueDateAt.toISOString() : null,
      assignedTo: t.assigned_user?.name ?? null,
    })),
    dueSoonTasks: dueSoonTasks.slice(0, 6).map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      dueDateAt: t.dueDateAt ? t.dueDateAt.toISOString() : null,
      assignedTo: t.assigned_user?.name ?? null,
    })),
    boardsProgress,
  };
}
