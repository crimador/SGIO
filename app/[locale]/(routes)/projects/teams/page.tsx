import { getTeams } from '@/actions/projects/get-teams';
import { getEmployee } from '@/actions/get-employee';
import Container from '@/app/[locale]/(routes)/components/ui/Container';
import { Suspense } from 'react';
import SuspenseLoading from '@/components/loadings/suspense';
import TeamsView from './components/TeamsView';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const TeamsPage = async () => {
  const session = await getServerSession(authOptions);
  const canManageTeams = session?.user.userRole === 'DG';
  const canManageMembers = ['DG', 'RH'].includes(session?.user.userRole ?? '');

  const [teams, employees] = await Promise.all([getTeams(), getEmployee()]);

  return (
    <Container
      title="Gestion des équipes"
      description="Créez et gérez vos équipes de projet."
    >
      <Suspense fallback={<SuspenseLoading />}>
        <TeamsView teams={teams} employees={employees} canManageTeams={canManageTeams} canManageMembers={canManageMembers} />
      </Suspense>
    </Container>
  );
};

export default TeamsPage;
