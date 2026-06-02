import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';

const CATEGORY_LABELS: Record<string, string> = {
  LOYER:         'Loyer et charges locatives',
  HONORAIRES:    'Honoraires et services',
  TRANSPORT:     'Transport et déplacements',
  FOURNITURES:   'Fournitures de bureau',
  COMMUNICATION: 'Téléphone et internet',
  BANQUE:        'Frais bancaires',
  IMPOTS:        'Impôts et taxes',
  SALAIRES:      'Salaires et charges sociales',
  PUBLICITE:     'Publicité et communication',
  MAINTENANCE:   'Entretien et réparations',
  AUTRES:        'Autres dépenses',
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
  const debut     = searchParams.get('debut');
  const fin       = searchParams.get('fin');
  const categorie = searchParams.get('categorie') ?? 'ALL';

  const where: Record<string, unknown> = {};
  if (debut && fin) {
    where.date = { gte: new Date(debut), lte: new Date(`${fin}T23:59:59`) };
  }
  if (categorie !== 'ALL') {
    where.category = categorie;
  }

  const expenses = await prismadb.expense.findMany({
    where,
    include: {
      treasuryAccount: { select: { name: true } },
      account:         { select: { name: true } },
    },
    orderBy: { date: 'asc' },
  });

  const headers = [
    'Date', 'Description', 'Catégorie',
    'Montant (FCFA)', 'Mode de paiement',
    'Compte de trésorerie', 'Client/Fournisseur',
  ];

  const rows = expenses.map((e) => [
    fmtDate(e.date),
    e.description,
    CATEGORY_LABELS[e.category] ?? e.category,
    Math.round(e.amount).toString(),
    PAYMENT_LABELS[e.paymentMethod] ?? e.paymentMethod,
    e.treasuryAccount?.name ?? '',
    e.account?.name ?? '',
  ].map(escapeCsv));

  const csv = [
    headers.map(escapeCsv).join(';'),
    ...rows.map((r) => r.join(';')),
  ].join('\r\n');

  const BOM = '﻿';
  const filename = `depenses_${debut ?? 'tout'}_${fin ?? 'tout'}.csv`;

  return new NextResponse(BOM + csv, {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
