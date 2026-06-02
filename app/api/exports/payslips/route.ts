import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

function escapeCSV(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(';') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const MONTHS_FR: Record<string, string> = {
  '01':'Janvier','02':'Février','03':'Mars','04':'Avril',
  '05':'Mai','06':'Juin','07':'Juillet','08':'Août',
  '09':'Septembre','10':'Octobre','11':'Novembre','12':'Décembre',
};

const STATUS_LABELS: Record<string, string> = {
  BROUILLON: 'Brouillon', EMIS: 'Émis', PAYE: 'Payé',
};

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period'); // format YYYY-MM

  const where = period ? { period } : {};

  const payslips = await (prismadb as any).paySlip.findMany({
    where,
    include: {
      employee: { select: { firstName: true, lastName: true, position: true } },
    },
    orderBy: [{ period: 'desc' }, { employee: { lastName: 'asc' } }],
  });

  const headers = [
    'Période', 'Nom', 'Prénom', 'Poste',
    'Salaire de base (FCFA)', 'Primes (FCFA)', 'Retenues (FCFA)', 'Net à payer (FCFA)',
    'Statut', 'Notes',
  ];

  const rows = payslips.map((p: any) => {
    const [year, month] = p.period.split('-');
    const periodLabel   = `${MONTHS_FR[month] ?? month} ${year}`;
    return [
      escapeCSV(periodLabel),
      escapeCSV(p.employee.lastName),
      escapeCSV(p.employee.firstName),
      escapeCSV(p.employee.position),
      escapeCSV(p.baseSalary),
      escapeCSV(p.bonuses),
      escapeCSV(p.deductions),
      escapeCSV(p.netSalary),
      escapeCSV(STATUS_LABELS[p.status] ?? p.status),
      escapeCSV(p.notes),
    ].join(';');
  });

  const csv = '﻿' + [headers.join(';'), ...rows].join('\n');
  const label   = period ? period : format(new Date(), 'yyyy');
  const filename = `Bulletins_${label}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
