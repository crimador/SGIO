'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, CheckSquare, MessageSquare, BarChart3, Pencil, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import TeamMembersTab from './TeamMembersTab';
import TeamTasksTab from './TeamTasksTab';
import TeamMessagesTab from './TeamMessagesTab';
import TeamDashboardTab from './TeamDashboardTab';

type Props = {
  team: any;
  employees: any[];
  session: any;
};

const TeamDetail = ({ team, employees, session }: Props) => {
  const router = useRouter();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(team.name);
  const [saving, setSaving] = useState(false);

  const saveName = async () => {
    if (!name.trim() || name.trim() === team.name) { setEditing(false); return; }
    setSaving(true);
    try {
      await axios.patch(`/api/projects/teams/${team.id}`, { name: name.trim() });
      toast({ title: 'Équipe renommée.' });
      router.refresh();
      setEditing(false);
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de renommer l\'équipe.' });
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => { setName(team.name); setEditing(false); };

  return (
    <div className="mt-4">
      <div className="mb-6 flex items-center gap-3">
        {editing ? (
          <>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') cancelEdit(); }}
              className="max-w-sm text-lg font-semibold"
              autoFocus
            />
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-gray-100 disabled:opacity-50"
              onClick={saveName}
              disabled={saving}
            >
              <Check className="h-4 w-4 text-green-500" />
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-gray-100"
              onClick={cancelEdit}
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </>
        ) : (
          <button
            type="button"
            className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-gray-400 transition-colors hover:bg-[#FF7E00]/[0.06]"
            style={{ color: undefined }}
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-4 w-4" />
            Renommer l&apos;équipe
          </button>
        )}
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">
            <BarChart3 className="mr-2 h-4 w-4" />
            Tableau de bord
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="mr-2 h-4 w-4" />
            Membres
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <CheckSquare className="mr-2 h-4 w-4" />
            Tâches
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageSquare className="mr-2 h-4 w-4" />
            Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <TeamDashboardTab team={team} />
        </TabsContent>

        <TabsContent value="members">
          <TeamMembersTab team={team} employees={employees} />
        </TabsContent>

        <TabsContent value="tasks">
          <TeamTasksTab team={team} />
        </TabsContent>

        <TabsContent value="messages">
          <TeamMessagesTab team={team} session={session} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamDetail;
