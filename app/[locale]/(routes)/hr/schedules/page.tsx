import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import SuspenseLoading from '@/components/loadings/suspense';
import Container from '../../components/ui/Container';
import SchedulesView from './components/SchedulesView';
import { getSchedules } from '@/actions/get-schedules';
import { getEmployee } from '@/actions/get-employee';

const SchedulesPage = async () => {
  const session = await getServerSession(authOptions);
  const canEdit = ['DG', 'RH'].includes(session?.user.userRole ?? '');

  const [schedulesData, employeesData] = await Promise.all([
    getSchedules(),
    getEmployee(),
  ]);

  return (
    <Container
      title="Planning des employés"
      description="Gérez les horaires et plannings de votre équipe."
    >
      <Suspense fallback={<SuspenseLoading />}>
        <SchedulesView
          initialData={schedulesData as any}
          employees={employeesData as any}
          canEdit={canEdit}
        />
      </Suspense>
    </Container>
  );
};

export default SchedulesPage;
