import { prismadb } from '@/lib/prisma';
import Container from '@/app/[locale]/(routes)/components/ui/Container';
import { ExpensesView } from './components/ExpensesView';

export default async function ExpensesPage() {
  const expenses = await prismadb.expense.findMany({
    include: {
      account:         { select: { name: true } },
      treasuryAccount: { select: { name: true, type: true } },
    },
    orderBy: { date: 'desc' },
  });

  const data = expenses.map((e) => ({
    id:              e.id,
    description:     e.description,
    amount:          e.amount,
    category:        e.category,
    date:            e.date.toISOString(),
    receipt:         e.receipt,
    paymentMethod:   e.paymentMethod,
    crmAccount:      e.account,
    treasuryAccount: e.treasuryAccount,
    createdAt:       e.createdAt.toISOString(),
  }));

  return (
    <Container
      title="Dépenses"
      description="Suivi des sorties de trésorerie du cabinet"
    >
      <ExpensesView initialExpenses={data} />
    </Container>
  );
}
