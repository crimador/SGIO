'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import axios from 'axios';
import { AlertTriangle, Clock, CheckCircle, Search, Send, MailCheck } from 'lucide-react';
import {
  ChevronLeftIcon, ChevronRightIcon,
  DoubleArrowLeftIcon, DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from '@tanstack/react-table';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type Invoice = {
  id:             string;
  number:         string;
  issueDate:      string;
  dueDate:        string | null;
  totalTTC:       number;
  amountPaid:     number;
  amountDue:      number;
  daysOverdue:    number | null;
  clientName:     string;
  clientEmail:    string | null;
  crmAccountId:   string | null;
  lastReminderAt: string | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) { return n.toLocaleString('fr-FR'); }

function RetardBadge({ days }: { days: number | null }) {
  if (days === null) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
        <Clock className="h-3 w-3" />Sans échéance
      </span>
    );
  }
  if (days > 30) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600">
        <AlertTriangle className="h-3 w-3" />{days} jours
      </span>
    );
  }
  if (days > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#FF7E00]/15 px-2.5 py-0.5 text-xs font-semibold text-[#FF7E00]">
        <AlertTriangle className="h-3 w-3" />{days} jour{days > 1 ? 's' : ''}
      </span>
    );
  }
  if (days === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#FAC731]/20 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
        <Clock className="h-3 w-3" />Aujourd&apos;hui
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs text-green-700">
      <CheckCircle className="h-3 w-3" />Dans {Math.abs(days)} jour{Math.abs(days) > 1 ? 's' : ''}
    </span>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function UnpaidPagination({ table }: { table: ReturnType<typeof useReactTable<Invoice>> }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} sur{' '}
        {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s).
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Lignes par page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(v) => table.setPageSize(Number(v))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((s) => (
                <SelectItem key={s} value={`${s}`}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[120px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="hidden h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-gray-50 disabled:opacity-50 lg:flex"
            onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
            <span className="sr-only">Première page</span>
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-gray-50 disabled:opacity-50"
            onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <span className="sr-only">Page précédente</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-gray-50 disabled:opacity-50"
            onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <span className="sr-only">Page suivante</span>
            <ChevronRightIcon className="h-4 w-4" />
          </button>
          <button
            className="hidden h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-gray-50 disabled:opacity-50 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
            <span className="sr-only">Dernière page</span>
            <DoubleArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function UnpaidTable({ invoices }: { invoices: Invoice[] }) {
  const { toast } = useToast();
  const [search, setSearch]       = useState('');
  const [sorting, setSorting]     = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sending, setSending]     = useState<Record<string, boolean>>({});
  const [reminded, setReminded]   = useState<Record<string, string>>(
    Object.fromEntries(invoices.filter(i => i.lastReminderAt).map(i => [i.id, i.lastReminderAt!]))
  );

  const handleRemind = async (inv: Invoice) => {
    if (!inv.clientEmail) {
      toast({ variant: 'destructive', title: 'Email manquant', description: `Aucune adresse email pour ${inv.clientName}.` });
      return;
    }
    setSending((prev) => ({ ...prev, [inv.id]: true }));
    try {
      const { data } = await axios.post(`/api/billing/documents/${inv.id}/remind`);
      const now = new Date().toISOString();
      setReminded((prev) => ({ ...prev, [inv.id]: now }));
      toast({ title: 'Relance envoyée', description: `Email envoyé à ${data.sentTo}` });
    } catch (err: any) {
      const msg  = err?.response?.data?.error ?? 'Erreur lors de l\'envoi';
      const code = err?.response?.status;
      if (code === 503) {
        setReminded((prev) => ({ ...prev, [inv.id]: new Date().toISOString() }));
        toast({ title: 'Relance enregistrée', description: msg });
      } else {
        toast({ variant: 'destructive', title: 'Erreur', description: msg });
      }
    } finally {
      setSending((prev) => ({ ...prev, [inv.id]: false }));
    }
  };

  // Colonnes — dépendent des états sending/reminded via closure
  const columns = useMemo<ColumnDef<Invoice>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Tout sélectionner"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Sélectionner"
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'number',
      header: 'N° Facture',
      cell: ({ row }) => (
        <Link href={`/finance/invoices/${row.original.id}`} className="font-mono text-sm font-semibold hover:underline" style={{ color: '#FF7E00' }}>
          {row.getValue('number')}
        </Link>
      ),
    },
    {
      id: 'clientName',
      header: 'Client',
      cell: ({ row }) => (
        <div>
          <div className="text-sm font-medium" style={{ color: '#1E1D3D' }}>{row.original.clientName}</div>
          {row.original.clientEmail && (
            <div className="text-xs text-gray-400">{row.original.clientEmail}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'issueDate',
      header: 'Émise le',
      cell: ({ row }) => (
        <span className="text-gray-400">
          {format(new Date(row.getValue('issueDate')), 'dd/MM/yyyy', { locale: fr })}
        </span>
      ),
    },
    {
      accessorKey: 'dueDate',
      header: 'Échéance',
      cell: ({ row }) => {
        const d = row.getValue<string | null>('dueDate');
        return <span className="text-gray-400">{d ? format(new Date(d), 'dd/MM/yyyy', { locale: fr }) : '—'}</span>;
      },
    },
    {
      accessorKey: 'daysOverdue',
      header: 'Retard',
      cell: ({ row }) => <RetardBadge days={row.getValue('daysOverdue')} />,
    },
    {
      id: 'amount',
      header: () => <span className="block text-right">Montant TTC</span>,
      cell: ({ row }) => (
        <div className="text-right">
          <div className="font-semibold" style={{ color: '#1E1D3D' }}>{fmt(row.original.amountDue)} FCFA</div>
          {row.original.amountPaid > 0 && (
            <div className="text-xs text-gray-400">
              sur {fmt(row.original.totalTTC)} · acompte {fmt(row.original.amountPaid)}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'relance',
      header: () => <span className="block text-right">Relance</span>,
      cell: ({ row }) => {
        const inv          = row.original;
        const isSending    = sending[inv.id] ?? false;
        const reminderDate = reminded[inv.id] ?? null;
        const hasEmail     = !!inv.clientEmail;
        return (
          <div className="flex flex-col items-end gap-1">
            <button
              className={`flex h-7 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-all disabled:opacity-50 ${
                reminderDate
                  ? 'border border-gray-200 text-gray-600 hover:border-[#FF7E00]/40 hover:text-[#1E1D3D]'
                  : 'text-white'
              }`}
              style={!reminderDate ? { background: 'linear-gradient(135deg, #FF7E00, #e8950a)' } : {}}
              disabled={isSending || !hasEmail}
              onClick={() => handleRemind(inv)}
              title={!hasEmail ? 'Aucun email disponible pour ce client' : undefined}
            >
              {isSending ? (
                <span className="animate-pulse">Envoi...</span>
              ) : reminderDate ? (
                <><MailCheck className="h-3 w-3" />Relancer</>
              ) : (
                <><Send className="h-3 w-3" />Relancer</>
              )}
            </button>
            {reminderDate && (
              <span className="text-[10px] text-gray-400">
                {format(new Date(reminderDate), 'dd/MM à HH:mm', { locale: fr })}
              </span>
            )}
            {!hasEmail && (
              <span className="text-[10px] italic text-gray-400">Pas d&apos;email</span>
            )}
          </div>
        );
      },
    },
  ], [sending, reminded]);

  const filtered = useMemo(() =>
    invoices.filter((inv) =>
      inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      inv.number.toLowerCase().includes(search.toLowerCase())
    ),
    [invoices, search]
  );

  const totalImpaye   = filtered.reduce((s, i) => s + i.amountDue, 0);
  const countEnRetard = filtered.filter((i) => i.daysOverdue !== null && i.daysOverdue > 0).length;
  const totalEnRetard = filtered
    .filter((i) => i.daysOverdue !== null && i.daysOverdue > 0)
    .reduce((s, i) => s + i.amountDue, 0);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">

      {/* Cartes résumé */}
      <div className="grid grid-cols-3 gap-4">
        <div className="overflow-hidden rounded-xl border">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <div className="p-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Total impayé</p>
            <p className="text-2xl font-bold" style={{ color: '#1E1D3D' }}>{fmt(totalImpaye)}</p>
            <p className="text-xs text-gray-400">FCFA · {filtered.length} facture{filtered.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <div
          className="overflow-hidden rounded-xl"
          style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
        >
          <div className="p-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">En retard</p>
            <p className="text-2xl font-bold text-white">{fmt(totalEnRetard)}</p>
            <p className="text-xs text-white/70">FCFA · {countEnRetard} facture{countEnRetard > 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <div className="p-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">À venir</p>
            <p className="text-2xl font-bold" style={{ color: '#1E1D3D' }}>{fmt(totalImpaye - totalEnRetard)}</p>
            <p className="text-xs text-gray-400">FCFA · {filtered.length - countEnRetard} facture{(filtered.length - countEnRetard) > 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <Card className="overflow-hidden">
        <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
        <CardHeader className="pb-4 pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-bold" style={{ color: '#1E1D3D' }}>Factures impayées</p>
              <p className="mt-0.5 text-xs text-gray-400">{filtered.length} document{filtered.length > 1 ? 's' : ''} en attente</p>
            </div>
          </div>
          <div className="relative mt-4 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un client, un numéro…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 text-sm focus:border-[#FF7E00] focus-visible:ring-1 focus-visible:ring-[#FF7E00] focus-visible:ring-offset-0"
            />
          </div>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          <div className="border-t">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-gray-50/80 hover:bg-gray-50/80">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="text-xs font-semibold uppercase tracking-wide first:pl-4 last:pr-4"
                        style={{ color: '#1E1D3D' }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className={`transition-colors ${
                        row.original.daysOverdue !== null && row.original.daysOverdue > 0
                          ? 'bg-[#FF7E00]/[0.03]'
                          : 'hover:bg-[#FF7E00]/[0.03]'
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="first:pl-4 last:pr-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-gray-400">
                      Aucune facture impayée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination — même format que le module CRM */}
          <div className="border-t">
            <UnpaidPagination table={table} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
