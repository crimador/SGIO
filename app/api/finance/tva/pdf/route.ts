import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import { renderToBuffer } from '@react-pdf/renderer';
import { getTvaReport, type TvaPeriodType } from '@/actions/finance/get-tva-report';
import { TvaReportPDF } from '@/app/[locale]/(routes)/finance/tva/TvaReportPDF';
import React from 'react';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const { searchParams } = new URL(req.url);
  const periodeParam = searchParams.get('periode') ?? 'mensuel';
  const year         = parseInt(searchParams.get('annee')     ?? new Date().getFullYear().toString(), 10);
  const month        = parseInt(searchParams.get('mois')      ?? (new Date().getMonth() + 1).toString(), 10);
  const quarter      = parseInt(searchParams.get('trimestre') ?? '1', 10);

  const type: TvaPeriodType = periodeParam === 'trimestriel' ? 'TRIMESTRIEL' : 'MENSUEL';

  const [report, cabinet] = await Promise.all([
    getTvaReport(type === 'MENSUEL' ? { type, year, month } : { type, year, quarter }),
    prismadb.myAccount.findFirst(),
  ]);

  const buffer = await renderToBuffer(
    React.createElement(TvaReportPDF, {
      report,
      cabinet: cabinet ? {
        company_name: cabinet.company_name,
        VAT_number:   cabinet.VAT_number,
        TAX_number:   cabinet.TAX_number,
        city:         cabinet.city,
        phone:        cabinet.phone,
        email:        cabinet.email,
      } : null,
    })
  );

  const filename = `rapport-tva-${report.periodLabel.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;

  return new NextResponse(buffer, {
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
