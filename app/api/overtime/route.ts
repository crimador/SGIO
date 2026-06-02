import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import { calcOvertimeForPeriod } from '@/lib/overtime';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const { searchParams } = new URL(req.url);
  const employeeID = searchParams.get('employeeID');
  const period     = searchParams.get('period'); // YYYY-MM

  if (!employeeID || !period) {
    return new NextResponse('employeeID et period requis', { status: 400 });
  }

  const [year, month] = period.split('-').map(Number);
  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 1);

  const timekeeping = await prismadb.timekeeping.findMany({
    where: { employeeID, timeIn: { gte: start, lt: end } },
    orderBy: { timeIn: 'asc' },
  });

  const summary = calcOvertimeForPeriod(timekeeping, period);

  return NextResponse.json(summary);
}
