import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const STATUS_LABELS: Record<string, string> = {
  BROUILLON: 'Brouillon',
  EMISE:     'Émise',
  PAYEE:     'Payée',
  ANNULEE:   'Annulée',
};

const REGIME_LABELS: Record<string, string> = {
  NORMAL:  'Assujetti TVA (18%)',
  EXONERE: 'Exonéré de TVA',
  TPU:     'Régime TPU',
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

function fmtNum(n: number): string {
  return Math.round(n).toString();
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const { searchParams } = new URL(req.url);
  const debut = searchParams.get('debut');
  const fin   = searchParams.get('fin');
  const type  = searchParams.get('type') ?? 'ALL';

  const where: Record<string, unknown> = {};
  if (debut && fin) {
    where.issueDate = { gte: new Date(debut), lte: new Date(`${fin}T23:59:59`) };
  }
  if (type !== 'ALL') {
    where.type = type;
  }

  const docs = await prismadb.billingDocument.findMany({
    where,
    include: {
      crmAccount:       { select: { name: true, nif: true } },
      occasionalClient: { select: { name: true, nif: true } },
    },
    orderBy: { issueDate: 'asc' },
  });

  const headers = [
    'N° Document', 'Type', 'Statut', 'Date émission', 'Date échéance',
    'Client', 'NIF Client',
    'Régime TVA', 'Taux TVA (%)',
    'Base HT (FCFA)', 'TVA (FCFA)', 'Total TTC (FCFA)',
    'Mode de paiement', 'Date de paiement',
  ];

  const rows = docs.map((d) => {
    const clientName = d.crmAccount?.name ?? d.occasionalClient?.name ?? '';
    const clientNif  = d.crmAccount?.nif  ?? d.occasionalClient?.nif  ?? '';
    return [
      d.number,
      d.type,
      STATUS_LABELS[d.status]  ?? d.status,
      fmtDate(d.issueDate),
      fmtDate(d.dueDate),
      clientName,
      clientNif,
      REGIME_LABELS[d.tvaRegime] ?? d.tvaRegime,
      d.tvaRate.toString(),
      fmtNum(d.totalHT),
      fmtNum(d.totalTVA),
      fmtNum(d.totalTTC),
      d.paymentMethod ? (PAYMENT_LABELS[d.paymentMethod] ?? d.paymentMethod) : '',
      fmtDate(d.paidAt),
    ].map(escapeCsv);
  });

  const csv = [
    headers.map(escapeCsv).join(';'),
    ...rows.map((r) => r.join(';')),
  ].join('\r\n');

  const BOM = '﻿';
  const filename = `facturation_${debut ?? 'tout'}_${fin ?? 'tout'}.csv`;

  return new NextResponse(BOM + csv, {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
