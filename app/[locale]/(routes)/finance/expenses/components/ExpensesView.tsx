'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Search, Trash2 } from 'lucide-react';
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { NewExpenseForm } from './NewExpenseForm';

// ─── Types ────────────────────────────────────────────────────────────────────

type Expense = {
  id:              string;
  description:     string;
  amount:          number;
  category:        string;
  date:            string;
  receipt:         string | null;
  paymentMethod:   string;
  crmAccount:      { name: string } | null;
  treasuryAccount: { name: string; type: string } | null;
  createdAt:       string;
};

// ─── Labels ───────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  LOYER:         'Loyer',
  HONORAIRES:    'Honoraires',
  TRANSPORT:     'Transport',
  FOURNITURES:   'Fournitures',
  COMMUNICATION: 'Communication',
  BANQUE:        'Frais bancaires',
  IMPOTS:        'Impôts & taxes',
  SALAIRES:      'Salaires',
  PUBLICITE:     'Publicité',
  MAINTENANCE:   'Entretien',
  AUTRES:        'Autres',
};

const PAYMENT_LABELS: Record<string, string> = {
  VIREMENT: 'Virement',
  ESPECES:  'Espèces',
  FLOOZ:    'Flooz (Moov)',
  T_MONEY:  'T-Money (Togocel)',
};

// ─── Pagination ───────────────────────────────────────────────────────────────

function ExpensePagination({ table }: { table: ReturnType<typeof useReactTable<Expense>> }) {
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

export function ExpensesView({ initialExpenses }: { initialExpenses: Expense[] }) {
  const router    = useRouter();
  const { toast } = useToast();

  const [expenses, setExpenses]   = useState<Expense[]>(initialExpenses);
  const [open, setOpen]           = useState(false);
  const [search, setSearch]       = useState('');
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [sorting, setSorting]     = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette dépense ?')) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/finance/expense/${id}`);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      toast({ title: 'Supprimé', description: 'Dépense supprimée.' });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer.' });
    } finally {
      setDeleting(null);
    }
  };

  const handleCreated = (newExpense: Expense) => {
    setExpenses((prev) => [newExpense, ...prev]);
    setOpen(false);
    router.refresh();
  };

  // Colonnes — dépendent de deleting via closure
  const columns = useMemo<ColumnDef<Expense>[]>(() => [
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
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-gray-400">
          {format(new Date(row.getValue('date')), 'dd/MM/yyyy', { locale: fr })}
        </span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="max-w-[220px] truncate font-medium" style={{ color: '#1E1D3D' }}>
          {row.getValue('description')}
        </span>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Catégorie',
      cell: ({ row }) => {
        const cat = row.getValue<string>('category');
        return (
          <span className="inline-flex items-center rounded-full bg-[#1E1D3D]/10 px-2.5 py-0.5 text-xs font-medium text-[#1E1D3D]">
            {CATEGORY_LABELS[cat] ?? cat}
          </span>
        );
      },
    },
    {
      id: 'account',
      header: 'Compte',
      cell: ({ row }) => (
        <span className="text-gray-400">{row.original.treasuryAccount?.name ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Mode',
      cell: ({ row }) => (
        <span className="text-gray-400">{PAYMENT_LABELS[row.getValue<string>('paymentMethod')] ?? row.getValue('paymentMethod')}</span>
      ),
    },
    {
      accessorKey: 'amount',
      header: () => <span className="block text-right">Montant</span>,
      cell: ({ row }) => (
        <span className="block text-right font-semibold" style={{ color: '#1E1D3D' }}>
          {(row.getValue<number>('amount')).toLocaleString('fr-FR')} FCFA
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button
          className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-red-50 disabled:opacity-50"
          disabled={deleting === row.original.id}
          onClick={() => handleDelete(row.original.id)}
        >
          <Trash2 className="h-3.5 w-3.5 text-red-500" />
        </button>
      ),
    },
  ], [deleting]);

  const filtered = useMemo(() =>
    expenses.filter((e) =>
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      (CATEGORY_LABELS[e.category] ?? e.category).toLowerCase().includes(search.toLowerCase()) ||
      (e.treasuryAccount?.name ?? '').toLowerCase().includes(search.toLowerCase())
    ),
    [expenses, search]
  );

  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0);

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
    <Card className="overflow-hidden">
      {/* Barre accent KEKELI */}
      <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />

      <CardHeader className="pb-4 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-bold" style={{ color: '#1E1D3D' }}>Dépenses</p>
            <p className="mt-0.5 text-xs text-gray-400">
              {filtered.length} dépense{filtered.length > 1 ? 's' : ''} —{' '}
              <span className="font-medium" style={{ color: '#1E1D3D' }}>
                {totalFiltered.toLocaleString('fr-FR')} FCFA
              </span>
            </p>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <button
              onClick={() => setOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
            >
              <Plus className="h-4 w-4" />
              Nouvelle
            </button>
            <SheetContent className="min-w-[520px]">
              <SheetHeader>
                <SheetTitle>Nouvelle dépense</SheetTitle>
              </SheetHeader>
              <div className="mt-4 h-full overflow-y-auto pb-10">
                <NewExpenseForm onFinish={handleCreated} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Recherche */}
        <div className="relative mt-4 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher…"
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
                    className="transition-colors hover:bg-[#FF7E00]/[0.04]"
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
                    Aucune dépense — cliquez sur + pour en enregistrer une
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination — même format que le module CRM */}
        <div className="border-t">
          <ExpensePagination table={table} />
        </div>
      </CardContent>
    </Card>
  );
}
