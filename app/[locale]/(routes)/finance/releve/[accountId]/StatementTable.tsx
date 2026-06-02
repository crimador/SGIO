'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import type { StatementEntry } from '@/actions/billing/get-client-statement';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

function fmt(n: number) {
  return n === 0 ? '—' : n.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
}

function fmtBalance(n: number) {
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
}

const TYPE_CONFIG: Record<string, { label: string; cls: string }> = {
  FACTURE:   { label: 'Facture',   cls: 'bg-[#1E1D3D]/10 text-[#1E1D3D]' },
  AVOIR:     { label: 'Avoir',     cls: 'bg-[#FAC731]/25 text-amber-700' },
  REGLEMENT: { label: 'Règlement', cls: 'bg-green-100 text-green-700' },
};

type Props = {
  entries: StatementEntry[];
  totalDebit:  number;
  totalCredit: number;
  solde:       number;
};

export function StatementTable({ entries, totalDebit, totalCredit, solde }: Props) {
  const [search, setSearch] = useState('');

  const filtered = entries.filter((e) =>
    e.ref.toLowerCase().includes(search.toLowerCase()) ||
    e.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Recherche */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher une référence, un libellé..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Tableau */}
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
              <TableHead className="w-[110px] text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Date</TableHead>
              <TableHead className="w-[160px] text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Référence</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Type</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Libellé</TableHead>
              <TableHead className="text-right w-[140px] text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Débit (FCFA)</TableHead>
              <TableHead className="text-right w-[140px] text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Crédit (FCFA)</TableHead>
              <TableHead className="text-right w-[140px] text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Solde (FCFA)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-gray-400">
                  Aucun mouvement trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((entry, i) => {
                const meta = TYPE_CONFIG[entry.entryType] ?? { label: entry.entryType, cls: 'bg-gray-100 text-gray-600' };
                const isNegative = entry.balance < 0;
                return (
                  <TableRow
                    key={i}
                    className={`transition-colors hover:bg-[#FF7E00]/[0.04] ${entry.entryType === 'REGLEMENT' ? 'bg-green-50/40 dark:bg-green-950/20' : ''}`}
                  >
                    <TableCell className="text-sm text-gray-400">
                      {format(new Date(entry.date), 'dd/MM/yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {entry.entryType !== 'REGLEMENT' ? (
                        <Link href={`/finance/invoices/${entry.docId}`} className="hover:underline" style={{ color: '#FF7E00' }}>
                          {entry.ref}
                        </Link>
                      ) : (
                        <span className="text-gray-400">{entry.ref}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${meta.cls}`}>
                        {meta.label}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate text-sm" title={entry.label}>
                      {entry.label}
                    </TableCell>
                    <TableCell className="text-right font-medium text-sm">
                      {entry.debit > 0 ? fmt(entry.debit) : <span className="text-gray-400">—</span>}
                    </TableCell>
                    <TableCell className="text-right text-sm text-green-700 dark:text-green-400">
                      {entry.credit > 0 ? fmt(entry.credit) : <span className="text-gray-400">—</span>}
                    </TableCell>
                    <TableCell className={`text-right font-semibold text-sm ${isNegative ? 'text-green-700' : entry.balance > 0 ? '' : ''}`} style={entry.balance > 0 ? { color: '#FF7E00' } : {}}>
                      {fmtBalance(Math.abs(entry.balance))}
                      {isNegative ? ' CR' : entry.balance > 0 ? ' DB' : ''}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Totaux */}
      <div className="flex justify-end">
        <div className="w-80 space-y-2 rounded-xl border p-4 text-sm" style={{ background: 'rgba(244,242,242,0.5)' }}>
          <div className="flex justify-between">
            <span className="text-gray-400">Total débit (facturé)</span>
            <span className="font-medium" style={{ color: '#1E1D3D' }}>{fmtBalance(totalDebit)} FCFA</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Total crédit (réglé + avoirs)</span>
            <span className="font-medium text-green-700">{fmtBalance(totalCredit)} FCFA</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-bold">
            <span style={{ color: '#1E1D3D' }}>Solde dû</span>
            <span style={{ color: solde > 0 ? '#FF7E00' : '#16a34a' }}>
              {fmtBalance(Math.abs(solde))} FCFA
              <span className="ml-1 text-sm font-normal text-gray-400">{solde > 0 ? '(impayé)' : '(créditeur)'}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
