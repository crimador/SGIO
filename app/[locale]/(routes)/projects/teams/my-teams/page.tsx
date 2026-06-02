import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import Container from '@/app/[locale]/(routes)/components/ui/Container';
import { redirect } from 'next/navigation';
import type { Session } from 'next-auth';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowRight, CheckSquare, Crown, Users } from 'lucide-react';

const MyTeamsPage = async () => {
  const session: Session | null = await getServerSession(authOptions);
  if (!session) return redirect('/sign-in');

  const employee = await prismadb.employee.findFirst({
    where: { assigned_to: session.user.id },
    include: {
      teams: {
        include: {
          members: { select: { id: true, firstName: true, lastName: true } },
          responsible: { select: { id: true, firstName: true, lastName: true } },
          TeamTask: { select: { id: true, done: true } },
        },
      },
    },
  });

  const teams = employee?.teams ?? [];

  return (
    <Container
      title="Mes équipes"
      description={`${teams.length} équipe${teams.length !== 1 ? 's' : ''} dont vous êtes membre.`}
    >
      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-center">
          <Users className="mb-4 h-10 w-10 text-gray-400" />
          <p className="text-gray-400">Vous n&apos;appartenez à aucune équipe pour le moment.</p>
          <Link
            href="/projects/teams"
            className="mt-4 flex h-9 items-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-[#FF7E00]/[0.06]"
            style={{ color: '#1E1D3D' }}
          >
            Voir toutes les équipes
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => {
            const done  = team.TeamTask.filter((t) => t.done).length;
            const total = team.TeamTask.length;
            const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
            const isResponsible = team.responsible?.id === employee?.id;

            return (
              <Card key={team.id} className={`overflow-hidden ${isResponsible ? 'border-yellow-400' : ''}`}>
                <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-base font-bold" style={{ color: '#1E1D3D' }}>{team.name}</p>
                    {isResponsible && <Crown className="h-4 w-4 text-yellow-500" />}
                  </div>
                  {isResponsible && (
                    <span className="mt-1 inline-flex w-fit items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                      Responsable
                    </span>
                  )}
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users className="h-4 w-4" />
                    <span>{team.members.length} membre{team.members.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckSquare className="h-4 w-4" />
                    <span>{done} / {total} tâche{total !== 1 ? 's' : ''} terminée{done !== 1 ? 's' : ''}</span>
                  </div>
                  {total > 0 && (
                    <div>
                      <div className="mb-1 flex justify-between text-xs text-gray-400">
                        <span>Avancement</span><span>{pct}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: 'linear-gradient(to right, #FF7E00, #FAC731)' }}
                        />
                      </div>
                    </div>
                  )}
                  <Link
                    href={`/projects/teams/${team.id}`}
                    className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors hover:bg-[#FF7E00]/[0.06]"
                    style={{ color: '#1E1D3D' }}
                  >
                    Voir l&apos;équipe <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </Container>
  );
};

export default MyTeamsPage;
