'use client';

import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import AlertModal from '@/components/modals/alert-modal';
import NewTeamDialog from './NewTeamDialog';

import { Users, CheckSquare, ArrowRight, Trash2, Crown } from 'lucide-react';

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  photo: string | null;
  position: string | null;
};

type Team = {
  id: string;
  name: string;
  createdAt: Date;
  members: Employee[];
  TeamTask: { id: string; done: boolean }[];
};

type Props = {
  teams: Team[];
  employees: any[];
  canManageTeams?: boolean;
  canManageMembers?: boolean;
};

const TeamsView = ({ teams, canManageTeams = false }: Props) => {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await axios.delete(`/api/projects/teams/${deleteId}`);
      toast({ title: 'Équipe supprimée.' });
      router.refresh();
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer l\'équipe.' });
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

  return (
    <div>
      <AlertModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between py-6">
        <p className="text-sm text-gray-400">
          {teams.length} équipe{teams.length !== 1 ? 's' : ''}
        </p>
        {canManageTeams && <NewTeamDialog />}
      </div>

      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-center">
          <Users className="mb-4 h-10 w-10 text-gray-400" />
          <p className="text-gray-400">Aucune équipe pour le moment.</p>
          <p className="mt-1 text-sm text-gray-400">
            Créez votre première équipe pour commencer.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => {
            const done = team.TeamTask.filter((t) => t.done).length;
            const total = team.TeamTask.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <Card key={team.id} className="flex flex-col overflow-hidden">
                <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-start justify-between">
                    <p className="text-base font-bold" style={{ color: '#1E1D3D' }}>{team.name}</p>
                    {canManageTeams && (
                      <button
                        type="button"
                        className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-red-50"
                        onClick={() => setDeleteId(team.id)}
                      >
                        <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                      </button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users className="h-4 w-4" />
                    <span>{team.members.length} membre{team.members.length !== 1 ? 's' : ''}</span>
                  </div>
                  {(team as any).responsible && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      <span>{(team as any).responsible.firstName} {(team as any).responsible.lastName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckSquare className="h-4 w-4" />
                    <span>
                      {done} / {total} tâche{total !== 1 ? 's' : ''} terminée{done !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {total > 0 && (
                    <div>
                      <div className="mb-1 flex justify-between text-xs text-gray-400">
                        <span>Avancement</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: 'linear-gradient(to right, #FF7E00, #FAC731)' }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="mt-auto flex flex-wrap gap-1 pt-2">
                    {team.members.slice(0, 4).map((m) => (
                      <span key={m.id} className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        {m.firstName} {m.lastName}
                      </span>
                    ))}
                    {team.members.length > 4 && (
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium" style={{ color: '#1E1D3D' }}>
                        +{team.members.length - 4}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/projects/teams/${team.id}`}
                    className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors hover:bg-[#FF7E00]/[0.06]"
                    style={{ color: '#1E1D3D' }}
                  >
                    Voir l&apos;équipe
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeamsView;
