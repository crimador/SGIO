'use client';

import Link from 'next/link';
import {
  DollarSign, Users, FileText, TrendingUp,
  TrendingDown, Briefcase, AlertTriangle,
  CheckCircle2, ArrowRight, Landmark, Target,
} from 'lucide-react';
import { BarChart } from '@tremor/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n));
}

const TYPE_LABELS: Record<string, string> = {
  Vacation: 'Congé annuel', Leave: 'Congé exceptionnel', Sick: 'Arrêt maladie',
  Training: 'Formation', Raise: 'Augmentation', Documents: 'Documents', Other: 'Autre',
};

const STATUS_COLORS: Record<string, string> = {
  BROUILLON: 'bg-gray-100 text-gray-600',
  EMISE:     'bg-[#1E1D3D]/10 text-[#1E1D3D]',
  PAYEE:     'bg-green-100 text-green-700',
  ANNULEE:   'bg-red-100 text-red-600',
  EN_RETARD: 'bg-[#FF7E00]/15 text-[#FF7E00]',
};

function getEffectiveStatus(status: string, dueDate: string | null) {
  if (status === 'EMISE' && dueDate && new Date(dueDate) < new Date()) return 'EN_RETARD';
  return status;
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <h2
      className="mb-3 flex items-center gap-2 border-l-[3px] pl-3 text-sm font-semibold uppercase tracking-wide"
      style={{ borderColor: '#FF7E00', color: '#1E1D3D' }}
    >
      <Icon className="h-4 w-4" style={{ color: '#FF7E00' }} />
      {label}
    </h2>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KPICard({
  title, value, sub, icon: Icon, href, alert = false,
}: {
  title: string; value: string; sub?: string;
  icon: any; href?: string; alert?: boolean;
}) {
  const inner = (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div
        className="h-[3px] w-full"
        style={{ background: alert ? '#FF7E00' : 'linear-gradient(to right, #FF7E00, #FAC731)' }}
      />
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {title}
        </p>
        <Icon
          className="h-4 w-4"
          style={{ color: '#FF7E00' }}
        />
      </CardHeader>
      <CardContent>
        <p
          className="text-2xl font-bold"
          style={{ color: alert ? '#FF7E00' : '#1E1D3D' }}
        >
          {value}
        </p>
        {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  data: {
    caMois: number; depensesMois: number; totalImpayes: number;
    facturesEnRetard: number; soldeGlobal: number;
    caParMois: { mois: string; 'CA (FCFA)': number }[];
    recentDocs: { id: string; number: string; type: string; status: string; totalTTC: number; dueDate: string | null; client: string }[];
    employees: number; masseSalarialeMois: number; demandesEnAttente: number; heuresTotalesMois: number;
    recentRequests: any[];
    accountsCount: number; leadsCount: number; opportunitiesCount: number; pipelineTotal: number;
    boardsCount: number; tasksCount: number;
  };
  modules: { name: string; enabled: boolean }[];
};

// ─── Composant ────────────────────────────────────────────────────────────────

export default function GlobalDashboard({ data, modules }: Props) {
  const hrEnabled      = modules.find(m => m.name === 'employee' || m.name === 'hr')?.enabled;
  const crmEnabled     = modules.find(m => m.name === 'crm')?.enabled;
  const invoiceEnabled = modules.find(m => m.name === 'invoice')?.enabled;
  const projectsEnabled = modules.find(m => m.name === 'projects')?.enabled;

  const hasChart = data.caParMois.some(d => d['CA (FCFA)'] > 0);

  return (
    <div className="space-y-6">

      {/* ── Ligne 1 : KPIs Finance ──────────────────────────────────────────── */}
      {invoiceEnabled && (
        <div>
          <SectionHeader icon={DollarSign} label="Finance" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KPICard
              title="CA du mois"
              value={data.caMois > 0 ? `${fmt(data.caMois)} F` : '—'}
              sub="Factures encaissées"
              icon={TrendingUp}
              href="/finance"
            />
            <KPICard
              title="Trésorerie"
              value={`${fmt(data.soldeGlobal)} F`}
              sub="Solde global"
              icon={Landmark}
              href="/finance"
            />
            <KPICard
              title="Impayés"
              value={data.totalImpayes > 0 ? `${fmt(data.totalImpayes)} F` : '—'}
              sub={`${data.facturesEnRetard > 0 ? `dont ${data.facturesEnRetard} en retard` : 'Aucune en retard'}`}
              icon={AlertTriangle}
              href="/finance/invoices"
              alert={data.facturesEnRetard > 0}
            />
            <KPICard
              title="Dépenses du mois"
              value={data.depensesMois > 0 ? `${fmt(data.depensesMois)} F` : '—'}
              sub="Charges enregistrées"
              icon={TrendingDown}
              href="/finance"
            />
          </div>
        </div>
      )}

      {/* ── Ligne 2 : Graphique CA + CRM ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        {/* Graphique CA 6 mois */}
        {invoiceEnabled && (
          <Card className="md:col-span-2 overflow-hidden">
            <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
            <CardHeader className="pb-2 pt-4">
              <p className="flex items-center gap-2 text-sm font-bold" style={{ color: '#1E1D3D' }}>
                <TrendingUp className="h-4 w-4" style={{ color: '#FF7E00' }} />
                Chiffre d&apos;affaires — 6 derniers mois
              </p>
            </CardHeader>
            <CardContent>
              {hasChart ? (
                <BarChart
                  className="h-48"
                  data={data.caParMois}
                  index="mois"
                  categories={['CA (FCFA)']}
                  colors={['orange']}
                  valueFormatter={(v) => `${fmt(v)} F`}
                  showLegend={false}
                  yAxisWidth={80}
                />
              ) : (
                <div className="flex h-48 items-center justify-center">
                  <p className="text-sm text-gray-400">Aucune facture encaissée sur 6 mois</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* CRM stats */}
        {crmEnabled && (
          <Card className={`overflow-hidden${!invoiceEnabled ? ' md:col-span-3' : ''}`}>
            <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
            <CardHeader className="pb-2 pt-4">
              <p className="flex items-center gap-2 text-sm font-bold" style={{ color: '#1E1D3D' }}>
                <Target className="h-4 w-4" style={{ color: '#FF7E00' }} /> CRM
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/crm/accounts" className="flex items-center justify-between rounded-lg p-2 -mx-2 transition-colors hover:bg-[#FF7E00]/[0.05]">
                <div className="flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Comptes clients</span>
                </div>
                <span className="text-xl font-bold" style={{ color: '#1E1D3D' }}>{data.accountsCount}</span>
              </Link>
              <div className="h-px bg-gray-100" />
              <Link href="/crm/leads" className="flex items-center justify-between rounded-lg p-2 -mx-2 transition-colors hover:bg-[#FF7E00]/[0.05]">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Leads</span>
                </div>
                <span className="text-xl font-bold" style={{ color: '#1E1D3D' }}>{data.leadsCount}</span>
              </Link>
              <div className="h-px bg-gray-100" />
              <Link href="/crm/opportunities" className="flex items-center justify-between rounded-lg p-2 -mx-2 transition-colors hover:bg-[#FF7E00]/[0.05]">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Opportunités</span>
                </div>
                <span className="text-xl font-bold" style={{ color: '#1E1D3D' }}>{data.opportunitiesCount}</span>
              </Link>
              {data.pipelineTotal > 0 && (
                <>
                  <div className="h-px bg-gray-100" />
                  <div className="px-2">
                    <p className="text-xs text-gray-400">Pipeline total</p>
                    <p className="text-lg font-bold" style={{ color: '#FF7E00' }}>{fmt(data.pipelineTotal)} F</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Ligne 3 : RH + Activité récente ─────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        {/* RH */}
        {hrEnabled && (
          <Card className="overflow-hidden">
            <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
            <CardHeader className="pb-2 pt-4">
              <p className="flex items-center justify-between text-sm font-bold" style={{ color: '#1E1D3D' }}>
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" style={{ color: '#FF7E00' }} />
                  Ressources Humaines
                </span>
                <Link
                  href="/hr"
                  className="flex items-center gap-1 text-xs font-medium hover:underline"
                  style={{ color: '#FF7E00' }}
                >
                  Voir <ArrowRight className="h-3 w-3" />
                </Link>
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg p-3 text-center" style={{ background: '#1E1D3D' }}>
                  <p className="text-2xl font-bold text-white">{data.employees}</p>
                  <p className="text-xs text-white/60">Employés</p>
                </div>
                <div className="rounded-lg p-3 text-center" style={{ background: '#FF7E00' }}>
                  <p className="text-2xl font-bold text-white">{data.demandesEnAttente}</p>
                  <p className="text-xs text-white/80">En attente</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 text-center">
                  <p className="text-lg font-bold" style={{ color: '#1E1D3D' }}>{data.heuresTotalesMois} h</p>
                  <p className="text-xs text-gray-400">Heures / mois</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 text-center">
                  <p className="text-sm font-bold leading-tight" style={{ color: '#1E1D3D' }}>
                    {data.masseSalarialeMois > 0 ? `${fmt(data.masseSalarialeMois)} F` : '—'}
                  </p>
                  <p className="text-xs text-gray-400">Masse sal.</p>
                </div>
              </div>

              {data.recentRequests.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">À traiter</p>
                  {data.recentRequests.map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between py-1 text-xs">
                      <span className="max-w-[130px] truncate">
                        {r.employee.firstName} {r.employee.lastName}
                      </span>
                      <span className="inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium" style={{ color: '#1E1D3D' }}>
                        {TYPE_LABELS[r.type] ?? r.type}
                      </span>
                    </div>
                  ))}
                  <Link
                    href="/hr?tab=conges"
                    className="mt-1 flex items-center gap-1 text-xs font-medium hover:underline"
                    style={{ color: '#FF7E00' }}
                  >
                    Voir toutes <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Factures récentes */}
        {invoiceEnabled && (
          <Card className={`overflow-hidden${!hrEnabled ? ' md:col-span-3' : ' md:col-span-2'}`}>
            <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
            <CardHeader className="pb-2 pt-4">
              <p className="flex items-center justify-between text-sm font-bold" style={{ color: '#1E1D3D' }}>
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" style={{ color: '#FF7E00' }} />
                  Dernières factures
                </span>
                <Link
                  href="/finance/invoices"
                  className="flex items-center gap-1 text-xs font-medium hover:underline"
                  style={{ color: '#FF7E00' }}
                >
                  Voir tout <ArrowRight className="h-3 w-3" />
                </Link>
              </p>
            </CardHeader>
            <CardContent>
              {data.recentDocs.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">Aucune facture</p>
              ) : (
                <div className="space-y-2">
                  {data.recentDocs.map((doc) => {
                    const effStatus = getEffectiveStatus(doc.status, doc.dueDate);
                    return (
                      <Link key={doc.id} href={`/finance/invoices/${doc.id}`}>
                        <div className="flex items-center justify-between rounded-lg border px-3 py-2 transition-colors hover:bg-[#FF7E00]/[0.04]">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium" style={{ color: '#1E1D3D' }}>{doc.client}</p>
                            <p className="text-xs text-gray-400">{doc.number}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            <span className="text-sm font-bold" style={{ color: '#1E1D3D' }}>{fmt(doc.totalTTC)} F</span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[effStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                              {effStatus === 'EN_RETARD' ? 'En retard' :
                               effStatus === 'PAYEE'     ? 'Payée' :
                               effStatus === 'EMISE'     ? 'Émise' :
                               effStatus === 'BROUILLON' ? 'Brouillon' : effStatus}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Ligne 4 : Projets ────────────────────────────────────────────────── */}
      {projectsEnabled && (
        <div>
          <SectionHeader icon={Briefcase} label="Projets" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KPICard
              title="Projets actifs"
              value={String(data.boardsCount)}
              icon={Briefcase}
              href="/projects"
            />
            <KPICard
              title="Tâches actives"
              value={String(data.tasksCount)}
              sub="ACTIVE + PENDING"
              icon={CheckCircle2}
              href="/projects"
            />
          </div>
        </div>
      )}

    </div>
  );
}
