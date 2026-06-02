import { prismadb } from '@/lib/prisma';
import Container from '@/app/[locale]/(routes)/components/ui/Container';
import { AccountsManager } from './AccountsManager';

export default async function TreasuryAccountsPage() {
  const accounts = await prismadb.treasuryAccount.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { entries: true } },
    },
  });

  const data = accounts.map((a) => ({
    id:            a.id,
    name:          a.name,
    type:          a.type,
    currency:      a.currency,
    accountNumber: a.accountNumber,
    isActive:      a.isActive,
    entriesCount:  a._count.entries,
  }));

  return (
    <Container
      title="Comptes de trésorerie"
      description="Gérez vos comptes bancaires, caisses et comptes mobile money"
    >
      <AccountsManager initialAccounts={data} />
    </Container>
  );
}
