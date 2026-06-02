import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Container from '../components/ui/Container';
import SuspenseLoading from '@/components/loadings/suspense';
import ReportsView from './components/ReportsView';

const ReportsPage = async () => {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  return (
    <Container
      title="Rapports & Exports"
      description="Téléchargez vos données en CSV pour la comptabilité, l'audit et le suivi RH."
    >
      <Suspense fallback={<SuspenseLoading />}>
        <ReportsView />
      </Suspense>
    </Container>
  );
};

export default ReportsPage;
