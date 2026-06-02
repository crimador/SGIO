import { prismadb } from '@/lib/prisma';

export const getTimekeeping = async () => {
  const data = await prismadb.timekeeping.findMany({
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
      createdAt: 'desc',
    },
  });
  return data;
};
