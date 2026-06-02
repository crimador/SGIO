import { prismadb } from '@/lib/prisma';

export const getCrmTrash = async () => {
  const [accounts, contacts, leads, opportunities, campaigns] = await Promise.all([
    prismadb.crm_Accounts.findMany({
      where: { deletedAt: { not: null } },
      select: { id: true, name: true, deletedAt: true },
      orderBy: { deletedAt: 'desc' },
    }),
    prismadb.crm_Contacts.findMany({
      where: { deletedAt: { not: null } },
      select: { id: true, first_name: true, last_name: true, deletedAt: true },
      orderBy: { deletedAt: 'desc' },
    }),
    prismadb.crm_Leads.findMany({
      where: { deletedAt: { not: null } },
      select: { id: true, firstName: true, lastName: true, deletedAt: true },
      orderBy: { deletedAt: 'desc' },
    }),
    prismadb.crm_Opportunities.findMany({
      where: { deletedAt: { not: null } },
      select: { id: true, name: true, deletedAt: true },
      orderBy: { deletedAt: 'desc' },
    }),
    prismadb.crm_campaigns.findMany({
      where: { deletedAt: { not: null } },
      select: { id: true, name: true, deletedAt: true },
      orderBy: { deletedAt: 'desc' },
    }),
  ]);

  return {
    accounts: accounts.map((r) => ({ ...r, entity: 'account' as const })),
    contacts: contacts.map((r) => ({
      ...r,
      name: `${r.first_name} ${r.last_name}`,
      entity: 'contact' as const,
    })),
    leads: leads.map((r) => ({
      ...r,
      name: `${r.firstName ?? ''} ${r.lastName}`.trim(),
      entity: 'lead' as const,
    })),
    opportunities: opportunities.map((r) => ({ ...r, entity: 'opportunity' as const })),
    campaigns: campaigns.map((r) => ({ ...r, entity: 'campaign' as const })),
  };
};
