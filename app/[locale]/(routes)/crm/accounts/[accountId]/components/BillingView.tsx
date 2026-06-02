import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText, TrendingUp, AlertTriangle, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DocumentStatusBadge, DocumentTypeBadge } from '@/app/[locale]/(routes)/finance/invoices/components/DocumentStatusBadge';

function fmt(n: number) {
  return Math.round(n).toLocaleString('fr-FR');
}

type BillingData = {
  totalFacture:  number;
  totalEncaisse: number;
  soldeDu:       number;
  countTotal:    number;
  countEmises:   number;
  recentDocs: {
    id:        string;
    number:    string;
    type:      string;
    status:    string;
    totalTTC:  number;
    amountDue: number;
    issueDate: string;
    dueDate:   string | null;
  }[];
};

export function BillingView({ data, accountId }: { data: BillingData; accountId: string }) {
  const { totalFacture, totalEncaisse, soldeDu, countTotal, countEmises, recentDocs } = data;

  return (
    <div className="space-y-4">
      {/* En-tête section */}
      <div className="flex items-center justify-between">
        <p
          className="flex items-center gap-2 border-l-[3px] pl-3 text-xs font-semibold uppercase tracking-wide text-gray-400"
          style={{ borderColor: '#FF7E00' }}
        >
          <FileText className="h-4 w-4" style={{ color: '#FF7E00' }} />
          Situation financière
        </p>
        <Link
          href={`/finance/invoices/new?clientId=${accountId}`}
          className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-white transition-all active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Nouvelle facture
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border overflow-hidden">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <div className="p-4 space-y-1">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Total facturé</p>
            <p className="text-xl font-bold" style={{ color: '#1E1D3D' }}>{fmt(totalFacture)}</p>
            <p className="text-xs text-gray-400">FCFA · {countTotal} facture{countTotal > 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden">
          <div className="h-[3px] bg-green-400" />
          <div className="p-4 space-y-1">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <p className="text-xs text-green-700 dark:text-green-400 uppercase tracking-wide">Encaissé</p>
            </div>
            <p className="text-xl font-bold text-green-700 dark:text-green-400">{fmt(totalEncaisse)}</p>
            <p className="text-xs text-gray-400">FCFA</p>
          </div>
        </div>

        <div className={`rounded-xl border overflow-hidden ${soldeDu > 0 ? 'border-[#FF7E00]/40' : ''}`}>
          <div className="h-[3px]" style={{ background: soldeDu > 0 ? '#FF7E00' : '#e5e7eb' }} />
          <div className={`p-4 space-y-1 ${soldeDu > 0 ? 'bg-[#FF7E00]/[0.04]' : ''}`}>
            <div className="flex items-center gap-1">
              {soldeDu > 0 && <AlertTriangle className="h-3 w-3" style={{ color: '#FF7E00' }} />}
              <p className={`text-xs uppercase tracking-wide ${soldeDu > 0 ? '' : 'text-gray-400'}`} style={soldeDu > 0 ? { color: '#FF7E00' } : {}}>
                Solde dû
              </p>
            </div>
            <p className="text-xl font-bold" style={soldeDu > 0 ? { color: '#FF7E00' } : { color: '#1E1D3D' }}>
              {fmt(soldeDu)}
            </p>
            <p className="text-xs text-gray-400">
              FCFA{countEmises > 0 ? ` · ${countEmises} en attente` : ' · à jour'}
            </p>
          </div>
        </div>
      </div>

      {/* Documents récents */}
      {recentDocs.length > 0 && (
        <Card className="overflow-hidden">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold" style={{ color: '#1E1D3D' }}>Documents récents</p>
              <Link href={`/finance/invoices?clientId=${accountId}`} className="text-xs hover:underline" style={{ color: '#FF7E00' }}>
                Tout voir
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentDocs.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/finance/invoices/${doc.id}`}
                  className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-[#FF7E00]/[0.04]"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-medium" style={{ color: '#1E1D3D' }}>{doc.number}</span>
                    <DocumentTypeBadge type={doc.type} />
                    <DocumentStatusBadge status={doc.status} dueDate={doc.dueDate} />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: '#1E1D3D' }}>
                      {doc.status === 'EMISE' && doc.amountDue < doc.totalTTC
                        ? `${fmt(doc.amountDue)} FCFA restants`
                        : `${fmt(doc.totalTTC)} FCFA`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(doc.issueDate), 'dd/MM/yyyy', { locale: fr })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {recentDocs.length === 0 && (
        <p className="py-4 text-center text-sm italic text-gray-400">
          Aucun document de facturation pour ce client.
        </p>
      )}
    </div>
  );
}
