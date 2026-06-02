import { prismadb } from '@/lib/prisma';
import { format } from 'date-fns';

export async function getGlobalDashboard() {
  const now        = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixAgo     = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const today      = new Date(); today.setHours(23, 59, 59, 999);

  const [
    // Finance
    paidInvoices,
    unpaidInvoices,
    expenses,
    recentDocs,
    treasuryAccounts,
    // RH
    employees,
    payslipsMois,
    demandesEnAttente,
    timekeepingMois,
    recentRequests,
    // CRM
    accountsCount,
    leadsCount,
    opportunitiesCount,
    opportunitiesBudget,
    // Projets
    boardsCount,
    tasksCount,
  ] = await Promise.all([
    // ── Finance ──────────────────────────────────────────────────────────────
    prismadb.billingDocument.findMany({
      where:  { type: 'FACTURE', status: 'PAYEE', paidAt: { gte: sixAgo } },
      select: { paidAt: true, totalTTC: true },
    }),
    prismadb.billingDocument.findMany({
      where:  { type: 'FACTURE', status: 'EMISE' },
      select: { totalTTC: true, dueDate: true, payments: { select: { amount: true } } },
    }),
    prismadb.expense.findMany({
      where:  { date: { gte: monthStart } },
      select: { amount: true },
    }),
    prismadb.billingDocument.findMany({
      take:    5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, number: true, type: true, status: true,
        totalTTC: true, dueDate: true,
        crmAccount:       { select: { name: true } },
        occasionalClient: { select: { name: true } },
      },
    }),
    prismadb.treasuryAccount.findMany({
      where:   { isActive: true },
      include: { entries: { select: { type: true, amount: true } } },
    }),

    // ── RH ───────────────────────────────────────────────────────────────────
    prismadb.employee.count(),
    (prismadb as any).paySlip.findMany({
      where: {
        period: format(now, 'yyyy-MM'),
        status: { in: ['EMIS', 'PAYE'] },
      },
      select: { netSalary: true },
    }),
    (prismadb as any).request.count({ where: { status: 'EN_ATTENTE' } }),
    prismadb.timekeeping.findMany({
      where:  { timeIn: { gte: monthStart } },
      select: { timeIn: true, timeOut: true },
    }),
    (prismadb as any).request.findMany({
      where:   { status: 'EN_ATTENTE' },
      take:    4,
      orderBy: { createdAt: 'desc' },
      include: { employee: { select: { firstName: true, lastName: true } } },
    }),

    // ── CRM ──────────────────────────────────────────────────────────────────
    prismadb.crm_Accounts.count({ where: { deletedAt: null } }),
    prismadb.crm_Leads.count({ where: { deletedAt: null } }),
    prismadb.crm_Opportunities.count({ where: { deletedAt: null } }),
    prismadb.crm_Opportunities.aggregate({ where: { deletedAt: null }, _sum: { budget: true } }),

    // ── Projets ───────────────────────────────────────────────────────────────
    prismadb.boards.count(),
    prismadb.tasks.count({ where: { taskStatus: { not: 'COMPLETE' } } }),
  ]);

  // ── Calculs Finance ─────────────────────────────────────────────────────────
  const soldeGlobal = treasuryAccounts.reduce((total, acc) =>
    total + acc.entries.reduce((s, e) => e.type === 'ENTREE' ? s + e.amount : s - e.amount, 0), 0
  );

  const caMois = paidInvoices
    .filter(i => i.paidAt && new Date(i.paidAt) >= monthStart)
    .reduce((s, i) => s + i.totalTTC, 0);

  const depensesMois = expenses.reduce((s, e) => s + e.amount, 0);

  const totalImpayes = unpaidInvoices.reduce((s, i) => {
    const paid = i.payments.reduce((p, pmt) => p + pmt.amount, 0);
    return s + Math.max(0, i.totalTTC - paid);
  }, 0);

  const facturesEnRetard = unpaidInvoices.filter(
    i => i.dueDate && new Date(i.dueDate) < today
  ).length;

  // CA des 6 derniers mois pour le graphique
  const MONTHS_FR: Record<string, string> = {
    '01':'Jan','02':'Fév','03':'Mar','04':'Avr',
    '05':'Mai','06':'Juin','07':'Juil','08':'Août',
    '09':'Sep','10':'Oct','11':'Nov','12':'Déc',
  };
  const caParMois = Array.from({ length: 6 }, (_, i) => {
    const d     = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const fin   = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 0, 23, 59, 59);
    const m     = String(d.getMonth() + 1).padStart(2, '0');
    const total = paidInvoices
      .filter(inv => inv.paidAt && new Date(inv.paidAt) >= d && new Date(inv.paidAt) <= fin)
      .reduce((s, inv) => s + inv.totalTTC, 0);
    return { mois: MONTHS_FR[m] ?? m, 'CA (FCFA)': Math.round(total) };
  });

  // ── Calculs RH ──────────────────────────────────────────────────────────────
  const masseSalarialeMois = payslipsMois.reduce((s: number, p: any) => s + p.netSalary, 0);

  const heuresTotalesMois = timekeepingMois.reduce((s, t) => {
    if (!t.timeOut) return s;
    const h = (new Date(t.timeOut).getTime() - new Date(t.timeIn).getTime()) / 3_600_000;
    return s + (h > 0 ? h : 0);
  }, 0);

  // ── Docs récents enrichis ────────────────────────────────────────────────────
  const recentDocsEnriched = recentDocs.map(d => ({
    id:       d.id,
    number:   d.number,
    type:     d.type,
    status:   d.status,
    totalTTC: d.totalTTC,
    dueDate:  d.dueDate ? d.dueDate.toISOString() : null,
    client:   d.crmAccount?.name ?? d.occasionalClient?.name ?? '—',
  }));

  return {
    // Finance
    caMois,
    depensesMois,
    totalImpayes,
    facturesEnRetard,
    soldeGlobal,
    caParMois,
    recentDocs: recentDocsEnriched,
    // RH
    employees,
    masseSalarialeMois,
    demandesEnAttente,
    heuresTotalesMois: Math.round(heuresTotalesMois),
    recentRequests,
    // CRM
    accountsCount,
    leadsCount,
    opportunitiesCount,
    pipelineTotal: opportunitiesBudget._sum.budget ?? 0,
    // Projets
    boardsCount,
    tasksCount,
  };
}
