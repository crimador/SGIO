import { prismadb } from '@/lib/prisma';

export async function getBillingDocument(id: string) {
  return prismadb.billingDocument.findUnique({
    where: { id },
    include: {
      crmAccount:       { select: { id: true, name: true, nif: true, billing_street: true, billing_city: true } },
      occasionalClient: true,
      lines:            { orderBy: { position: 'asc' } },
      sourceQuote:      { select: { id: true, number: true } },
      creditedInvoice:  { select: { id: true, number: true, issueDate: true } },
      creditNotes:      { select: { id: true, number: true, totalTTC: true, creditNoteMode: true, creditNoteMotif: true } },
    },
  });
}

export type BillingDocumentDetail = NonNullable<Awaited<ReturnType<typeof getBillingDocument>>>;
