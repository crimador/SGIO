import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import { format } from 'date-fns';
import { calcLeaveBalance } from '@/lib/leave-balance';

function escapeCSV(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(';') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const [employees, requests] = await Promise.all([
    prismadb.employee.findMany({ orderBy: { lastName: 'asc' } }),
    (prismadb as any).request.findMany({
      where: { type: { in: ['Vacation', 'Leave'] }, status: 'APPROUVE' },
      select: { employeeID: true, type: true, status: true, numberOfDays: true, legalDays: true },
    }),
  ]);

  const headers = [
    'Nom', 'Prénom', 'Poste', 'Date embauche', 'Ancienneté (mois)',
    'Jours acquis', 'Congés annuels pris', 'Congés except. imputés', 'Total déduit', 'Solde restant',
  ];

  const rows = employees.map(emp => {
    const empRequests = requests.filter((r: any) => r.employeeID === emp.id);
    const bal = calcLeaveBalance(emp.onBoarding, empRequests);

    return [
      escapeCSV(emp.lastName),
      escapeCSV(emp.firstName),
      escapeCSV(emp.position),
      escapeCSV(emp.onBoarding ? format(new Date(emp.onBoarding), 'dd/MM/yyyy') : ''),
      escapeCSV(bal?.months ?? ''),
      escapeCSV(bal?.accrued ?? ''),
      escapeCSV(bal?.vacationDays ?? ''),
      escapeCSV(bal?.excessLeaveDays ?? ''),
      escapeCSV(bal?.used ?? ''),
      escapeCSV(bal?.remaining ?? ''),
    ].join(';');
  });

  const csv = '﻿' + [headers.join(';'), ...rows].join('\n');
  const filename = `Solde_Conges_${format(new Date(), 'yyyy-MM-dd')}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
