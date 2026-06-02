import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import { renderToBuffer } from '@react-pdf/renderer';
import { ReceiptPDF } from '@/app/[locale]/(routes)/finance/invoices/[id]/components/ReceiptPDF';
import React from 'react';

export async function GET(
  _req: Request,
  { params }: { params: { id: string; paymentId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const [payment, cabinet] = await Promise.all([
    prismadb.billingPayment.findUnique({
      where: { id: params.paymentId },
      include: {
        document: {
          select: {
            id: true,
            number: true,
            totalTTC: true,
            payments: { select: { amount: true } },
            crmAccount: { select: { name: true, nif: true, billing_street: true, billing_city: true } },
            occasionalClient: { select: { name: true, nif: true, address: true, city: true } },
          },
        },
      },
    }),
    prismadb.myAccount.findFirst(),
  ]);

  if (!payment) return new NextResponse('Paiement introuvable', { status: 404 });
  if (payment.document.id !== params.id) {
    return new NextResponse('Ce paiement n\'appartient pas à cette facture', { status: 400 });
  }

  if (!cabinet?.company_name) {
    return NextResponse.json(
      { error: 'Les paramètres de votre entreprise ne sont pas configurés. Rendez-vous dans Paramètres → Mon entreprise.' },
      { status: 400 }
    );
  }

  const doc         = payment.document;
  const totalPaid   = doc.payments.reduce((s, p) => s + p.amount, 0);
  const clientName  = doc.crmAccount?.name ?? doc.occasionalClient?.name ?? 'Client';
  const clientNif   = doc.crmAccount?.nif  ?? doc.occasionalClient?.nif  ?? null;
  const clientAddr  = doc.crmAccount
    ? [doc.crmAccount.billing_street, doc.crmAccount.billing_city].filter(Boolean).join(', ')
    : [doc.occasionalClient?.address, doc.occasionalClient?.city].filter(Boolean).join(', ');

  // Numéro de reçu : REC-[numéro facture]-[index paiement]
  const paymentIndex = doc.payments.findIndex((p: { amount: number }) => p === payment) + 1 ||
    doc.payments.length;
  const receiptNumber = `REC-${doc.number}-${String(paymentIndex).padStart(2, '0')}`;

  const buffer = await renderToBuffer(
    React.createElement(ReceiptPDF, {
      data: {
        receiptNumber,
        paymentDate:   payment.date.toISOString(),
        paymentMethod: payment.paymentMethod,
        amount:        payment.amount,
        notes:         payment.notes,
        invoice: {
          number:    doc.number,
          totalTTC:  doc.totalTTC,
          totalPaid,
        },
        client: {
          name:    clientName,
          nif:     clientNif,
          address: clientAddr || null,
        },
      },
      cabinet: {
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
      },
    })
  );

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${receiptNumber}.pdf"`,
    },
  });
}
