import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { TvaReport, TvaLineGroup } from '@/actions/finance/get-tva-report';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download } from 'lucide-react';

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
}

function TypeBadge({ type }: { type: string }) {
  if (type === 'FACTURE') return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-[#1E1D3D]/10 text-[#1E1D3D]">Facture</span>
  );
  if (type === 'AVOIR') return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-[#FAC731]/25 text-amber-700">Avoir</span>
  );
  return (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium text-gray-600">{type}</span>
  );
}

const REGIME_SHORT: Record<string, string> = {
  NORMAL:  'TVA 18%',
  EXONERE: 'Exonéré',
  TPU:     'TPU',
};

function GroupTable({ groups, title, isAvoir = false }: { groups: TvaLineGroup[]; title: string; isAvoir?: boolean }) {
  if (groups.length === 0) return null;
  const totalHT  = groups.reduce((s, g) => s + g.baseHT,   0);
  const totalTVA = groups.reduce((s, g) => s + g.tva,      0);
  const totalTTC = groups.reduce((s, g) => s + g.totalTTC, 0);

  return (
    <div className="space-y-2">
      <p
        className="border-l-[3px] pl-3 text-xs font-semibold uppercase tracking-wide text-gray-400"
        style={{ borderColor: '#FF7E00' }}
      >
        {title}
      </p>
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
              <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Régime fiscal</TableHead>
              <TableHead className="text-right w-[80px] text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Nb</TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Base HT (FCFA)</TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>TVA (FCFA)</TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Total TTC (FCFA)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((g) => (
              <TableRow key={g.regime} className="transition-colors hover:bg-[#FF7E00]/[0.04]">
                <TableCell className="font-medium" style={{ color: '#1E1D3D' }}>{g.label}</TableCell>
                <TableCell className="text-right text-gray-400">{g.count}</TableCell>
                <TableCell className={`text-right ${isAvoir ? '' : ''}`} style={isAvoir ? { color: '#FF7E00' } : {}}>
                  {isAvoir ? '−' : ''}{fmt(g.baseHT)}
                </TableCell>
                <TableCell className={`text-right font-medium`} style={isAvoir ? { color: '#FF7E00' } : {}}>
                  {isAvoir ? '−' : ''}{fmt(g.tva)}
                </TableCell>
                <TableCell className="text-right" style={isAvoir ? { color: '#FF7E00' } : {}}>
                  {isAvoir ? '−' : ''}{fmt(g.totalTTC)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableBody>
            <TableRow className="border-t-2 font-semibold bg-gray-50/60">
              <TableCell style={{ color: '#1E1D3D' }}>Total</TableCell>
              <TableCell className="text-right">{groups.reduce((s, g) => s + g.count, 0)}</TableCell>
              <TableCell className="text-right" style={isAvoir ? { color: '#FF7E00' } : { color: '#1E1D3D' }}>
                {isAvoir ? '−' : ''}{fmt(totalHT)}
              </TableCell>
              <TableCell className="text-right" style={isAvoir ? { color: '#FF7E00' } : { color: '#1E1D3D' }}>
                {isAvoir ? '−' : ''}{fmt(totalTVA)}
              </TableCell>
              <TableCell className="text-right" style={isAvoir ? { color: '#FF7E00' } : { color: '#1E1D3D' }}>
                {isAvoir ? '−' : ''}{fmt(totalTTC)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function TvaReportDisplay({ report, pdfUrl }: { report: TvaReport; pdfUrl: string }) {
  return (
    <div className="space-y-6">
      {/* En-tête période */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">Période couverte</p>
          <p className="text-lg font-bold" style={{ color: '#1E1D3D' }}>{report.periodLabel}</p>
          <p className="text-xs text-gray-400">
            Du {format(new Date(report.start), 'dd/MM/yyyy', { locale: fr })} au{' '}
            {format(new Date(report.end), 'dd/MM/yyyy', { locale: fr })}
          </p>
        </div>
        <a
          href={pdfUrl}
          download
          className="flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-[#FF7E00]/[0.06]"
          style={{ color: '#1E1D3D' }}
        >
          <Download className="h-4 w-4" />
          Exporter PDF
        </a>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="overflow-hidden">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardHeader className="pb-2 pt-4">
            <p className="text-xs text-gray-400">CA HT imposable</p>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold" style={{ color: '#1E1D3D' }}>{fmt(report.totalFactureHT)}</p>
            <p className="mt-1 text-xs text-gray-400">FCFA</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardHeader className="pb-2 pt-4">
            <p className="text-xs text-gray-400">TVA facturée</p>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold" style={{ color: '#1E1D3D' }}>{fmt(report.totalFactureTVA)}</p>
            <p className="mt-1 text-xs text-gray-400">FCFA</p>
          </CardContent>
        </Card>

        <Card className={`overflow-hidden ${report.totalAvoirTVA > 0 ? 'border-[#FF7E00]/40' : ''}`}>
          <div className="h-[3px]" style={{ background: report.totalAvoirTVA > 0 ? '#FF7E00' : '#e5e7eb' }} />
          <CardHeader className="pb-2 pt-4">
            <p className="text-xs text-gray-400">TVA avoirs (ajustements)</p>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold" style={report.totalAvoirTVA > 0 ? { color: '#FF7E00' } : { color: '#1E1D3D' }}>
              −{fmt(report.totalAvoirTVA)}
            </p>
            <p className="mt-1 text-xs text-gray-400">FCFA</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-blue-200 bg-blue-50/40 dark:bg-blue-950/20">
          <div className="h-[3px] bg-blue-500" />
          <CardHeader className="pb-2 pt-4">
            <p className="text-xs text-blue-700 dark:text-blue-300">TVA nette à reverser</p>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
              {fmt(report.tvaCollecteeNette)}
            </p>
            <p className="mt-1 text-xs text-gray-400">FCFA</p>
          </CardContent>
        </Card>
      </div>

      {/* Tableaux par section */}
      <Card className="overflow-hidden">
        <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
        <CardHeader className="pb-3 pt-5">
          <p className="text-sm font-semibold" style={{ color: '#1E1D3D' }}>Déclaration TVA — {report.periodLabel}</p>
          <p className="mt-0.5 text-xs text-gray-400">Détail par régime fiscal</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <GroupTable groups={report.facturesGroups} title="Opérations imposables — Factures émises" />
          <GroupTable groups={report.avoirsGroups}   title="Ajustements — Avoirs émis" isAvoir />

          {/* Récapitulatif TVA */}
          <div className="flex justify-end">
            <div className="w-80 space-y-2 rounded-xl border p-4 text-sm" style={{ background: 'rgba(244,242,242,0.5)' }}>
              <div className="flex justify-between">
                <span className="text-gray-400">TVA collectée (factures)</span>
                <span className="font-medium" style={{ color: '#1E1D3D' }}>{fmt(report.totalFactureTVA)} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">TVA avoirs (−)</span>
                <span className="font-medium" style={{ color: '#FF7E00' }}>−{fmt(report.totalAvoirTVA)} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">TVA déductible (achats)</span>
                <span className="font-medium text-gray-400">0 FCFA</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-bold">
                <span style={{ color: '#1E1D3D' }}>TVA nette à reverser</span>
                <span className="text-blue-700">{fmt(report.tvaCollecteeNette)} FCFA</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Détail des documents */}
      <Card className="overflow-hidden">
        <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
        <CardHeader className="pb-3 pt-5">
          <p className="text-sm font-semibold" style={{ color: '#1E1D3D' }}>Détail des opérations</p>
          <p className="mt-0.5 text-xs text-gray-400">
            {report.documents.length} document{report.documents.length !== 1 ? 's' : ''} sur la période
          </p>
        </CardHeader>
        <CardContent>
          {report.documents.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              Aucun document sur cette période.
            </p>
          ) : (
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                    <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Date</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Référence</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Type</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Client</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Régime</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Base HT</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>TVA</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Total TTC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.documents.map((doc) => (
                    <TableRow
                      key={`${doc.id}-${doc.type}`}
                      className={`transition-colors hover:bg-[#FF7E00]/[0.04] ${doc.type === 'AVOIR' ? 'bg-[#FAC731]/[0.04]' : ''}`}
                    >
                      <TableCell className="text-sm text-gray-400">
                        {format(new Date(doc.issueDate), 'dd/MM/yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        <Link href={`/finance/invoices/${doc.id}`} className="hover:underline" style={{ color: '#FF7E00' }}>
                          {doc.number}
                        </Link>
                      </TableCell>
                      <TableCell><TypeBadge type={doc.type} /></TableCell>
                      <TableCell className="text-sm">{doc.client}</TableCell>
                      <TableCell className="text-sm text-gray-400">
                        {REGIME_SHORT[doc.regime] ?? doc.regime}
                      </TableCell>
                      <TableCell className="text-right text-sm" style={doc.type === 'AVOIR' ? { color: '#FF7E00' } : {}}>
                        {doc.type === 'AVOIR' ? '−' : ''}{fmt(doc.baseHT)}
                      </TableCell>
                      <TableCell className={`text-right text-sm font-medium`} style={doc.type === 'AVOIR' ? { color: '#FF7E00' } : {}}>
                        {doc.type === 'AVOIR' ? '−' : ''}{fmt(doc.tva)}
                      </TableCell>
                      <TableCell className="text-right text-sm" style={doc.type === 'AVOIR' ? { color: '#FF7E00' } : {}}>
                        {doc.type === 'AVOIR' ? '−' : ''}{fmt(doc.totalTTC)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
