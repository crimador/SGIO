import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import { renderToBuffer } from '@react-pdf/renderer';
import { PayslipPDF } from '@/app/[locale]/(routes)/hr/components/PayslipPDF';
import React from 'react';

export async function GET(
  _req: Request,
  { params }: { params: { payslipId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const [payslip, cabinet] = await Promise.all([
    (prismadb as any).paySlip.findUnique({
      where: { id: params.payslipId },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName:  true,
            position:  true,
            IBAN:      true,
          },
        },
      },
    }),
    prismadb.myAccount.findFirst(),
  ]);

  if (!payslip) return new NextResponse('Not found', { status: 404 });

  const MONTHS_FR: Record<string, string> = {
    '01': 'Janvier', '02': 'Février',  '03': 'Mars',      '04': 'Avril',
    '05': 'Mai',     '06': 'Juin',     '07': 'Juillet',   '08': 'Août',
    '09': 'Septembre','10': 'Octobre', '11': 'Novembre',  '12': 'Décembre',
  };
  const [year, month] = payslip.period.split('-');
  const periodLabel   = `${MONTHS_FR[month] ?? month}_${year}`;
  const employeeName  = `${payslip.employee.firstName}_${payslip.employee.lastName}`;
  const filename      = `Bulletin_${periodLabel}_${employeeName}.pdf`;

  const buffer = await renderToBuffer(
    React.createElement(PayslipPDF, {
      payslip: {
        period:     payslip.period,
        baseSalary: payslip.baseSalary,
        bonuses:    payslip.bonuses,
        deductions: payslip.deductions,
        netSalary:  payslip.netSalary,
        status:     payslip.status,
        notes:      payslip.notes,
        employee: {
          firstName: payslip.employee.firstName,
          lastName:  payslip.employee.lastName,
          position:  payslip.employee.position,
          IBAN:      payslip.employee.IBAN,
        },
      },
      cabinet: cabinet ? {
        company_name: cabinet.company_name,
        VAT_number:   cabinet.VAT_number,
        TAX_number:   cabinet.TAX_number,
        street:       cabinet.street,
        city:         cabinet.city,
        phone:        cabinet.phone,
        email:        cabinet.email,
        logoUrl:      cabinet.logoUrl,
      } : null,
    })
  );

  return new NextResponse(buffer, {
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
