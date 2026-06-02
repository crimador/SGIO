import { Suspense } from 'react';
import SuspenseLoading from '@/components/loadings/suspense';
import Container from '../../components/ui/Container';
import { CrmReportsView } from './CrmReportsView';
import { getCrmReports } from '@/actions/crm/get-crm-reports';

const CrmReportsPage = async () => {
  const data = await getCrmReports();
  return (
    <Container
      title="Rapports CRM"
      description="Analyse de la performance commerciale : pipeline, conversion et tendances"
    >
      <Suspense fallback={<SuspenseLoading />}>
        <CrmReportsView data={data} />
      </Suspense>
    </Container>
  );
};

export default CrmReportsPage;
