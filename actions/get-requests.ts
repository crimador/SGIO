import { prismadb } from '@/lib/prisma';

export const getRequests = async (employeeId?: string) => {
  const data = await (prismadb as any).request.findMany({
    where: employeeId ? { employeeID: employeeId } : undefined,
    include: {
      employee: {
        select: {
          firstName:  true,
          lastName:   true,
          position:   true,
          onBoarding: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return data;
};
