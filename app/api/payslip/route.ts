import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  try {
    const payslips = await (prismadb as any).paySlip.findMany({
      include: {
        employee: {
          select: { firstName: true, lastName: true, position: true, IBAN: true },
        },
      },
      orderBy: { period: 'desc' },
    });
    return NextResponse.json(payslips);
  } catch (error) {
    console.log('[PAYSLIP_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  try {
    const body = await req.json();
    const { employeeID, period, baseSalary, bonuses, deductions, notes } = body;

    if (!employeeID) return new NextResponse('employeeID requis', { status: 400 });
    if (!period) return new NextResponse('period requis', { status: 400 });
    if (baseSalary === undefined) return new NextResponse('baseSalary requis', { status: 400 });

    const base = Number(baseSalary);
    const bon  = Number(bonuses   ?? 0);
    const ded  = Number(deductions ?? 0);
    const net  = base + bon - ded;

    const payslip = await (prismadb as any).paySlip.create({
      data: {
        employeeID,
        period,
        baseSalary:  base,
        bonuses:     bon,
        deductions:  ded,
        cnssEmployee: 0,
        cnssEmployer: 0,
        netSalary:   net,
        notes: notes ?? null,
        status: 'BROUILLON',
      },
      include: {
        employee: {
          select: { firstName: true, lastName: true, position: true },
        },
      },
    });

    return NextResponse.json(payslip, { status: 201 });
  } catch (error) {
    console.log('[PAYSLIP_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
