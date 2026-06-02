import { prismadb } from '@/lib/prisma';

export const getSchedules = async () => {
  const data = await prismadb.schedule.findMany({
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  });
  return data;
};
