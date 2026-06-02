import { getTeamDetail } from '@/actions/projects/get-team-detail';
import { getEmployee } from '@/actions/get-employee';
import Container from '@/app/[locale]/(routes)/components/ui/Container';
import { notFound } from 'next/navigation';
import TeamDetail from './components/TeamDetail';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { Session } from 'next-auth';

type Props = { params: { teamId: string } };

const TeamDetailPage = async ({ params }: Props) => {
  const session: Session | null = await getServerSession(authOptions);
  const [team, employees] = await Promise.all([
    getTeamDetail(params.teamId),
    getEmployee(),
  ]);

  if (!team) return notFound();

  return (
    <Container
      title={team.name}
      description={`${team.members.length} membre${team.members.length !== 1 ? 's' : ''} · ${team.TeamTask.length} tâche${team.TeamTask.length !== 1 ? 's' : ''}`}
    >
      <TeamDetail team={team as any} employees={employees} session={session} />
    </Container>
  );
};

export default TeamDetailPage;
