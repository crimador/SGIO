import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export const dynamic = 'force-dynamic';

function escapeCSV(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(';') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const TYPE_LABELS: Record<string, string> = {
  FACTURE:'Facture', DEVIS:'Devis', AVOIR:'Avoir', PROFORMA:'Pro-forma',
};
const STATUS_LABELS: Record<string, string> = {
  BROUILLON:'Brouillon', EMISE:'Émise', PAYEE:'Payée', ANNULEE:'Annulée',
};

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period'); // YYYY-MM
  const year   = searchParams.get('year');   // YYYY

  let dateFilter: any = {};
  let label = format(new Date(), 'yyyy');

  if (period) {
    const [y, m] = period.split('-').map(Number);
    const d = new Date(y, m - 1, 1);
    dateFilter = { issueDate: { gte: startOfMonth(d), lte: endOfMonth(d) } };
    label = period;
  } else if (year) {
    const d = new Date(parseInt(year), 0, 1);
    dateFilter = { issueDate: { gte: startOfYear(d), lte: endOfYear(d) } };
    label = year;
  }

  const docs = await prismadb.billingDocument.findMany({
    where:   dateFilter,
    orderBy: { issueDate: 'desc' },
    include: {
      crmAccount:       { select: { name: true } },
      occasionalClient: { select: { name: true } },
      payments:         { select: { amount: true } },
    },
  });

  const headers = [
    'Numéro', 'Type', 'Client', 'Date émission', 'Date échéance',
    'Montant HT (FCFA)', 'TVA (FCFA)', 'Montant TTC (FCFA)',
    'Montant encaissé (FCFA)', 'Reste dû (FCFA)', 'Statut',
  ];

  const rows = docs.map(d => {
    const client   = d.crmAccount?.name ?? d.occasionalClient?.name ?? '—';
    const encaisse = d.payments.reduce((s, p) => s + p.amount, 0);
    const resteDu  = Math.max(0, d.totalTTC - encaisse);
    const effStatus = d.status === 'EMISE' && d.dueDate && new Date(d.dueDate) < new Date()
      ? 'EN RETARD' : (STATUS_LABELS[d.status] ?? d.status);
    return [
      escapeCSV(d.number),
      escapeCSV(TYPE_LABELS[d.type] ?? d.type),
      escapeCSV(client),
      escapeCSV(d.issueDate ? format(new Date(d.issueDate), 'dd/MM/yyyy') : ''),
      escapeCSV(d.dueDate   ? format(new Date(d.dueDate),   'dd/MM/yyyy') : ''),
      escapeCSV(d.totalHT),
      escapeCSV(d.totalTVA),
      escapeCSV(d.totalTTC),
      escapeCSV(encaisse),
      escapeCSV(resteDu),
      escapeCSV(effStatus),
    ].join(';');
  });

  const csv = '﻿' + [headers.join(';'), ...rows].join('\n');
  const filename = `Factures_${label}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
