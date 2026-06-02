import { prismadb } from '@/lib/prisma';

export const getTrainings = async () => {
  return prismadb.training.findMany({
    include: {
      employee: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
    orderBy: { date: 'desc' },
  });
};
