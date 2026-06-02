import { prismadb } from '@/lib/prisma';

export async function getBillingByAccount(accountId: string) {
  const docs = await prismadb.billingDocument.findMany({
    where:   { crmAccountId: accountId },
    include: { payments: { select: { amount: true } } },
    orderBy: { issueDate: 'desc' },
  });

  let totalFacture  = 0;
  let totalEncaisse = 0;
  let soldeDu       = 0;

  for (const doc of docs) {
    if (doc.type !== 'AVOIR' && doc.status !== 'ANNULEE') {
      const paid = doc.payments.reduce((s, p) => s + p.amount, 0);
      totalFacture  += doc.totalTTC;
      totalEncaisse += doc.status === 'PAYEE' ? doc.totalTTC : paid;
      if (doc.status === 'EMISE') {
        soldeDu += Math.max(0, doc.totalTTC - paid);
      }
    }
  }

  const recentDocs = docs.slice(0, 8).map((d) => {
    const paid = d.payments.reduce((s, p) => s + p.amount, 0);
    return {
      id:         d.id,
      number:     d.number,
      type:       d.type,
      status:     d.status,
      totalTTC:   d.totalTTC,
      amountDue:  d.status === 'EMISE' ? Math.max(0, d.totalTTC - paid) : 0,
      issueDate:  d.issueDate.toISOString(),
      dueDate:    d.dueDate ? d.dueDate.toISOString() : null,
    };
  });

  return {
    totalFacture:  Math.round(totalFacture),
    totalEncaisse: Math.round(totalEncaisse),
    soldeDu:       Math.round(soldeDu),
    countTotal:    docs.filter((d) => d.type === 'FACTURE' && d.status !== 'ANNULEE').length,
    countEmises:   docs.filter((d) => d.type === 'FACTURE' && d.status === 'EMISE').length,
    recentDocs,
  };
}
