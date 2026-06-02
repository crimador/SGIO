import { prismadb } from '@/lib/prisma';

export async function getTreasuryDashboard() {
  const [accounts, recentEntries] = await Promise.all([
    // Comptes avec calcul de solde dynamique
    prismadb.treasuryAccount.findMany({
      where: { isActive: true },
      include: {
        entries: {
          select: { type: true, amount: true },
        },
      },
      orderBy: { name: 'asc' },
    }),

    // 30 derniers mouvements
    prismadb.treasuryEntry.findMany({
      take: 30,
      orderBy: { date: 'desc' },
      include: {
        account: { select: { name: true, type: true } },
      },
    }),
  ]);

  const accountsWithBalance = accounts.map((acc) => {
    const entrees = acc.entries.filter((e) => e.type === 'ENTREE').reduce((s, e) => s + e.amount, 0);
    const sorties = acc.entries.filter((e) => e.type === 'SORTIE').reduce((s, e) => s + e.amount, 0);
    return {
      id:       acc.id,
      name:     acc.name,
      type:     acc.type,
      currency: acc.currency,
      entrees,
      sorties,
      solde:    entrees - sorties,
    };
  });

  const totalEntrees = accountsWithBalance.reduce((s, a) => s + a.entrees, 0);
  const totalSorties = accountsWithBalance.reduce((s, a) => s + a.sorties, 0);
  const soldeGlobal  = totalEntrees - totalSorties;

  return {
    accounts: accountsWithBalance,
    totalEntrees,
    totalSorties,
    soldeGlobal,
    recentEntries: recentEntries.map((e) => ({
      id:            e.id,
      date:          e.date.toISOString(),
      type:          e.type,
      amount:        e.amount,
      description:   e.description,
      paymentMethod: e.paymentMethod,
      reference:     e.reference,
      accountName:   e.account.name,
      accountType:   e.account.type,
    })),
  };
}

export type TreasuryDashboardData = Awaited<ReturnType<typeof getTreasuryDashboard>>;
