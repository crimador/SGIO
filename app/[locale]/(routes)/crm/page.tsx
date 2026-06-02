import { Suspense } from 'react';
import Container from '../components/ui/Container';
import MainPageView from './components/MainPageView';
import SuspenseLoading from '@/components/loadings/suspense';
import { getDictionary } from '@/dictionaries';

const CrmPage = async ({ params }: { params: { locale: string } }) => {
  const dict = await getDictionary(params.locale as 'en' | 'cz' | 'de' | 'uk' | 'ko' | 'fr');

  return (
    <Container
      title={dict.ModuleMenu.crm.title}
      description="Vue d'ensemble de vos clients, opportunités, contacts et prospects"
    >
    {/*
      TODO: Think about how to handle the loading of the data to make better UX with suspense
      */}
    <Suspense fallback={<SuspenseLoading />}>
      <MainPageView />
    </Suspense>
  </Container>
  );
};

export default CrmPage;
