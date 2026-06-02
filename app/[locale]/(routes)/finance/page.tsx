import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getFinanceDashboard } from '@/actions/finance/get-finance-dashboard';
import Container from '@/app/[locale]/(routes)/components/ui/Container';
import { FinanceCharts } from './components/FinanceCharts';
import { DocumentStatusBadge, DocumentTypeBadge } from './invoices/components/DocumentStatusBadge';
import {
  TrendingUp, TrendingDown, Wallet, AlertTriangle, ArrowRight,
} from 'lucide-react';

function fmt(n: number) {
  return n.toLocaleString('fr-FR');
}

export default async function FinanceDashboardPage() {
  const data = await getFinanceDashboard();
  const { kpis, monthlyData, topCategories, recentDocs } = data;

  return (
    <Container title="Tableau de bord Finance" description="Vue d'ensemble de la situation financière du cabinet">

      {/* ── KPIs ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        {/* Trésorerie globale */}
        <div
          className="relative overflow-hidden rounded-xl p-5 text-white"
          style={{ background: 'linear-gradient(135deg, #1E1D3D 0%, #36355F 100%)' }}
        >
          <div className="absolute inset-0 opacity-[0.06]">
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="kpiRays" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                  <line x1="40" y1="40" x2="40" y2="10"  stroke="#FAC731" strokeWidth="1.5" />
                  <line x1="40" y1="40" x2="65" y2="15"  stroke="#FAC731" strokeWidth="1.5" />
                  <line x1="40" y1="40" x2="70" y2="40"  stroke="#FAC731" strokeWidth="1.5" />
                  <line x1="40" y1="40" x2="15" y2="15"  stroke="#FAC731" strokeWidth="1.5" />
                  <line x1="40" y1="40" x2="10" y2="40"  stroke="#FAC731" strokeWidth="1.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#kpiRays)" />
            </svg>
          </div>
          <div className="relative">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-white/70">Trésorerie globale</p>
              <Wallet className="h-5 w-5 text-white/50" />
            </div>
            <p className="text-3xl font-bold">{fmt(kpis.soldeGlobal)}</p>
            <p className="mt-1 text-xs text-white/50">FCFA · tous comptes</p>
          </div>
          <div
            className="absolute bottom-0 left-0 h-[3px] w-full"
            style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }}
          />
        </div>

        {/* CA encaissé */}
        <div className="overflow-hidden rounded-xl border">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <div className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">CA encaissé ce mois</p>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">{fmt(kpis.caMois)}</p>
            <p className="text-xs text-gray-400">FCFA TTC</p>
          </div>
        </div>

        {/* Dépenses */}
        <div className="overflow-hidden rounded-xl border">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <div className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Dépenses ce mois</p>
              <TrendingDown className="h-4 w-4 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-500">{fmt(kpis.depensesMois)}</p>
            <p className="text-xs text-gray-400">FCFA</p>
          </div>
        </div>

        {/* Factures impayées */}
        <Link href="/finance/invoices/unpaid" className="block">
          <div
            className={`h-full overflow-hidden rounded-xl border transition-shadow hover:shadow-md ${
              kpis.countEnRetard > 0 ? 'border-[#FF7E00]/40' : ''
            }`}
          >
            <div
              className="h-[3px]"
              style={{ background: kpis.countEnRetard > 0 ? '#FF7E00' : 'linear-gradient(to right, #FF7E00, #FAC731)' }}
            />
            <div
              className={`p-5 space-y-2 ${kpis.countEnRetard > 0 ? 'bg-[#FF7E00]/[0.04]' : ''}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Factures impayées</p>
                <AlertTriangle
                  className="h-4 w-4"
                  style={{ color: kpis.countEnRetard > 0 ? '#FF7E00' : '#9ca3af' }}
                />
              </div>
              <p
                className="text-2xl font-bold"
                style={{ color: kpis.countEnRetard > 0 ? '#FF7E00' : '#1E1D3D' }}
              >
                {fmt(kpis.totalImpayes)}
              </p>
              <p className="text-xs text-gray-400">
                FCFA · {kpis.countEnRetard > 0 ? `${kpis.countEnRetard} en retard` : 'aucun retard'}
              </p>
            </div>
          </div>
        </Link>

      </div>

      {/* ── Graphiques + Documents récents ──────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Graphiques (2/3) */}
        <div className="lg:col-span-2">
          <FinanceCharts monthlyData={monthlyData} topCategories={topCategories} />
        </div>

        {/* Documents récents (1/3) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold" style={{ color: '#1E1D3D' }}>Documents récents</p>
            <Link
              href="/finance/invoices"
              className="flex items-center gap-1 text-xs font-medium hover:underline"
              style={{ color: '#FF7E00' }}
            >
              Tout voir <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {recentDocs.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">Aucun document</p>
            ) : (
              recentDocs.map((doc) => (
                <Link key={doc.id} href={`/finance/invoices/${doc.id}`} className="block">
                  <div className="space-y-1.5 rounded-xl border px-3 py-2.5 transition-colors hover:bg-[#FF7E00]/[0.04]">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="font-mono text-xs font-semibold"
                        style={{ color: '#1E1D3D' }}
                      >
                        {doc.number}
                      </span>
                      <DocumentTypeBadge type={doc.type} />
                    </div>
                    <p className="truncate text-sm text-gray-500">{doc.clientName}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {format(new Date(doc.issueDate), 'dd/MM/yyyy', { locale: fr })}
                      </span>
                      <div className="flex items-center gap-2">
                        <DocumentStatusBadge status={doc.status} dueDate={(doc as any).dueDate} />
                        <span className="text-xs font-semibold" style={{ color: '#1E1D3D' }}>
                          {fmt(doc.totalTTC)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>

    </Container>
  );
}
