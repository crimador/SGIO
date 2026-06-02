'use client';

import Link from 'next/link';
import {
  Briefcase, CheckCircle2, AlertTriangle, Clock,
  ArrowRight, Calendar, User, Flag,
} from 'lucide-react';
import { BarChart } from '@tremor/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export type Comment = {
  id: string;
  comment: string;
  createdAt: string;
  assigned_user?: {
    name: string;
    avatar?: string;
  };
};

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
    </div>
  );
}

const PRIORITY_COLORS: Record<string, string> = {
  low:      'bg-green-100 text-green-700',
  normal:   'bg-yellow-100 text-yellow-700',
  medium:   'bg-orange-100 text-orange-700',
  high:     'bg-red-100 text-red-700',
  critical: 'bg-purple-100 text-purple-700',
};

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Faible', normal: 'Normale', medium: 'Moyenne',
  high: 'Haute', critical: 'Critique',
};

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function KPICard({
  title, value, sub, icon: Icon, href, alert = false,
}: {
  title: string; value: string | number; sub?: string;
  icon: any; href?: string; alert?: boolean;
}) {
  const inner = (
    <Card className={`overflow-hidden ${alert ? 'border-orange-300' : ''}`}>
      <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <Icon className={`h-4 w-4 ${alert ? 'text-orange-500' : 'text-gray-400'}`} />
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold ${alert ? 'text-orange-600' : ''}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function TaskRow({ task, overdue = false }: { task: any; overdue?: boolean }) {
  return (
    <Link href={`/projects/tasks/viewtask/${task.id}`}>
      <div className="flex items-center justify-between rounded-lg border px-3 py-2 hover:bg-[#FF7E00]/[0.04] transition-colors">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{task.title || 'Sans titre'}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {task.assignedTo && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <User className="h-3 w-3" />
                {task.assignedTo}
              </span>
            )}
            <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
              <Calendar className="h-3 w-3" />
              {fmtDate(task.dueDateAt)}
            </span>
          </div>
        </div>
        <span className={`ml-2 shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority] ?? 'bg-gray-100 text-gray-600'}`}>
          {PRIORITY_LABELS[task.priority] ?? task.priority}
        </span>
      </div>
    </Link>
  );
}

type DashboardData = {
  totalBoards: number;
  totalTasks: number;
  activeTasks: number;
  pendingTasks: number;
  completedTasks: number;
  overdueCount: number;
  completedThisMonth: number;
  priorityChart: { name: string; count: number }[];
  overdueTasks: any[];
  dueSoonTasks: any[];
  boardsProgress: { id: string; title: string; total: number; done: number; overdue: number }[];
};

const ProjectDashboardCockpit = ({ data }: { data: DashboardData }) => {
  const hasPriorityChart = data.priorityChart.length > 0;

  return (
    <div className="space-y-6">

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KPICard title="Projets" value={data.totalBoards} sub="Tableaux actifs" icon={Briefcase} href="/projects" />
        <KPICard title="Tâches actives" value={data.activeTasks} sub={`${data.pendingTasks} en attente`} icon={Clock} href="/projects/tasks" />
        <KPICard title="En retard" value={data.overdueCount} sub="Échéance dépassée" icon={AlertTriangle} href="/projects/tasks" alert={data.overdueCount > 0} />
        <KPICard title="Terminées" value={data.completedTasks} sub={`dont ${data.completedThisMonth} ce mois`} icon={CheckCircle2} />
      </div>

      {/* Graphique priorités + statuts */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <Card className="md:col-span-2 overflow-hidden">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardHeader className="pb-2 pt-4">
            <p className="text-sm font-medium flex items-center gap-2" style={{ color: '#1E1D3D' }}>
              <Flag className="h-4 w-4" />
              Tâches actives par priorité
            </p>
          </CardHeader>
          <CardContent>
            {hasPriorityChart ? (
              <BarChart
                className="h-44"
                data={data.priorityChart}
                index="name"
                categories={['count']}
                colors={['blue']}
                showLegend={false}
                yAxisWidth={40}
              />
            ) : (
              <div className="flex h-44 items-center justify-center">
                <p className="text-sm text-gray-400">Aucune tâche active</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardHeader className="pb-2 pt-4">
            <p className="text-sm font-medium flex items-center gap-2" style={{ color: '#1E1D3D' }}>
              <CheckCircle2 className="h-4 w-4" />
              Répartition des tâches
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {[
              { label: 'Actives',     value: data.activeTasks,    total: data.totalTasks, color: 'bg-blue-500' },
              { label: 'En attente',  value: data.pendingTasks,   total: data.totalTasks, color: 'bg-yellow-400' },
              { label: 'Terminées',   value: data.completedTasks, total: data.totalTasks, color: 'bg-green-500' },
            ].map(({ label, value, total, color }) => {
              const pct = total > 0 ? Math.round((value / total) * 100) : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">{label}</span>
                    <span className="font-medium">{value} <span className="text-gray-400">({pct}%)</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Listes tâches */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        <Card className="overflow-hidden">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                Tâches en retard ({data.overdueCount})
              </span>
              <Link href="/projects/tasks" className="flex items-center gap-1 text-xs hover:underline" style={{ color: '#FF7E00' }}>
                Voir tout <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.overdueTasks.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Aucune tâche en retard</p>
            ) : (
              data.overdueTasks.map((task) => (
                <TaskRow key={task.id} task={task} overdue />
              ))
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium" style={{ color: '#1E1D3D' }}>
                <Clock className="h-4 w-4" />
                À venir (7 jours) ({data.dueSoonTasks.length})
              </span>
              <Link href="/projects/dashboard" className="flex items-center gap-1 text-xs hover:underline" style={{ color: '#FF7E00' }}>
                Voir tout <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.dueSoonTasks.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Aucune tâche à venir</p>
            ) : (
              data.dueSoonTasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Avancement par projet */}
      {data.boardsProgress.length > 0 && (
        <Card className="overflow-hidden">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium" style={{ color: '#1E1D3D' }}>
                <Briefcase className="h-4 w-4" />
                Avancement par projet
              </span>
              <Link href="/projects" className="flex items-center gap-1 text-xs hover:underline" style={{ color: '#FF7E00' }}>
                Voir tout <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.boardsProgress.map((board) => {
              const pct = board.total > 0 ? Math.round((board.done / board.total) * 100) : 0;
              return (
                <Link key={board.id} href={`/projects/boards/${board.id}`}>
                  <div className="rounded-lg border px-3 py-2 hover:bg-[#FF7E00]/[0.04] transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium truncate max-w-[60%]">{board.title}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        {board.overdue > 0 && (
                          <span className="inline-flex items-center rounded-full border border-orange-300 px-2 py-0.5 text-xs font-medium text-orange-600">
                            {board.overdue} en retard
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {board.done}/{board.total} tâches
                        </span>
                        <span className="text-xs font-bold">{pct}%</span>
                      </div>
                    </div>
                    <ProgressBar value={pct} />
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default ProjectDashboardCockpit;
