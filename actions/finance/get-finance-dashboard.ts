import { prismadb } from '@/lib/prisma';

export async function getFinanceDashboard() {
  const now         = new Date();
  const monthStart  = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [paidInvoices, unpaidInvoices, expenses, recentDocs, treasuryAccounts] =
    await Promise.all([
      prismadb.billingDocument.findMany({
        where:  { type: 'FACTURE', status: 'PAYEE', paidAt: { gte: sixMonthsAgo } },
        select: { paidAt: true, totalTTC: true },
      }),
      prismadb.billingDocument.findMany({
        where:  { type: 'FACTURE', status: 'EMISE' },
        select: { totalTTC: true, dueDate: true, payments: { select: { amount: true } } },
      }),
      prismadb.expense.findMany({
        where:  { date: { gte: sixMonthsAgo } },
        select: { date: true, amount: true, category: true },
      }),
      prismadb.billingDocument.findMany({
        take:    6,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, number: true, type: true, status: true,
          totalTTC: true, issueDate: true, dueDate: true,
          crmAccount:       { select: { name: true } },
          occasionalClient: { select: { name: true } },
        },
      }),
      prismadb.treasuryAccount.findMany({
        where:   { isActive: true },
        include: { entries: { select: { type: true, amount: true } } },
      }),
    ]);

  // ── Solde global de trésorerie ──────────────────────────────────────────────
  const soldeGlobal = treasuryAccounts.reduce((total, acc) => {
    return total + acc.entries.reduce(
      (s, e) => (e.type === 'ENTREE' ? s + e.amount : s - e.amount),
      0
    );
  }, 0);

  // ── KPIs du mois ────────────────────────────────────────────────────────────
  const caMois = paidInvoices
    .filter((i) => i.paidAt && new Date(i.paidAt) >= monthStart)
    .reduce((s, i) => s + i.totalTTC, 0);

  const depensesMois = expenses
    .filter((e) => new Date(e.date) >= monthStart)
    .reduce((s, e) => s + e.amount, 0);

  const totalImpayes = unpaidInvoices.reduce((s, i) => {
    const paid = i.payments.reduce((p, pmt) => p + pmt.amount, 0);
    return s + Math.max(0, i.totalTTC - paid);
  }, 0);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const countEnRetard = unpaidInvoices.filter(
    (i) => i.dueDate && new Date(i.dueDate) < today
  ).length;

  // ── Données mensuelles (6 mois glissants) ───────────────────────────────────
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d     = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const end   = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const label = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });

    const ca  = paidInvoices
      .filter((inv) => inv.paidAt && new Date(inv.paidAt) >= d && new Date(inv.paidAt) < end)
      .reduce((s, inv) => s + inv.totalTTC, 0);

    const dep = expenses
      .filter((e) => new Date(e.date) >= d && new Date(e.date) < end)
      .reduce((s, e) => s + e.amount, 0);

    return { mois: label, Encaissements: Math.round(ca), Dépenses: Math.round(dep) };
  });

  // ── Répartition dépenses par catégorie ──────────────────────────────────────
  const byCategory: Record<string, number> = {};
  for (const e of expenses) {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  }
  const totalExp = Object.values(byCategory).reduce((s, v) => s + v, 0);
  const topCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([category, amount]) => ({
      category,
      amount:  Math.round(amount),
      pct:     totalExp > 0 ? Math.round((amount / totalExp) * 100) : 0,
    }));

  return {
    kpis: {
      soldeGlobal:   Math.round(soldeGlobal),
      caMois:        Math.round(caMois),
      depensesMois:  Math.round(depensesMois),
      totalImpayes:  Math.round(totalImpayes),
      countEnRetard,
    },
    monthlyData,
    topCategories,
    recentDocs: recentDocs.map((d) => ({
      id:         d.id,
      number:     d.number,
      type:       d.type,
      status:     d.status,
      totalTTC:   d.totalTTC,
      issueDate:  d.issueDate.toISOString(),
      dueDate:    d.dueDate ? d.dueDate.toISOString() : null,
      clientName: d.crmAccount?.name ?? d.occasionalClient?.name ?? '—',
    })),
  };
}
