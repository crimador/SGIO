import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import { format, startOfYear, endOfYear } from 'date-fns';

function escapeCSV(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(';') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const TYPE_LABELS: Record<string, string> = {
  Vacation:'Congé annuel', Leave:'Congé exceptionnel', Sick:'Arrêt maladie',
  Training:'Formation', Raise:'Augmentation', Documents:'Documents', Other:'Autre',
};
const STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE:'En attente', APPROUVE:'Approuvé', REJETE:'Rejeté',
};

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const { searchParams } = new URL(req.url);
  const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();

  const requests = await (prismadb as any).request.findMany({
    where: {
      createdAt: {
        gte: startOfYear(new Date(year, 0, 1)),
        lte: endOfYear(new Date(year, 0, 1)),
      },
    },
    include: {
      employee: { select: { firstName: true, lastName: true, position: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const headers = [
    'Date', 'Nom', 'Prénom', 'Poste', 'Type de demande',
    'Statut', 'Date début', 'Date fin', 'Nombre de jours',
    'Montant demandé (FCFA)', 'Motif',
  ];

  const rows = requests.map((r: any) => [
    escapeCSV(format(new Date(r.createdAt), 'dd/MM/yyyy')),
    escapeCSV(r.employee.lastName),
    escapeCSV(r.employee.firstName),
    escapeCSV(r.employee.position),
    escapeCSV(TYPE_LABELS[r.type] ?? r.type),
    escapeCSV(STATUS_LABELS[r.status] ?? r.status),
    escapeCSV(r.startDate ? format(new Date(r.startDate), 'dd/MM/yyyy') : ''),
    escapeCSV(r.endDate   ? format(new Date(r.endDate),   'dd/MM/yyyy') : ''),
    escapeCSV(r.numberOfDays),
    escapeCSV(r.requestedAmount),
    escapeCSV(r.message),
  ].join(';'));

  const csv = '﻿' + [headers.join(';'), ...rows].join('\n');
  const filename = `Conges_Demandes_${year}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
