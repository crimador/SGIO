import { prismadb } from '@/lib/prisma';

export async function getClientsWithBilling() {
  const accounts = await prismadb.crm_Accounts.findMany({
    where: {
      billingDocuments: { some: { type: { in: ['FACTURE', 'AVOIR'] } } },
    },
    select: {
      id: true,
      name: true,
      nif: true,
      billing_city: true,
      billingDocuments: {
        where: { type: 'FACTURE' },
        select: { totalTTC: true, status: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return accounts.map((acc) => ({
    id: acc.id,
    name: acc.name,
    nif: acc.nif,
    billing_city: acc.billing_city,
    invoiceCount: acc.billingDocuments.length,
    totalFacture: acc.billingDocuments.reduce((s, d) => s + d.totalTTC, 0),
    totalImpaye:  acc.billingDocuments
      .filter((d) => d.status === 'EMISE')
      .reduce((s, d) => s + d.totalTTC, 0),
  }));
}
