'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Users, CheckSquare, Clock, AlertCircle, Crown } from 'lucide-react';

type Props = { team: any };

const TeamDashboardTab = ({ team }: Props) => {
  const tasks: any[] = team.TeamTask ?? [];
  const members: any[] = team.members ?? [];

  const done = tasks.filter((t) => t.done).length;
  const pending = tasks.length - done;
  const overdue = tasks.filter(
    (t) => !t.done && new Date(t.deadline) < new Date()
  ).length;
  const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

  const kpis = [
    {
      label: 'Membres',
      value: members.length,
      icon: <Users className="h-5 w-5 text-blue-500" />,
      color: 'bg-blue-50',
    },
    {
      label: 'Tâches terminées',
      value: done,
      icon: <CheckSquare className="h-5 w-5 text-green-500" />,
      color: 'bg-green-50',
    },
    {
      label: 'En attente',
      value: pending,
      icon: <Clock className="h-5 w-5 text-yellow-500" />,
      color: 'bg-yellow-50',
    },
    {
      label: 'En retard',
      value: overdue,
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      color: 'bg-red-50',
    },
  ];

  const upcoming = tasks
    .filter((t) => !t.done)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className={k.color}>
            <CardContent className="flex items-center gap-3 p-4">
              {k.icon}
              <div>
                <p className="text-2xl font-bold">{k.value}</p>
                <p className="text-xs text-gray-400">{k.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2 pt-4">
          <p className="text-sm font-medium" style={{ color: '#1E1D3D' }}>Avancement global</p>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex justify-between text-sm">
            <span>{done} tâche{done !== 1 ? 's' : ''} terminée{done !== 1 ? 's' : ''}</span>
            <span className="font-semibold">{pct}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: 'linear-gradient(to right, #FF7E00, #FAC731)' }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">{tasks.length} tâche{tasks.length !== 1 ? 's' : ''} au total</p>
        </CardContent>
      </Card>

      {upcoming.length > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-4">
            <p className="text-sm font-medium" style={{ color: '#1E1D3D' }}>Prochaines échéances</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcoming.map((t) => {
              const isLate = new Date(t.deadline) < new Date();
              return (
                <div key={t.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                  <span className="font-medium">{t.task}</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    isLate ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {new Date(t.deadline).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {team.responsible && (
        <Card className="border-yellow-400">
          <CardContent className="flex items-center gap-3 p-4">
            <Crown className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-xs text-gray-400">Responsable de l&apos;équipe</p>
              <p className="font-semibold">
                {team.responsible.firstName} {team.responsible.lastName}
                {team.responsible.position && (
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    · {team.responsible.position}
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {members.length > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-4">
            <p className="text-sm font-medium" style={{ color: '#1E1D3D' }}>Membres de l&apos;équipe</p>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {members.map((m: any) => {
              const isResp = m.id === team.responsibleId;
              return (
                <span
                  key={m.id}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    isResp
                      ? 'text-white'
                      : 'border'
                  }`}
                  style={isResp ? { background: '#1E1D3D' } : { color: '#1E1D3D' }}
                >
                  {isResp && <Crown className="h-3 w-3 text-yellow-400" />}
                  {m.firstName} {m.lastName}
                  {m.position && <span className="text-gray-400">· {m.position}</span>}
                </span>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeamDashboardTab;
