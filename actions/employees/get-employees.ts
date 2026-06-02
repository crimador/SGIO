import { prismadb } from '@/lib/prisma';

export const getEmployeesData = async (employeeId: string) => {
  const [employee, payslips, requests, timekeeping] = await Promise.all([
    prismadb.employee.findFirst({ where: { id: employeeId } }),

    (prismadb as any).paySlip.findMany({
      where:   { employeeID: employeeId },
      orderBy: { period: 'desc' },
    }),

    (prismadb as any).request.findMany({
      where:   { employeeID: employeeId },
      orderBy: { createdAt: 'desc' },
    }),

    prismadb.timekeeping.findMany({
      where:   { employeeID: employeeId },
      orderBy: { timeIn: 'desc' },
    }),
  ]);

  if (!employee) return null;

  return { employee, payslips, requests, timekeeping };
};
