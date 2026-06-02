import { prismadb } from '@/lib/prisma';

export const getTeams = async () => {
  const teams = await prismadb.teams.findMany({
    include: {
      members: {
        select: { id: true, firstName: true, lastName: true, photo: true, position: true },
      },
      responsible: { select: { id: true, firstName: true, lastName: true } },
      TeamTask: { select: { id: true, done: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return teams;
};
