import { prismadb } from '@/lib/prisma';

export const getBoards = async (userId?: string, userRole?: string) => {
  if (!userId && userRole !== 'DG') {
    return null;
  }
  const data = await prismadb.boards.findMany({
    where:
      userRole === 'DG'
        ? undefined
        : {
            OR: [
              {
                user: userId,
              },
              {
                visibility: 'public',
              },
            ],
          },
    include: {
      assigned_user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
  return data;
};
