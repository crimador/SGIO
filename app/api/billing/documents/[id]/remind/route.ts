import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import { InvoiceReminderEmail } from '@/emails/InvoiceReminder';
import React from 'react';

function fmtDate(d: Date | string | null): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtAmount(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const [doc, cabinet] = await Promise.all([
    prismadb.billingDocument.findUnique({
      where: { id: params.id },
      include: {
        crmAccount:       { select: { name: true, email: true } },
        occasionalClient: { select: { name: true, email: true } },
      },
    }),
    prismadb.myAccount.findFirst(),
  ]);

  if (!doc) return new NextResponse('Not found', { status: 404 });
  if (doc.type !== 'FACTURE' || doc.status !== 'EMISE') {
    return NextResponse.json({ error: 'Document non éligible à une relance' }, { status: 400 });
  }

  const clientName  = doc.crmAccount?.name  ?? doc.occasionalClient?.name  ?? '—';
  const clientEmail = doc.crmAccount?.email ?? doc.occasionalClient?.email ?? null;

  if (!clientEmail) {
    return NextResponse.json({ error: 'Aucune adresse email pour ce client' }, { status: 400 });
  }

  const today = new Date(); today.setHours(0, 0, 0, 0);
  let daysOverdue: number | null = null;
  if (doc.dueDate) {
    daysOverdue = Math.floor((today.getTime() - new Date(doc.dueDate).getTime()) / 86_400_000);
  }

  const reminderCount = doc.lastReminderAt ? 2 : 1;

  const cabinetName  = cabinet?.company_name ?? 'Votre cabinet';
  const cabinetPhone = cabinet?.phone        ?? null;
  const cabinetEmail = cabinet?.email        ?? null;

  const subject = reminderCount === 1
    ? `Rappel de paiement — Facture ${doc.number}`
    : `${reminderCount}e rappel — Facture ${doc.number} en attente`;

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    await prismadb.billingDocument.update({
      where: { id: params.id },
      data:  { lastReminderAt: new Date() },
    });
    return NextResponse.json(
      { error: 'Service email non configuré (GMAIL_USER / GMAIL_APP_PASSWORD manquants). La relance a été marquée mais l\'email n\'a pas été envoyé.' },
      { status: 503 }
    );
  }

  try {
    const html = await render(
      React.createElement(InvoiceReminderEmail, {
        clientName,
        invoiceNumber: doc.number,
        invoiceDate:   fmtDate(doc.issueDate),
        dueDate:       doc.dueDate ? fmtDate(doc.dueDate) : null,
        amount:        fmtAmount(doc.totalTTC),
        daysOverdue,
        cabinetName,
        cabinetPhone,
        cabinetEmail,
        reminderCount,
      })
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    await transporter.sendMail({
      from:     `${process.env.NEXT_PUBLIC_APP_NAME} <${gmailUser}>`,
      replyTo:  gmailUser,
      to:       clientEmail,
      subject,
      html,
    });

    console.log('[REMIND] Email sent via Gmail to:', clientEmail);

    await prismadb.billingDocument.update({
      where: { id: params.id },
      data:  { lastReminderAt: new Date() },
    });

    return NextResponse.json({ success: true, sentTo: clientEmail });
  } catch (err: any) {
    console.error('[REMIND]', err);
    const detail = err?.message ?? 'Erreur inconnue';
    return NextResponse.json({ error: `Erreur envoi email : ${detail}` }, { status: 500 });
  }
}
