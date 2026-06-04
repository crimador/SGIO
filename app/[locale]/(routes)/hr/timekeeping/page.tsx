import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import SuspenseLoading from '@/components/loadings/suspense';

import Container from '../../components/ui/Container';
import TimekeepingView from './components/TimekeepingView';

import { getEmployee } from '@/actions/get-employee';
import { getTimekeeping } from '@/actions/get-timekeeping';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDictionary } from '@/dictionaries';

const TimekeepingPage = async ({ params }: { params: { locale: string } }) => {
  const session = await getServerSession(authOptions);
  if (!session || !['DG', 'COMPTABLE', 'RH'].includes(session.user.userRole)) redirect('/unauthorized');

  const [dict, employees, timekeeping] = await Promise.all([
    getDictionary(params.locale as 'en' | 'cz' | 'de' | 'uk' | 'ko' | 'fr'),
    getEmployee(),
    getTimekeeping(),
  ]);

  return (
    <Container
      title={dict.ModuleMenu?.timekeeping || "Timekeeping"}
      description={'Suivi des heures de travail et pointage des employés'}
    >
      <Suspense fallback={<SuspenseLoading />}>
        <TimekeepingView employees={employees} data={timekeeping} />
      </Suspense>
    </Container>
  );
};

export default TimekeepingPage;
