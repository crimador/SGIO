import { prismadb } from '@/lib/prisma';

export async function getUnpaidInvoices() {
  const docs = await prismadb.billingDocument.findMany({
    where: {
      type:   'FACTURE',
      status: 'EMISE',
    },
    include: {
      crmAccount:       { select: { id: true, name: true, nif: true, email: true } },
      occasionalClient: { select: { id: true, name: true, nif: true, email: true } },
      payments:         { select: { amount: true } },
    },
    orderBy: { dueDate: 'asc' },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return docs.map((d) => {
    const due = d.dueDate ? new Date(d.dueDate) : null;
    let daysOverdue: number | null = null;
    if (due) {
      daysOverdue = Math.floor((today.getTime() - due.getTime()) / 86_400_000);
    }
    const amountPaid = d.payments.reduce((s, p) => s + p.amount, 0);
    const amountDue  = Math.max(0, d.totalTTC - amountPaid);
    return {
      id:              d.id,
      number:          d.number,
      issueDate:       d.issueDate.toISOString(),
      dueDate:         d.dueDate?.toISOString() ?? null,
      totalTTC:        d.totalTTC,
      amountPaid,
      amountDue,
      daysOverdue,
      clientName:      d.crmAccount?.name  ?? d.occasionalClient?.name  ?? '—',
      clientEmail:     d.crmAccount?.email ?? d.occasionalClient?.email ?? null,
      crmAccountId:    d.crmAccountId,
      lastReminderAt:  d.lastReminderAt?.toISOString() ?? null,
    };
  });
}
