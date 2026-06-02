import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import React from 'react';
import Container from '../../../components/ui/Container';
import { getUserCRMTasks } from '@/actions/crm/tasks/get-user-tasks';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
  User,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const PRIORITY_BADGE: Record<string, { label: string; className: string }> = {
  low:    { label: 'Basse',  className: 'bg-slate-100 text-slate-700' },
  medium: { label: 'Moyenne', className: 'bg-blue-100 text-blue-700' },
  high:   { label: 'Haute',  className: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgente', className: 'bg-red-100 text-red-700' },
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  ACTIVE:   { label: 'Active',    className: 'bg-blue-100 text-blue-700' },
  PENDING:  { label: 'En attente', className: 'bg-yellow-100 text-yellow-700' },
  COMPLETE: { label: 'Terminée',  className: 'bg-green-100 text-green-700' },
};

const UserCRMDashboard = async () => {
  const session = await getServerSession(authOptions);

  if (!session) return null;

  const tasks = await getUserCRMTasks(session.user.id);

  const active   = tasks.filter((t: any) => t.taskStatus === 'ACTIVE').length;
  const pending  = tasks.filter((t: any) => t.taskStatus === 'PENDING').length;
  const complete = tasks.filter((t: any) => t.taskStatus === 'COMPLETE').length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = tasks.filter((t: any) =>
    t.taskStatus !== 'COMPLETE' && t.dueDateAt && new Date(t.dueDateAt) < today
  ).length;

  const recentTasks = [...tasks].slice(0, 10);

  return (
    <Container
      title={`Mon tableau de bord — ${session.user.name}`}
      description="Vos tâches et activités CRM personnelles"
    >
      <div className="space-y-6">

        {/* ── KPI Cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <p className="text-sm font-medium text-gray-400">Total tâches</p>
              <ListTodo className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{tasks.length}</p>
              <p className="text-xs text-gray-400 mt-1">assignées à vous</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <p className="text-sm font-medium text-gray-400">En cours</p>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{active}</p>
              <p className="text-xs text-gray-400 mt-1">{pending} en attente</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <p className="text-sm font-medium text-gray-400">Terminées</p>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{complete}</p>
              <p className="text-xs text-gray-400 mt-1">
                {tasks.length > 0
                  ? `${Math.round((complete / tasks.length) * 100)} % complété`
                  : '—'}
              </p>
            </CardContent>
          </Card>

          <Card className={overdue > 0 ? 'border-red-300 bg-red-50' : ''}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <p className="text-sm font-medium text-gray-400">En retard</p>
              <AlertCircle className={`h-4 w-4 ${overdue > 0 ? 'text-red-500' : 'text-gray-400'}`} />
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${overdue > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                {overdue}
              </p>
              <p className="text-xs text-gray-400 mt-1">dépassement de délai</p>
            </CardContent>
          </Card>
        </div>

        {/* ── Liste des tâches ────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <p className="text-base font-bold" style={{ color: '#1E1D3D' }}>Mes tâches récentes</p>
            </div>
            <div className="mt-2 h-px bg-gray-100" />
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <p className="text-center text-gray-400 py-10">
                Aucune tâche assignée pour le moment.
              </p>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task: any) => {
                  const priority = PRIORITY_BADGE[task.priority?.toLowerCase()] ?? { label: task.priority, className: 'bg-slate-100 text-slate-700' };
                  const status   = STATUS_BADGE[task.taskStatus ?? 'ACTIVE'];
                  const isOverdue = task.taskStatus !== 'COMPLETE' && task.dueDateAt && new Date(task.dueDateAt) < today;

                  return (
                    <div key={task.id} className="flex items-start justify-between gap-3 py-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`text-sm font-medium truncate ${task.taskStatus === 'COMPLETE' ? 'line-through text-gray-400' : ''}`}>
                            {task.title}
                          </p>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${priority.className}`}>
                            {priority.label}
                          </span>
                        </div>
                        {task.content && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{task.content}</p>
                        )}
                        {task.dueDateAt && (
                          <p className={`text-xs mt-0.5 ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                            {isOverdue ? '⚠ ' : ''}
                            Échéance : {format(new Date(task.dueDateAt), 'dd MMM yyyy', { locale: fr })}
                          </p>
                        )}
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </Container>
  );
};

export default UserCRMDashboard;
