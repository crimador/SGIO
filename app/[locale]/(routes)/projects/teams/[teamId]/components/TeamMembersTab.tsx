'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { UserPlus, UserMinus, User, Crown } from 'lucide-react';

type Props = { team: any; employees: any[] };

const TeamMembersTab = ({ team, employees }: Props) => {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedEmp, setSelectedEmp] = useState('');
  const [loading, setLoading] = useState(false);

  const memberIds = new Set((team.members ?? []).map((m: any) => m.id));
  const available = employees.filter((e) => !memberIds.has(e.id));
  const responsibleId = team.responsibleId;

  const addMember = async () => {
    if (!selectedEmp) return;
    setLoading(true);
    try {
      await axios.post(`/api/projects/teams/${team.id}/members`, { employeeId: selectedEmp });
      toast({ title: 'Membre ajouté.' });
      setSelectedEmp('');
      router.refresh();
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible d'ajouter le membre." });
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (employeeId: string) => {
    setLoading(true);
    try {
      await axios.delete(`/api/projects/teams/${team.id}/members`, { data: { employeeId } });
      toast({ title: 'Membre retiré.' });
      router.refresh();
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de retirer le membre.' });
    } finally {
      setLoading(false);
    }
  };

  const setResponsible = async (employeeId: string | null) => {
    setLoading(true);
    try {
      await axios.patch(`/api/projects/teams/${team.id}`, { responsibleId: employeeId });
      toast({ title: employeeId ? 'Responsable défini.' : 'Responsable retiré.' });
      router.refresh();
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de modifier le responsable.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sélecteur responsable */}
      <div className="rounded-lg border p-4">
        <p className="mb-3 text-sm font-semibold">Responsable de l&apos;équipe</p>
        <div className="flex items-center gap-3">
          <Select
            value={responsibleId ?? 'none'}
            onValueChange={(val) => setResponsible(val === 'none' ? null : val)}
            disabled={loading}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Choisir un responsable..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucun responsable</SelectItem>
              {(team.members ?? []).map((m: any) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.firstName} {m.lastName}
                  {m.position && ` — ${m.position}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {team.responsible && (
          <p className="mt-2 flex items-center gap-1 text-sm text-gray-400">
            <Crown className="h-3.5 w-3.5 text-yellow-500" />
            Responsable actuel : <strong>{team.responsible.firstName} {team.responsible.lastName}</strong>
          </p>
        )}
      </div>

      {/* Ajout de membre */}
      {available.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border p-4">
          <Select value={selectedEmp} onValueChange={setSelectedEmp}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Ajouter un employé à l'équipe..." />
            </SelectTrigger>
            <SelectContent>
              {available.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.firstName} {e.lastName}
                  {e.position && ` — ${e.position}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={addMember}
            disabled={!selectedEmp || loading}
            className="flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
          >
            <UserPlus className="h-4 w-4" />
            Ajouter
          </button>
        </div>
      )}

      {/* Liste des membres */}
      {team.members.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <User className="mb-3 h-8 w-8 text-gray-400" />
          <p className="text-gray-400">Aucun membre dans cette équipe.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {team.members.map((member: any) => {
            const isResponsible = member.id === responsibleId;
            return (
              <Card key={member.id} className={isResponsible ? 'border-yellow-400' : ''}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {member.firstName} {member.lastName}
                      </p>
                      {isResponsible && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    {member.position && (
                      <p className="text-xs text-gray-400">{member.position}</p>
                    )}
                    {isResponsible && (
                      <span className="mt-1 inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                        Responsable
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-red-50 disabled:opacity-50"
                    onClick={() => removeMember(member.id)}
                    disabled={loading}
                  >
                    <UserMinus className="h-4 w-4 text-gray-400 hover:text-red-500" />
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeamMembersTab;
