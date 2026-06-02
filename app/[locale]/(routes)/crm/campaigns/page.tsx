import { Suspense } from 'react';
import SuspenseLoading from '@/components/loadings/suspense';
import Container from '../../components/ui/Container';
import CampaignsView from '../components/CampaignsView';
import { getCampaigns } from '@/actions/crm/get-campaigns';

const CampaignsPage = async () => {
  const campaigns = await getCampaigns();
  return (
    <Container
      title="Campagnes"
      description="Gérez vos campagnes marketing et commerciales"
    >
      <Suspense fallback={<SuspenseLoading />}>
        <CampaignsView data={campaigns} />
      </Suspense>
    </Container>
  );
};

export default CampaignsPage;
