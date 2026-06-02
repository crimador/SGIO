import { prismadb } from '@/lib/prisma';

export const getCampaigns = async () => {
  const data = await prismadb.crm_campaigns.findMany({
    where: { deletedAt: null },
    include: {
      _count: { select: { opportunities: true } },
    },
    orderBy: { name: 'asc' },
  });
  return data;
};

export const getCampaign = async (id: string) => {
  const data = await prismadb.crm_campaigns.findUnique({
    where: { id },
    include: {
      opportunities: {
        include: { assigned_account: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  return data;
};
