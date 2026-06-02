import { prismadb } from '@/lib/prisma';

export type StatementEntryType = 'FACTURE' | 'AVOIR' | 'REGLEMENT';

export type StatementEntry = {
  date: string;
  ref: string;
  docId: string;
  label: string;
  entryType: StatementEntryType;
  debit: number;
  credit: number;
  balance: number;
};

export type ClientStatement = {
  account: {
    id: string;
    name: string;
    nif: string | null;
    billing_street: string | null;
    billing_city: string | null;
    email: string | null;
    office_phone: string | null;
  };
  entries: StatementEntry[];
  totalDebit: number;
  totalCredit: number;
  solde: number;
};

export async function getClientStatement(accountId: string): Promise<ClientStatement | null> {
  const account = await prismadb.crm_Accounts.findUnique({
    where: { id: accountId },
    select: {
      id: true,
      name: true,
      nif: true,
      billing_street: true,
      billing_city: true,
      email: true,
      office_phone: true,
    },
  });
  if (!account) return null;

  const docs = await prismadb.billingDocument.findMany({
    where: {
      crmAccountId: accountId,
      type: { in: ['FACTURE', 'AVOIR'] },
    },
    include: {
      lines:    { orderBy: { position: 'asc' } },
      payments: { orderBy: { date: 'asc' } },
    },
    orderBy: { issueDate: 'asc' },
  });

  const rawEntries: Omit<StatementEntry, 'balance'>[] = [];

  for (const doc of docs) {
    if (doc.type === 'FACTURE') {
      const label = doc.lines.map((l) => l.designation).join(', ') || 'Facture';
      rawEntries.push({
        date: doc.issueDate.toISOString(),
        ref: doc.number,
        docId: doc.id,
        label,
        entryType: 'FACTURE',
        debit: doc.totalTTC,
        credit: 0,
      });
      // Acomptes individuels comme lignes de crédit
      for (const p of doc.payments) {
        rawEntries.push({
          date:      p.date.toISOString(),
          ref:       `RGL/${doc.number}`,
          docId:     doc.id,
          label:     `Règlement — ${doc.number}`,
          entryType: 'REGLEMENT' as const,
          debit:     0,
          credit:    p.amount,
        });
      }
      // Si payée sans acomptes trackés (ancienne méthode directe)
      if (doc.status === 'PAYEE' && doc.paidAt && doc.payments.length === 0) {
        rawEntries.push({
          date:      doc.paidAt.toISOString(),
          ref:       `RGL/${doc.number}`,
          docId:     doc.id,
          label:     `Règlement — ${doc.number}`,
          entryType: 'REGLEMENT' as const,
          debit:     0,
          credit:    doc.totalTTC,
        });
      }
    } else if (doc.type === 'AVOIR') {
      const label = doc.lines.map((l) => l.designation).join(', ') || 'Avoir';
      rawEntries.push({
        date: doc.issueDate.toISOString(),
        ref: doc.number,
        docId: doc.id,
        label,
        entryType: 'AVOIR',
        debit: 0,
        credit: doc.totalTTC,
      });
    }
  }

  rawEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let running = 0;
  const entries: StatementEntry[] = rawEntries.map((e) => {
    running += e.debit - e.credit;
    return { ...e, balance: running };
  });

  const totalDebit  = entries.reduce((s, e) => s + e.debit,  0);
  const totalCredit = entries.reduce((s, e) => s + e.credit, 0);

  return { account, entries, totalDebit, totalCredit, solde: totalDebit - totalCredit };
}
