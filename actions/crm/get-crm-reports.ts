import { prismadb } from '@/lib/prisma';
import { subMonths, format, startOfMonth } from 'date-fns';

export const getCrmReports = async () => {
  const [leads, opportunities, stages, contacts, accounts] = await Promise.all([
    prismadb.crm_Leads.findMany({
      where: { deletedAt: null },
      select: { id: true, status: true, createdAt: true, assigned_to: true },
    }),
    prismadb.crm_Opportunities.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        budget: true,
        expected_revenue: true,
        sales_stage: true,
        status: true,
        createdAt: true,
        assigned_to: true,
        assigned_to_user: { select: { name: true } },
        assigned_sales_stage: { select: { name: true, probability: true } },
      },
    }),
    prismadb.crm_Opportunities_Sales_Stages.findMany({
      orderBy: { probability: 'asc' },
    }),
    prismadb.crm_Contacts.count({ where: { deletedAt: null } }),
    prismadb.crm_Accounts.count({ where: { deletedAt: null } }),
  ]);

  const now = new Date();

  // ── Entonnoir de conversion ─────────────────────────────────────────────────
  const totalLeads = leads.length;
  const convertedLeads = leads.filter(l => l.status === 'CONVERTED').length;
  const totalOpportunities = opportunities.length;
  const closedOpportunities = opportunities.filter(o => o.status === 'INACTIVE').length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  // ── Pipeline par stade ──────────────────────────────────────────────────────
  const pipelineByStage = stages.map(stage => {
    const opps = opportunities.filter(o => o.sales_stage === stage.id);
    return {
      stage: stage.name,
      probability: stage.probability ?? 0,
      count: opps.length,
      totalBudget: opps.reduce((s, o) => s + (o.budget ?? 0), 0),
      weightedValue: opps.reduce((s, o) => s + Math.round((o.budget ?? 0) * ((stage.probability ?? 0) / 100)), 0),
    };
  });

  // ── Top commerciaux ─────────────────────────────────────────────────────────
  const byUser: Record<string, { name: string; count: number; totalBudget: number }> = {};
  opportunities.forEach(o => {
    const name = o.assigned_to_user?.name ?? 'Non assigné';
    if (!byUser[name]) byUser[name] = { name, count: 0, totalBudget: 0 };
    byUser[name].count += 1;
    byUser[name].totalBudget += o.budget ?? 0;
  });
  const topPerformers = Object.values(byUser).sort((a, b) => b.totalBudget - a.totalBudget).slice(0, 8);

  // ── Évolution sur 6 mois ────────────────────────────────────────────────────
  const monthlyEvolution = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(now, 5 - i);
    const monthStart = startOfMonth(d);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const label = format(d, 'MMM yy');

    const newLeads = leads.filter(l => {
      if (!l.createdAt) return false;
      const dt = new Date(l.createdAt);
      return dt >= monthStart && dt <= monthEnd;
    }).length;

    const newOpps = opportunities.filter(o => {
      if (!o.createdAt) return false;
      const dt = new Date(o.createdAt);
      return dt >= monthStart && dt <= monthEnd;
    }).length;

    const revenue = opportunities
      .filter(o => {
        if (!o.createdAt) return false;
        const dt = new Date(o.createdAt);
        return dt >= monthStart && dt <= monthEnd;
      })
      .reduce((s, o) => s + (o.budget ?? 0), 0);

    return { mois: label, 'Prospects': newLeads, 'Opportunités': newOpps, 'Budget (FCFA)': revenue };
  });

  return {
    kpis: {
      totalLeads,
      convertedLeads,
      conversionRate,
      totalOpportunities,
      closedOpportunities,
      totalContacts: contacts,
      totalAccounts: accounts,
      totalPipelineValue: opportunities.reduce((s, o) => s + (o.budget ?? 0), 0),
    },
    pipelineByStage,
    topPerformers,
    monthlyEvolution,
  };
};
