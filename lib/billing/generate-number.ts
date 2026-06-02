import { prismadb } from '@/lib/prisma';
import type { BillingDocumentType } from '@prisma/client';

const PREFIXES: Record<BillingDocumentType, string> = {
  DEVIS: 'DEV',
  FACTURE: 'FAC',
  AVOIR: 'AVOIR',
};

/**
 * Génère un numéro unique séquentiel pour un document de facturation.
 * Format : FAC/05/2026/001
 * Doit être appelé dans une transaction Prisma pour éviter les doublons.
 */
export async function generateDocumentNumber(
  type: BillingDocumentType,
  tx: typeof prismadb = prismadb
): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const sequence = await (tx as any).billingSequence.upsert({
    where: { type_year_month: { type, year, month } },
    create: { type, year, month, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
  });

  const pad = String(sequence.lastNumber).padStart(3, '0');
  const mm = String(month).padStart(2, '0');
  return `${PREFIXES[type]}/${mm}/${year}/${pad}`;
}
