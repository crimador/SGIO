import { prismadb } from '@/lib/prisma';

export const getPayslips = async (employeeId?: string) => {
  const data = await (prismadb as any).paySlip.findMany({
    where: employeeId ? { employeeID: employeeId } : undefined,
    include: {
      employee: {
        select: { firstName: true, lastName: true, position: true, IBAN: true },
      },
    },
    orderBy: { period: 'desc' },
  });
  return data;
};
