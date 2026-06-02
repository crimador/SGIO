import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import { format } from 'date-fns';

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

  const employees = await prismadb.employee.findMany({
    orderBy: { lastName: 'asc' },
  });

  const headers = [
    'Nom', 'Prénom', 'Email', 'Téléphone', 'Poste',
    'Salaire (FCFA)', 'Date embauche', 'IBAN', 'N° identification',
    'Adresse', 'Assurance',
  ];

  const rows = employees.map(e => [
    escapeCSV(e.lastName),
    escapeCSV(e.firstName),
    escapeCSV(e.email),
    escapeCSV(e.phone),
    escapeCSV(e.position),
    escapeCSV(e.salary),
    escapeCSV(e.onBoarding ? format(new Date(e.onBoarding), 'dd/MM/yyyy') : ''),
    escapeCSV(e.IBAN),
    escapeCSV(e.taxid),
    escapeCSV(e.address),
    escapeCSV(e.insurance),
  ].join(';'));

  const csv = '﻿' + [headers.join(';'), ...rows].join('\n');
  const filename = `Employes_${format(new Date(), 'yyyy-MM-dd')}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
