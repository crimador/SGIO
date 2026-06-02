'use client';

import { useMemo } from 'react';
import { format, startOfMonth, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Users, Clock, DollarSign, FileText,
  TrendingUp, CheckCircle2, AlertCircle, XCircle,
} from 'lucide-react';
import { BarChart, DonutChart, Title } from '@tremor/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// ─── Types ────────────────────────────────────────────────────────────────────

type Employee = {
  id:        string;
  firstName: string;
  lastName:  string;
  position?: string | null;
  salary:    number;
};

type Timekeeping = {
  id:       string;
  timeIn:   string;
  timeOut?: string | null;
};

type Payslip = {
  id:        string;
  period:    string;
  netSalary: number;
  status:    string;
  employee:  { firstName: string; lastName: string; position?: string | null };
};

type Request = {
  id:       string;
  type:     string;
  status:   string;
  message:  string;
  employee: { firstName: string; lastName: string };
  createdAt: string;
};

type Props = {
  employeeData:    Employee[];
  timekeepingData: Timekeeping[];
  payslipData:     Payslip[];
  requestsData:    Request[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtAmount(n: number) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA';
}

function fmtHours(h: number) {
  return `${Math.round(h)} h`;
}

const TYPE_LABELS: Record<string, string> = {
  Vacation:  'Congé annuel',
  Leave:     'Congé exceptionnel',
  Sick:      'Arrêt maladie',
  Training:  'Formation',
  Raise:     'Augmentation',
  Documents: 'Documents',
  Other:     'Autre',
};

const MONTHS_FR: Record<string, string> = {
  '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr',
  '05': 'Mai', '06': 'Juin','07': 'Juil','08': 'Août',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc',
};

// ─── Composant ────────────────────────────────────────────────────────────────

export default function HRDashboard({ employeeData, timekeepingData, payslipData, requestsData }: Props) {
  const now          = new Date();
  const currentMonth = format(now, 'yyyy-MM');
  const monthStart   = startOfMonth(now);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const totalEmployees = employeeData.length;

  const masseSalarialeMois = useMemo(() =>
    payslipData
      .filter(p => p.period === currentMonth && ['EMIS', 'PAYE'].includes(p.status))
      .reduce((s, p) => s + (p.netSalary || 0), 0),
    [payslipData, currentMonth]
  );

  const demandesEnAttente = requestsData.filter(r => r.status === 'EN_ATTENTE').length;
  const demandesApprouvees = requestsData.filter(r => r.status === 'APPROUVE').length;
  const demandesRejetees   = requestsData.filter(r => r.status === 'REJETE').length;

  const heuresTotalesMois = useMemo(() =>
    timekeepingData
      .filter(t => new Date(t.timeIn) >= monthStart)
      .reduce((s, t) => {
        if (!t.timeOut) return s;
        const diff = (new Date(t.timeOut).getTime() - new Date(t.timeIn).getTime()) / 3_600_000;
        return s + diff;
      }, 0),
    [timekeepingData, monthStart]
  );

  // ── Masse salariale — 6 derniers mois ─────────────────────────────────────
  const salarialChart = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d      = subMonths(now, 5 - i);
      const period = format(d, 'yyyy-MM');
      const [, month] = period.split('-');
      const total  = payslipData
        .filter(p => p.period === period && ['EMIS', 'PAYE'].includes(p.status))
        .reduce((s, p) => s + (p.netSalary || 0), 0);
      return { mois: MONTHS_FR[month] ?? month, 'Masse salariale': Math.round(total) };
    });
  }, [payslipData]);

  // ── Répartition par poste ─────────────────────────────────────────────────
  const parPosteChart = useMemo(() => {
    const counts: Record<string, number> = {};
    employeeData.forEach(e => {
      const k = e.position || 'Non défini';
      counts[k] = (counts[k] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [employeeData]);

  // ── Dernières demandes en attente ─────────────────────────────────────────
  const dernDemandesEnAttente = requestsData
    .filter(r => r.status === 'EN_ATTENTE')
    .slice(0, 5);

  // ── Bulletins récents ──────────────────────────────────────────────────────
  const bulletinsRecents = [...payslipData].slice(0, 5);

  // ── Masse salariale totale (tous bulletins payés) ─────────────────────────
  const masseTotalePayee = useMemo(() =>
    payslipData
      .filter(p => p.status === 'PAYE')
      .reduce((s, p) => s + (p.netSalary || 0), 0),
    [payslipData]
  );

  return (
    <div className="space-y-6">

      {/* ── KPI Cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <Card className="overflow-hidden">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
            <p className="text-sm font-medium text-gray-400">Effectif total</p>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: '#1E1D3D' }}>{totalEmployees}</p>
            <p className="mt-1 text-xs text-gray-400">employé{totalEmployees > 1 ? 's' : ''}</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
            <p className="text-sm font-medium text-gray-400">Masse salariale</p>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold" style={{ color: '#1E1D3D' }}>
              {masseSalarialeMois > 0
                ? new Intl.NumberFormat('fr-FR').format(Math.round(masseSalarialeMois))
                : '—'}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              FCFA · {format(now, 'MMMM yyyy', { locale: fr })}
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
            <p className="text-sm font-medium text-gray-400">Demandes en attente</p>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: '#1E1D3D' }}>{demandesEnAttente}</p>
            <div className="mt-1 flex gap-2">
              <span className="text-xs text-green-600">{demandesApprouvees} approuvées</span>
              <span className="text-xs text-red-500">{demandesRejetees} rejetées</span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
            <p className="text-sm font-medium text-gray-400">Heures ce mois</p>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: '#1E1D3D' }}>{Math.round(heuresTotalesMois)}</p>
            <p className="mt-1 text-xs text-gray-400">
              heures pointées — {format(now, 'MMMM', { locale: fr })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Graphiques ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        {/* Masse salariale 6 mois */}
        <Card className="overflow-hidden md:col-span-2">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardHeader className="pb-2 pt-4">
            <p className="flex items-center gap-2 text-sm font-medium" style={{ color: '#1E1D3D' }}>
              <TrendingUp className="h-4 w-4" style={{ color: '#FF7E00' }} />
              Masse salariale — 6 derniers mois
            </p>
          </CardHeader>
          <CardContent>
            {salarialChart.every(d => d['Masse salariale'] === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucun bulletin émis ou payé</p>
            ) : (
              <BarChart
                className="h-48"
                data={salarialChart}
                index="mois"
                categories={['Masse salariale']}
                colors={['blue']}
                valueFormatter={(v) => new Intl.NumberFormat('fr-FR').format(v) + ' F'}
                showLegend={false}
                yAxisWidth={70}
              />
            )}
          </CardContent>
        </Card>

        {/* Répartition par poste */}
        <Card className="overflow-hidden">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardHeader className="pb-2 pt-4">
            <p className="flex items-center gap-2 text-sm font-medium" style={{ color: '#1E1D3D' }}>
              <Users className="h-4 w-4" style={{ color: '#FF7E00' }} />
              Effectif par poste
            </p>
          </CardHeader>
          <CardContent>
            {parPosteChart.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucun employé</p>
            ) : (
              <>
                <DonutChart
                  className="h-36"
                  data={parPosteChart}
                  category="value"
                  index="name"
                  colors={['blue', 'cyan', 'indigo', 'violet', 'fuchsia', 'emerald']}
                  showLabel={false}
                />
                <div className="mt-3 space-y-1">
                  {parPosteChart.map((item) => (
                    <div key={item.name} className="flex justify-between text-xs">
                      <span className="text-muted-foreground truncate max-w-[140px]">{item.name}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Activité récente ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        {/* Demandes en attente */}
        <Card className="overflow-hidden">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardHeader className="pb-2 pt-4">
            <p className="flex items-center gap-2 text-sm font-medium" style={{ color: '#1E1D3D' }}>
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Demandes à traiter
            </p>
          </CardHeader>
          <CardContent>
            {dernDemandesEnAttente.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">Aucune demande en attente</p>
            ) : (
              <div className="divide-y">
                {dernDemandesEnAttente.map((req) => (
                  <div key={req.id} className="flex items-start justify-between gap-2 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium" style={{ color: '#1E1D3D' }}>
                        {req.employee.firstName} {req.employee.lastName}
                      </p>
                      <p className="text-xs text-gray-400">{TYPE_LABELS[req.type] ?? req.type}</p>
                    </div>
                    <span className="inline-flex shrink-0 items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                      En attente
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bulletins récents */}
        <Card className="overflow-hidden">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardHeader className="pb-2 pt-4">
            <p className="flex items-center gap-2 text-sm font-medium" style={{ color: '#1E1D3D' }}>
              <DollarSign className="h-4 w-4 text-blue-500" />
              Bulletins récents
            </p>
          </CardHeader>
          <CardContent>
            {bulletinsRecents.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">Aucun bulletin</p>
            ) : (
              <div className="divide-y">
                {bulletinsRecents.map((p) => {
                  const [year, month] = p.period.split('-');
                  const label = `${MONTHS_FR[month] ?? month} ${year}`;
                  const statusIcon =
                    p.status === 'PAYE'     ? <CheckCircle2 className="h-4 w-4 text-green-500" /> :
                    p.status === 'EMIS'     ? <Clock className="h-4 w-4 text-blue-500" /> :
                    <XCircle className="h-4 w-4 text-gray-400" />;
                  return (
                    <div key={p.id} className="flex items-center justify-between gap-2 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium" style={{ color: '#1E1D3D' }}>
                          {p.employee.firstName} {p.employee.lastName}
                        </p>
                        <p className="text-xs text-gray-400">{label}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: '#1E1D3D' }}>
                          {new Intl.NumberFormat('fr-FR').format(p.netSalary)} F
                        </span>
                        {statusIcon}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Bilan global ────────────────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
        <CardHeader className="pb-2 pt-4">
          <p className="text-sm font-medium" style={{ color: '#1E1D3D' }}>Bilan global</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{totalEmployees}</p>
              <p className="text-xs text-muted-foreground mt-1">Employés actifs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">
                {payslipData.filter(p => p.status === 'PAYE').length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Bulletins payés</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{demandesEnAttente}</p>
              <p className="text-xs text-muted-foreground mt-1">Demandes en attente</p>
            </div>
            <div>
              <p className="text-xl font-bold text-indigo-600">
                {masseTotalePayee > 0
                  ? new Intl.NumberFormat('fr-FR').format(Math.round(masseTotalePayee))
                  : '—'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">FCFA versés (total)</p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
