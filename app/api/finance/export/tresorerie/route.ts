import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  BANQUE:       'Banque',
  CAISSE:       'Caisse',
  MOBILE_MONEY: 'Mobile Money',
};

const ENTRY_TYPE_LABELS: Record<string, string> = {
  ENTREE: 'Entrée',
  SORTIE: 'Sortie',
};

const PAYMENT_LABELS: Record<string, string> = {
  VIREMENT: 'Virement',
  ESPECES:  'Espèces',
  FLOOZ:    'Flooz (Moov)',
  T_MONEY:  'T-Money (Togocel)',
};

function escapeCsv(value: string | null | undefined): string {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(';') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function fmtDate(d: Date | string | null): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-FR');
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const { searchParams } = new URL(req.url);
  const debut   = searchParams.get('debut');
  const fin     = searchParams.get('fin');
  const compte  = searchParams.get('compte') ?? 'ALL';

  const where: Record<string, unknown> = {};
  if (debut && fin) {
    where.date = { gte: new Date(debut), lte: new Date(`${fin}T23:59:59`) };
  }
  if (compte !== 'ALL') {
    where.accountId = compte;
  }

  const entries = await prismadb.treasuryEntry.findMany({
    where,
    include: { account: { select: { name: true, type: true } } },
    orderBy: { date: 'asc' },
  });

  const headers = [
    'Date', 'Compte', 'Type de compte', 'Type de mouvement',
    'Montant (FCFA)', 'Description',
    'Mode de paiement', 'Référence',
  ];

  const rows = entries.map((e) => [
    fmtDate(e.date),
    e.account.name,
    ACCOUNT_TYPE_LABELS[e.account.type] ?? e.account.type,
    ENTRY_TYPE_LABELS[e.type] ?? e.type,
    Math.round(e.amount).toString(),
    e.description,
    PAYMENT_LABELS[e.paymentMethod] ?? e.paymentMethod,
    e.reference ?? '',
  ].map(escapeCsv));

  // Ligne de total
  const totalEntrees = entries.filter((e) => e.type === 'ENTREE').reduce((s, e) => s + e.amount, 0);
  const totalSorties = entries.filter((e) => e.type === 'SORTIE').reduce((s, e) => s + e.amount, 0);
  const totalRow = [
    '', '', '', 'TOTAL',
    '', '', '', '',
  ];
  const totalEntreeRow = ['', '', '', 'Total entrées', Math.round(totalEntrees).toString(), '', '', ''];
  const totalSortieRow = ['', '', '', 'Total sorties', Math.round(totalSorties).toString(), '', '', ''];
  const soldeRow       = ['', '', '', 'Solde net',    Math.round(totalEntrees - totalSorties).toString(), '', '', ''];

  const csv = [
    headers.map(escapeCsv).join(';'),
    ...rows.map((r) => r.join(';')),
    totalRow.map(escapeCsv).join(';'),
    totalEntreeRow.map(escapeCsv).join(';'),
    totalSortieRow.map(escapeCsv).join(';'),
    soldeRow.map(escapeCsv).join(';'),
  ].join('\r\n');

  const BOM = '﻿';
  const filename = `tresorerie_${debut ?? 'tout'}_${fin ?? 'tout'}.csv`;

  return new NextResponse(BOM + csv, {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
