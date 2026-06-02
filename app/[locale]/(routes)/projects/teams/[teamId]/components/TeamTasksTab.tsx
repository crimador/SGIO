'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import AlertModal from '@/components/modals/alert-modal';
import TeamTaskComments from './TeamTaskComments';
import { Plus, Trash2, CheckSquare, User } from 'lucide-react';

const PRIORITIES = [
  { value: 'HIGH',   label: 'Haute' },
  { value: 'NORMAL', label: 'Normale' },
  { value: 'LOW',    label: 'Basse' },
] as const;

function priorityLabel(p: string) {
  return PRIORITIES.find((x) => x.value === p)?.label ?? p;
}

function priorityBadgeClass(p: string) {
  if (p === 'HIGH')   return 'bg-red-100 text-red-700';
  if (p === 'LOW')    return 'border text-gray-600';
  return 'bg-gray-100 text-gray-600';
}

const formSchema = z.object({
  task:         z.string().min(2, 'Minimum 2 caractères'),
  description:  z.string().optional(),
  deadline:     z.string().min(1, 'Deadline requise'),
  assignedToId: z.string().optional(),
  priority:     z.string().default('NORMAL'),
});
type FormValues = z.infer<typeof formSchema>;

type Props = { team: any };

const TeamTasksTab = ({ team }: Props) => {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const members: any[] = team.members ?? [];
  const tasks: any[] = team.TeamTask ?? [];

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { priority: 'NORMAL' } });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        assignedToId: data.assignedToId === 'none' ? undefined : data.assignedToId,
      };
      await axios.post(`/api/projects/teams/${team.id}/tasks`, payload);
      toast({ title: 'Tâche créée.' });
      form.reset({ priority: 'NORMAL' });
      setOpen(false);
      router.refresh();
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de créer la tâche.' });
    } finally {
      setLoading(false);
    }
  };

  const toggleDone = async (taskId: string, done: boolean) => {
    try {
      await axios.patch(`/api/projects/teams/${team.id}/tasks/${taskId}`, { done: !done });
      router.refresh();
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour la tâche.' });
    }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await axios.delete(`/api/projects/teams/${team.id}/tasks/${deleteId}`);
      toast({ title: 'Tâche supprimée.' });
      router.refresh();
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer la tâche.' });
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

  const pending = tasks.filter((t) => !t.done);
  const done    = tasks.filter((t) =>  t.done);

  const TaskCard = ({ t }: { t: any }) => {
    const isLate = !t.done && new Date(t.deadline) < new Date();
    return (
      <div className={`rounded-lg border p-3 ${t.done ? 'bg-gray-50/50 opacity-70' : ''}`}>
        <div className="flex items-start gap-3">
          <Checkbox
            checked={t.done}
            onCheckedChange={() => toggleDone(t.id, t.done)}
            className="mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <p className={`font-medium ${t.done ? 'line-through' : ''}`}>{t.task}</p>
            {t.description && (
              <p className="mt-0.5 text-sm text-gray-400">{t.description}</p>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                isLate ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {isLate ? 'En retard · ' : ''}
                {new Date(t.deadline).toLocaleDateString('fr-FR')}
              </span>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityBadgeClass(t.priority ?? 'NORMAL')}`}>
                {priorityLabel(t.priority ?? 'NORMAL')}
              </span>
              {t.assignedTo && (
                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium" style={{ color: '#1E1D3D' }}>
                  <User className="h-3 w-3" />
                  {t.assignedTo.firstName} {t.assignedTo.lastName}
                </span>
              )}
            </div>
            <TeamTaskComments
              teamId={team.id}
              taskId={t.id}
              initialComments={t.TaskComments ?? []}
            />
          </div>
          <button
            type="button"
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md transition-colors hover:bg-red-50"
            onClick={() => setDeleteId(t.id)}
          >
            <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <AlertModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={onDelete} loading={loading} />

      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
            >
              <Plus className="h-4 w-4" />
              Nouvelle tâche
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle tâche d&apos;équipe</DialogTitle>
              <DialogDescription>Créez et assignez une tâche à un membre de l&apos;équipe.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="task" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre</FormLabel>
                    <FormControl><Input placeholder="Titre de la tâche" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optionnel)</FormLabel>
                    <FormControl><Textarea placeholder="Décrivez la tâche..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="deadline" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Échéance</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="priority" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priorité</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRIORITIES.map((p) => (
                            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                {members.length > 0 && (
                  <FormField control={form.control} name="assignedToId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigner à (optionnel)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue="none">
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Choisir un membre..." /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Tâche collective</SelectItem>
                          {members.map((m: any) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.firstName} {m.lastName}{m.position && ` — ${m.position}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="flex h-9 items-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-red-50"
                    style={{ color: '#dc2626' }}
                    onClick={() => setOpen(false)}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-9 items-center rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
                  >
                    {loading ? 'Création...' : 'Créer'}
                  </button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <CheckSquare className="mb-3 h-8 w-8 text-gray-400" />
          <p className="text-gray-400">Aucune tâche pour cette équipe.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
                En cours ({pending.length})
              </h3>
              <div className="space-y-2">{pending.map((t: any) => <TaskCard key={t.id} t={t} />)}</div>
            </div>
          )}
          {done.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
                Terminées ({done.length})
              </h3>
              <div className="space-y-2">{done.map((t: any) => <TaskCard key={t.id} t={t} />)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamTasksTab;
