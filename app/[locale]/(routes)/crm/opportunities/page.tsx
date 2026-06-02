import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canWrite } from '@/lib/permissions';
import SuspenseLoading from '@/components/loadings/suspense';
import Container from '../../components/ui/Container';
import OpportunitiesView from '../components/OpportunitiesView';
import { getAllCrmData } from '@/actions/crm/get-crm-data';
import { getOpportunitiesFull } from '@/actions/crm/get-opportunities-with-includes';

const OpportunitiesPage = async () => {
  const [session, crmData, opportunities] = await Promise.all([
    getServerSession(authOptions),
    getAllCrmData(),
    getOpportunitiesFull(),
  ]);
  const writeable = canWrite(session?.user?.userRole ?? 'COMMERCIAL', 'crm');

  return (
    <Container title="Opportunités" description="Suivi des opportunités commerciales et de leur avancement">
      <Suspense fallback={<SuspenseLoading />}>
        <OpportunitiesView crmData={crmData} data={opportunities} canWrite={writeable} />
      </Suspense>
    </Container>
  );
};

export default OpportunitiesPage;
