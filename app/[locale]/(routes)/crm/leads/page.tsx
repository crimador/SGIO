import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canWrite } from '@/lib/permissions';
import SuspenseLoading from '@/components/loadings/suspense';
import Container from '../../components/ui/Container';
import LeadsView from '../components/LeadsView';
import { getAllCrmData } from '@/actions/crm/get-crm-data';
import { getLeads } from '@/actions/crm/get-leads';

const LeadsPage = async () => {
  const [session, crmData, leads] = await Promise.all([
    getServerSession(authOptions),
    getAllCrmData(),
    getLeads(),
  ]);
  const writeable = canWrite(session?.user?.userRole ?? 'COMMERCIAL', 'crm');

  return (
    <Container title="Prospects" description="Suivi des prospects et opportunités commerciales en cours">
      <Suspense fallback={<SuspenseLoading />}>
        <LeadsView crmData={crmData} data={leads} canWrite={writeable} />
      </Suspense>
    </Container>
  );
};

export default LeadsPage;
