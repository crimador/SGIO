'use client';

import { BarChart, AreaChart } from '@tremor/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Users, TrendingUp, Target, Briefcase,
  ArrowRight, Trophy, PieChart,
} from 'lucide-react';

type Props = {
  data: Awaited<ReturnType<import('@/actions/crm/get-crm-reports').getCrmReports>>;
};

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n));
}

function KpiCard({ icon: Icon, label, value, sub, color = '' }: {
  icon: any; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <p className="text-sm font-medium text-gray-400">{label}</p>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
        {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export function CrmReportsView({ data }: Props) {
  const { kpis, pipelineByStage, topPerformers, monthlyEvolution } = data;

  const maxPipeline = Math.max(...pipelineByStage.map(s => s.totalBudget), 1);

  return (
    <div className="space-y-6">

      {/* ── KPIs ─────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard icon={Users} label="Prospects total" value={kpis.totalLeads} sub={`${kpis.convertedLeads} convertis`} />
        <KpiCard icon={Target} label="Taux de conversion" value={`${kpis.conversionRate} %`} sub="Leads → Opportunités" color={kpis.conversionRate >= 20 ? 'text-green-600' : 'text-amber-600'} />
        <KpiCard icon={Briefcase} label="Opportunités" value={kpis.totalOpportunities} sub={`${kpis.closedOpportunities} fermées`} />
        <KpiCard icon={TrendingUp} label="Valeur pipeline" value={`${fmt(kpis.totalPipelineValue)} F`} sub="budget total actif" />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard icon={Users} label="Comptes clients" value={kpis.totalAccounts} />
        <KpiCard icon={Users} label="Contacts" value={kpis.totalContacts} />
        <KpiCard icon={Trophy} label="Opp. fermées gagnées" value={kpis.closedOpportunities} />
        <KpiCard icon={PieChart} label="Stades actifs" value={pipelineByStage.filter(s => s.count > 0).length} sub={`sur ${pipelineByStage.length} stades`} />
      </div>

      {/* ── Entonnoir de conversion ───────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <p className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#1E1D3D' }}>
            <ArrowRight className="h-4 w-4" /> Entonnoir commercial
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            {[
              { label: 'Prospects', value: kpis.totalLeads, color: 'bg-blue-500' },
              { label: 'Convertis', value: kpis.convertedLeads, color: 'bg-indigo-500' },
              { label: 'Opportunités', value: kpis.totalOpportunities, color: 'bg-violet-500' },
              { label: 'Fermées', value: kpis.closedOpportunities, color: 'bg-emerald-500' },
            ].map((step, i) => {
              const pct = kpis.totalLeads > 0 ? Math.max(10, Math.round((step.value / kpis.totalLeads) * 100)) : 10;
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-2xl font-bold">{step.value}</span>
                  <div className="w-full rounded-t-md" style={{ height: `${pct * 1.2}px` }}>
                    <div className={`h-full w-full rounded-t-md ${step.color} opacity-80`} />
                  </div>
                  <span className="text-center text-xs text-gray-400">{step.label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Pipeline par stade ────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <p className="text-sm font-semibold" style={{ color: '#1E1D3D' }}>Pipeline par stade</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {pipelineByStage.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">Aucun stade configuré</p>
            ) : (
              pipelineByStage.map((s) => (
                <div key={s.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{s.stage}</span>
                      <span className="inline-flex items-center rounded-sm bg-gray-100 px-1 text-xs font-normal">{s.count}</span>
                    </div>
                    <span className="text-gray-400">{fmt(s.totalBudget)} F</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${maxPipeline > 0 ? (s.totalBudget / maxPipeline) * 100 : 0}%`,
                        background: 'linear-gradient(to right, #FF7E00, #FAC731)',
                      }}
                    />
                  </div>
                  {s.probability > 0 && (
                    <p className="text-xs text-gray-400">
                      Valeur pondérée : {fmt(s.weightedValue)} F ({s.probability}%)
                    </p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Top commerciaux */}
        <Card>
          <CardHeader className="pb-3">
            <p className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#1E1D3D' }}>
              <Trophy className="h-4 w-4 text-amber-500" /> Top commerciaux
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPerformers.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">Aucune opportunité assignée</p>
            ) : (
              topPerformers.map((u, i) => (
                <div key={u.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-sm font-bold w-5 ${i === 0 ? 'text-amber-500' : 'text-gray-400'}`}>
                      {i + 1}.
                    </span>
                    <span className="truncate text-sm font-medium">{u.name}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium" style={{ color: '#1E1D3D' }}>{u.count} opp.</span>
                    <span className="text-sm font-semibold">{fmt(u.totalBudget)} F</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Évolution mensuelle ───────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <p className="text-sm font-semibold" style={{ color: '#1E1D3D' }}>Évolution — 6 derniers mois</p>
        </CardHeader>
        <CardContent>
          <AreaChart
            className="h-52"
            data={monthlyEvolution}
            index="mois"
            categories={['Prospects', 'Opportunités']}
            colors={['blue', 'violet']}
            showLegend
            showGridLines
            valueFormatter={(v) => `${v}`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <p className="text-sm font-semibold" style={{ color: '#1E1D3D' }}>Budget pipeline — 6 derniers mois (FCFA)</p>
        </CardHeader>
        <CardContent>
          <BarChart
            className="h-48"
            data={monthlyEvolution}
            index="mois"
            categories={['Budget (FCFA)']}
            colors={['indigo']}
            valueFormatter={(v) => fmt(v) + ' F'}
            showLegend={false}
            yAxisWidth={80}
          />
        </CardContent>
      </Card>

    </div>
  );
}
