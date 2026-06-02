import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import { renderToBuffer } from '@react-pdf/renderer';
import { StatementPDF } from '@/app/[locale]/(routes)/finance/releve/[accountId]/StatementPDF';
import React from 'react';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { accountId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const account = await prismadb.crm_Accounts.findUnique({
    where: { id: params.accountId },
    select: {
      id: true, name: true, nif: true,
      billing_street: true, billing_city: true,
      email: true, office_phone: true,
    },
  });
  if (!account) return new NextResponse('Not found', { status: 404 });

  const [docs, cabinet] = await Promise.all([
    prismadb.billingDocument.findMany({
      where: { crmAccountId: params.accountId, type: { in: ['FACTURE', 'AVOIR'] } },
      include: { lines: { orderBy: { position: 'asc' } } },
      orderBy: { issueDate: 'asc' },
    }),
    prismadb.myAccount.findFirst(),
  ]);

  // Build entries (same logic as getClientStatement)
  type RawEntry = { date: string; ref: string; label: string; entryType: string; debit: number; credit: number };
  const rawEntries: RawEntry[] = [];

  for (const doc of docs) {
    if (doc.type === 'FACTURE') {
      const label = doc.lines.map((l) => l.designation).join(', ') || 'Facture';
      rawEntries.push({ date: doc.issueDate.toISOString(), ref: doc.number, label, entryType: 'FACTURE', debit: doc.totalTTC, credit: 0 });
      if (doc.status === 'PAYEE' && doc.paidAt) {
        rawEntries.push({
          date: doc.paidAt.toISOString(),
          ref: `RGL/${doc.number}`,
          label: `Règlement — ${doc.number}`,
          entryType: 'REGLEMENT', debit: 0, credit: doc.totalTTC,
        });
      }
    } else if (doc.type === 'AVOIR') {
      const label = doc.lines.map((l) => l.designation).join(', ') || 'Avoir';
      rawEntries.push({ date: doc.issueDate.toISOString(), ref: doc.number, label, entryType: 'AVOIR', debit: 0, credit: doc.totalTTC });
    }
  }

  rawEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let running = 0;
  const entries = rawEntries.map((e) => {
    running += e.debit - e.credit;
    return { ...e, balance: running };
  });

  const totalDebit  = entries.reduce((s, e) => s + e.debit,  0);
  const totalCredit = entries.reduce((s, e) => s + e.credit, 0);

  const buffer = await renderToBuffer(
    React.createElement(StatementPDF, {
      account: {
        name: account.name,
        nif: account.nif,
        billing_street: account.billing_street,
        billing_city: account.billing_city,
        email: account.email,
        office_phone: account.office_phone,
      },
      entries,
      totalDebit,
      totalCredit,
      solde: totalDebit - totalCredit,
      cabinet: cabinet ? {
        company_name: cabinet.company_name,
        VAT_number:   cabinet.VAT_number,
        TAX_number:   cabinet.TAX_number,
        street:       cabinet.street,
        city:         cabinet.city,
        phone:        cabinet.phone,
        email:        cabinet.email,
      } : null,
      generatedAt: new Date().toISOString(),
    })
  );

  const filename = `releve-${account.name.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;

  return new NextResponse(buffer, {
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
