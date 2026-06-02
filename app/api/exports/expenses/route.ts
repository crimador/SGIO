import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import { format, startOfYear, endOfYear } from 'date-fns';

export const dynamic = 'force-dynamic';

function escapeCSV(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(';') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const { searchParams } = new URL(req.url);
  const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();

  const expenses = await prismadb.expense.findMany({
    where: {
      date: {
        gte: startOfYear(new Date(year, 0, 1)),
        lte: endOfYear(new Date(year, 0, 1)),
      },
    },
    include: {
      account: { select: { name: true } },
    },
    orderBy: { date: 'desc' },
  });

  const headers = ['Date', 'Catégorie', 'Description', 'Montant (FCFA)', 'Compte client'];

  const rows = expenses.map(e => [
    escapeCSV(e.date ? format(new Date(e.date), 'dd/MM/yyyy') : ''),
    escapeCSV(e.category),
    escapeCSV(e.description),
    escapeCSV(e.amount),
    escapeCSV(e.account?.name),
  ].join(';'));

  const csv = '﻿' + [headers.join(';'), ...rows].join('\n');
  const filename = `Depenses_${year}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
