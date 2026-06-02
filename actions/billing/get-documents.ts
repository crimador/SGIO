import { prismadb } from '@/lib/prisma';
import type { BillingDocumentType } from '@prisma/client';

export async function getBillingDocuments(type?: BillingDocumentType) {
  return prismadb.billingDocument.findMany({
    where: type ? { type } : undefined,
    include: {
      crmAccount:      { select: { id: true, name: true, nif: true } },
      occasionalClient: { select: { id: true, name: true, nif: true } },
      _count: { select: { lines: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}
