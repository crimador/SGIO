import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import SuspenseLoading from '@/components/loadings/suspense';
import Container from '../../components/ui/Container';
import TrainingsView from './components/TrainingsView';
import { getTrainings } from '@/actions/get-trainings';
import { getEmployee } from '@/actions/get-employee';

const TrainingsPage = async () => {
  const session = await getServerSession(authOptions);
  const canEdit = ['DG', 'RH'].includes(session?.user.userRole ?? '');

  const [trainingsData, employeesData] = await Promise.all([
    getTrainings(),
    getEmployee(),
  ]);

  return (
    <Container
      title="Formations"
      description="Suivez et planifiez les formations de vos employés."
    >
      <Suspense fallback={<SuspenseLoading />}>
        <TrainingsView
          initialData={trainingsData as any}
          employees={employeesData as any}
          canEdit={canEdit}
        />
      </Suspense>
    </Container>
  );
};

export default TrainingsPage;
