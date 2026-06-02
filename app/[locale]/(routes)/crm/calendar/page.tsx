import { Suspense } from 'react';
import SuspenseLoading from '@/components/loadings/suspense';
import Container from '../../components/ui/Container';
import { CrmCalendarView } from './CrmCalendarView';
import { prismadb } from '@/lib/prisma';

const CrmCalendarPage = async () => {
  const opportunities = await prismadb.crm_Opportunities.findMany({
    where: {
      deletedAt: null,
      status: 'ACTIVE',
      close_date: { not: null },
    },
    select: {
      id: true,
      name: true,
      close_date: true,
      budget: true,
      assigned_to_user: { select: { name: true } },
      assigned_sales_stage: { select: { name: true } },
    },
    orderBy: { close_date: 'asc' },
  });

  const serialized = opportunities.map((o) => ({
    ...o,
    close_date: o.close_date ? o.close_date.toISOString() : null,
  }));

  return (
    <Container
      title="Calendrier CRM"
      description="Vue mensuelle des opportunités par date de clôture prévue"
    >
      <Suspense fallback={<SuspenseLoading />}>
        <CrmCalendarView opportunities={serialized} />
      </Suspense>
    </Container>
  );
};

export default CrmCalendarPage;
