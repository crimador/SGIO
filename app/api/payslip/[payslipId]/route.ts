import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(
  req: Request,
  { params }: { params: { payslipId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  try {
    const body = await req.json();
    const { status, baseSalary, bonuses, deductions, notes } = body;

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    if (baseSalary !== undefined) {
      updateData.baseSalary = Number(baseSalary);
      updateData.bonuses = Number(bonuses ?? 0);
      updateData.deductions = Number(deductions ?? 0);
      updateData.netSalary =
        Number(baseSalary) + Number(bonuses ?? 0) - Number(deductions ?? 0);
    }

    const payslip = await (prismadb as any).paySlip.update({
      where: { id: params.payslipId },
      data: updateData,
      include: {
        employee: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json(payslip);
  } catch (error) {
    console.log('[PAYSLIP_PUT]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { payslipId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  try {
    await (prismadb as any).paySlip.delete({
      where: { id: params.payslipId },
    });
    return NextResponse.json({ message: 'Bulletin supprimé' });
  } catch (error) {
    console.log('[PAYSLIP_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
