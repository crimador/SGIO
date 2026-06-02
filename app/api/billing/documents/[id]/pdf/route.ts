import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePDF } from '@/app/[locale]/(routes)/finance/invoices/[id]/components/InvoicePDF';
import React from 'react';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const [doc, cabinet] = await Promise.all([
    prismadb.billingDocument.findUnique({
      where: { id: params.id },
      include: {
        lines:            { orderBy: { position: 'asc' } },
        crmAccount:       { select: { name: true, nif: true, rccm: true, billing_street: true, billing_city: true } },
        occasionalClient: true,
        creditedInvoice:  { select: { number: true, issueDate: true } },
        sourceQuote:      { select: { number: true } },
      },
    }),
    prismadb.myAccount.findFirst(),
  ]);

  if (!doc) return new NextResponse('Not found', { status: 404 });

  if (!cabinet?.company_name) {
    return NextResponse.json(
      { error: 'Les paramètres de votre entreprise (nom, NIF, RCCM) ne sont pas configurés. Rendez-vous dans Paramètres → Mon entreprise avant de générer un PDF.' },
      { status: 400 }
    );
  }

  const buffer = await renderToBuffer(
    React.createElement(InvoicePDF, {
      doc: {
        number:                 doc.number,
        type:                   doc.type,
        issueDate:              doc.issueDate.toISOString(),
        dueDate:                doc.dueDate?.toISOString() ?? null,
        tvaRegime:              doc.tvaRegime,
        tvaRate:                doc.tvaRate,
        totalHT:                doc.totalHT,
        totalTVA:               doc.totalTVA,
        totalTTC:               doc.totalTTC,
        notes:                  doc.notes,
        lines:                  doc.lines,
        crmAccount:             doc.crmAccount,
        occasionalClient:       doc.occasionalClient,
        creditedInvoiceNumber:  doc.creditedInvoice?.number ?? null,
        creditedInvoiceDate:    doc.creditedInvoice?.issueDate?.toISOString() ?? null,
        creditNoteMode:         doc.creditNoteMode ?? null,
        creditNoteMotif:        doc.creditNoteMotif ?? null,
        quoteNumber:            doc.sourceQuote?.number ?? null,
      },
      cabinet: cabinet ? {
        company_name: cabinet.company_name,
        VAT_number:   cabinet.VAT_number,
        TAX_number:   cabinet.TAX_number,
        street:       cabinet.street,
        city:         cabinet.city,
        phone:        cabinet.phone,
        mobile:       cabinet.mobile,
        email:        cabinet.email,
        website:      cabinet.website,
        services:     cabinet.services,
        logoUrl:      cabinet.logoUrl,
        signer_name:  cabinet.signer_name,
        signer_title: cabinet.signer_title,
      } : null,
    })
  );

  return new NextResponse(buffer, {
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${doc.number}.pdf"`,
    },
  });
}
