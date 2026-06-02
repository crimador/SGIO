import { prismadb } from '@/lib/prisma';

export const getTeamDetail = async (teamId: string) => {
  const team = await prismadb.teams.findUnique({
    where: { id: teamId },
    include: {
      members: true,
      responsible: { select: { id: true, firstName: true, lastName: true, position: true } },
      TeamTask: {
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
          TaskComments: {
            include: {
              employee: { select: { firstName: true, lastName: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      TeamMessage: {
        include: {
          from: { select: { id: true, firstName: true, lastName: true, photo: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
  return team;
};
