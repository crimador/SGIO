import { getTreasuryDashboard } from '@/actions/finance/get-treasury-dashboard';
import Container from '@/app/[locale]/(routes)/components/ui/Container';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Wallet, Landmark, Smartphone, Coins } from 'lucide-react';
import type React from 'react';

const ACCOUNT_TYPE_ICONS: Record<string, React.ReactNode> = {
  BANQUE:       <Landmark className="h-5 w-5" />,
  CAISSE:       <Coins className="h-5 w-5" />,
  MOBILE_MONEY: <Smartphone className="h-5 w-5" />,
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  VIREMENT: 'Virement',
  ESPECES:  'Espèces',
  FLOOZ:    'Flooz (Moov)',
  T_MONEY:  'T-Money (Togocel)',
};

function fmt(n: number) {
  return n.toLocaleString('fr-FR');
}

export default async function TreasuryPage() {
  const data = await getTreasuryDashboard();

  return (
    <Container title="Trésorerie" description="Soldes et mouvements de vos comptes">

      {/* Carte solde global */}
      <div
        className="relative overflow-hidden rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, #1E1D3D 0%, #36355F 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.05]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="tRays" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <line x1="40" y1="40" x2="40" y2="10" stroke="#FAC731" strokeWidth="1.5" />
                <line x1="40" y1="40" x2="65" y2="15" stroke="#FAC731" strokeWidth="1.5" />
                <line x1="40" y1="40" x2="70" y2="40" stroke="#FAC731" strokeWidth="1.5" />
                <line x1="40" y1="40" x2="15" y2="15" stroke="#FAC731" strokeWidth="1.5" />
                <line x1="40" y1="40" x2="10" y2="40" stroke="#FAC731" strokeWidth="1.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#tRays)" />
          </svg>
        </div>
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">Solde global</p>
            <p className="mt-1 text-4xl font-bold text-white">{fmt(data.soldeGlobal)} XOF</p>
            <div className="mt-3 flex gap-6 text-sm text-white/60">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-400" />
                Entrées : {fmt(data.totalEntrees)} XOF
              </span>
              <span className="flex items-center gap-1">
                <TrendingDown className="h-4 w-4 text-red-400" />
                Sorties : {fmt(data.totalSorties)} XOF
              </span>
            </div>
          </div>
          <Wallet className="h-12 w-12 text-white/15" />
        </div>
        <div
          className="absolute bottom-0 left-0 h-[3px] w-full"
          style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }}
        />
      </div>

      {/* Cartes par compte */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.accounts.map((acc) => (
          <div key={acc.id} className="overflow-hidden rounded-xl border transition-shadow hover:shadow-sm">
            <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-gray-400">
                {ACCOUNT_TYPE_ICONS[acc.type]}
                <span className="text-sm font-medium" style={{ color: '#1E1D3D' }}>{acc.name}</span>
              </div>
              <p className={`text-2xl font-bold ${acc.solde < 0 ? 'text-red-500' : ''}`} style={acc.solde >= 0 ? { color: '#1E1D3D' } : {}}>
                {fmt(acc.solde)} <span className="text-sm font-normal text-gray-400">XOF</span>
              </p>
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="h-3 w-3" /> {fmt(acc.entrees)}
                </span>
                <span className="flex items-center gap-1 text-red-500">
                  <TrendingDown className="h-3 w-3" /> {fmt(acc.sorties)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Derniers mouvements */}
      <div>
        <h2
          className="mb-3 flex items-center gap-2 border-l-[3px] pl-3 text-sm font-semibold uppercase tracking-wide"
          style={{ borderColor: '#FF7E00', color: '#1E1D3D' }}
        >
          Derniers mouvements
        </h2>

        {data.recentEntries.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">Aucun mouvement enregistré</p>
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead style={{ background: '#F4F2F2' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Compte</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Mode</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Référence</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.recentEntries.map((entry) => (
                  <tr key={entry.id} className="transition-colors hover:bg-[#FF7E00]/[0.03]">
                    <td className="whitespace-nowrap px-4 py-3 text-gray-400">
                      {format(new Date(entry.date), 'dd/MM/yyyy', { locale: fr })}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3">{entry.description}</td>
                    <td className="px-4 py-3 text-gray-400">{entry.accountName}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {PAYMENT_METHOD_LABELS[entry.paymentMethod] ?? entry.paymentMethod}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{entry.reference ?? '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                      <span className={entry.type === 'ENTREE' ? 'text-green-600' : 'text-red-500'}>
                        {entry.type === 'ENTREE' ? '+' : '-'}{fmt(entry.amount)} XOF
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </Container>
  );
}
