import { Suspense } from 'react';

import SuspenseLoading from '@/components/loadings/suspense';
import Container from '../components/ui/Container';
import TimekeepingView from './components/TimekeepingView';

import { getTimekeeping } from '@/actions/get-timekeeping';
import { getEmployee } from '@/actions/get-employee';
import { getDictionary } from '@/dictionaries';

const TimekeepingPage = async ({ params }: { params: { locale: string } }) => {
  const dict = await getDictionary(params.locale as 'en' | 'cz' | 'de' | 'uk' | 'ko' | 'fr');
  const timekeeping = await getTimekeeping();
  const employees = await getEmployee();

  return (
    <Container
      title={dict.TimekeepingPage.title}
      description="Gestion des présences et heures de travail"
    >
      <Suspense fallback={<SuspenseLoading />}>
        <TimekeepingView
          data={timekeeping as any}
          employees={employees}
          translations={dict.TimekeepingPage}
        />
      </Suspense>
    </Container>
  );
};

export default TimekeepingPage;
