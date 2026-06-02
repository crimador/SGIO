import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getClientStatement } from '@/actions/billing/get-client-statement';
import { StatementTable } from './StatementTable';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, Download, TrendingUp, TrendingDown, Scale } from 'lucide-react';

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
}

export default async function ClientStatementPage({ params }: { params: { accountId: string } }) {
  const statement = await getClientStatement(params.accountId);
  if (!statement) notFound();

  const { account, entries, totalDebit, totalCredit, solde } = statement;

  return (
    <div className="space-y-6 p-6">
      {/* Barre haut */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/finance/releve"
            className="flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-[#FF7E00]/[0.06]"
            style={{ color: '#1E1D3D' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1E1D3D' }}>{account.name}</h1>
            <p className="text-sm text-gray-400">
              Relevé de compte client
              {account.nif ? ` · NIF : ${account.nif}` : ''}
              {account.billing_city ? ` · ${account.billing_city}` : ''}
            </p>
          </div>
        </div>
        <a
          href={`/api/billing/statement/${account.id}/pdf`}
          download={`releve-${account.name}.pdf`}
          className="flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-[#FF7E00]/[0.06]"
          style={{ color: '#1E1D3D' }}
        >
          <Download className="h-4 w-4" />
          Exporter PDF
        </a>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="overflow-hidden">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardHeader className="pb-2 pt-4">
            <p className="flex items-center gap-1.5 text-xs text-gray-400">
              <TrendingUp className="h-4 w-4" style={{ color: '#FF7E00' }} />
              Total facturé
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold" style={{ color: '#1E1D3D' }}>{fmt(totalDebit)}</p>
            <p className="mt-1 text-xs text-gray-400">FCFA</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="h-[3px] bg-green-400" />
          <CardHeader className="pb-2 pt-4">
            <p className="flex items-center gap-1.5 text-xs text-gray-400">
              <TrendingDown className="h-4 w-4 text-green-600" />
              Total réglé + avoirs
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700">{fmt(totalCredit)}</p>
            <p className="mt-1 text-xs text-gray-400">FCFA</p>
          </CardContent>
        </Card>

        <Card className={`overflow-hidden ${solde > 0 ? 'border-[#FF7E00]/40' : 'border-green-200'}`}>
          <div className="h-[3px]" style={{ background: solde > 0 ? '#FF7E00' : '#22c55e' }} />
          <CardHeader className={`pb-2 pt-4 ${solde > 0 ? 'bg-[#FF7E00]/[0.03]' : 'bg-green-50/40 dark:bg-green-950/20'}`}>
            <p className="flex items-center gap-1.5 text-xs">
              <Scale className={`h-4 w-4 ${solde > 0 ? '' : 'text-green-600'}`} style={solde > 0 ? { color: '#FF7E00' } : {}} />
              <span className={solde > 0 ? '' : 'text-gray-400'} style={solde > 0 ? { color: '#FF7E00' } : {}}>Solde dû</span>
            </p>
          </CardHeader>
          <CardContent className={solde > 0 ? 'bg-[#FF7E00]/[0.03]' : 'bg-green-50/40 dark:bg-green-950/20'}>
            <p className={`text-2xl font-bold ${solde > 0 ? '' : 'text-green-700'}`} style={solde > 0 ? { color: '#FF7E00' } : {}}>
              {fmt(Math.abs(solde))}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              FCFA · {solde > 0 ? 'Client débiteur' : solde === 0 ? 'Compte soldé' : 'Client créditeur'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des mouvements */}
      <Card className="overflow-hidden">
        <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
        <CardHeader className="pb-3 pt-5">
          <p className="text-sm font-semibold" style={{ color: '#1E1D3D' }}>Historique des mouvements</p>
          <p className="mt-0.5 text-xs text-gray-400">
            {entries.length} mouvement{entries.length !== 1 ? 's' : ''} — factures, avoirs et règlements
          </p>
        </CardHeader>
        <CardContent>
          <StatementTable
            entries={entries}
            totalDebit={totalDebit}
            totalCredit={totalCredit}
            solde={solde}
          />
        </CardContent>
      </Card>
    </div>
  );
}
