'use client';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Search } from 'lucide-react';
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
  type VisibilityState,
  type RowSelectionState,
} from '@tanstack/react-table';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { DocumentStatusBadge, DocumentTypeBadge } from './DocumentStatusBadge';
import NewBillingDocumentForm from './NewBillingDocumentForm';

// ─── Types ────────────────────────────────────────────────────────────────────

type Document = {
  id: string;
  type: string;
  number: string;
  status: string;
  issueDate: string;
  dueDate: string | null;
  totalTTC: number;
  crmAccount: { name: string } | null;
  occasionalClient: { name: string } | null;
};

// ─── Columns ─────────────────────────────────────────────────────────────────

const columns: ColumnDef<Document>[] = [
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
    enableHiding: false,
  },
  {
    accessorKey: 'number',
    header: 'N°',
    cell: ({ row }) => (
      <Link
        href={`/finance/invoices/${row.original.id}`}
        className="font-mono text-sm font-semibold hover:underline"
        style={{ color: '#1E1D3D' }}
      >
        {row.getValue('number')}
      </Link>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => <DocumentTypeBadge type={row.getValue('type')} />,
  },
  {
    id: 'client',
    header: 'Client',
    cell: ({ row }) =>
      row.original.crmAccount?.name ??
      row.original.occasionalClient?.name ??
      '—',
  },
  {
    accessorKey: 'issueDate',
    header: 'Date',
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
      return (
        <span className="text-gray-400">
          {d ? format(new Date(d), 'dd/MM/yyyy', { locale: fr }) : '—'}
        </span>
      );
    },
  },
  {
    accessorKey: 'totalTTC',
    header: () => <span className="block text-right">Total TTC</span>,
    cell: ({ row }) => (
      <span className="block text-right font-semibold" style={{ color: '#1E1D3D' }}>
        {(row.getValue<number>('totalTTC')).toLocaleString('fr-FR')} FCFA
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Statut',
    cell: ({ row }) => (
      <DocumentStatusBadge status={row.original.status} dueDate={row.original.dueDate} />
    ),
  },
];

// ─── Pagination ───────────────────────────────────────────────────────────────

function BillingPagination({ table }: { table: ReturnType<typeof useReactTable<Document>> }) {
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
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Première page</span>
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-gray-50 disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Page précédente</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-gray-50 disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Page suivante</span>
            <ChevronRightIcon className="h-4 w-4" />
          </button>
          <button
            className="hidden h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-gray-50 disabled:opacity-50 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Dernière page</span>
            <DoubleArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function BillingTable({ documents }: { documents: Document[] }) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const typeFromUrl  = searchParams.get('type')?.toUpperCase() ?? 'ALL';

  const [open, setOpen]             = useState(false);
  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState(
    ['FACTURE', 'DEVIS', 'AVOIR'].includes(typeFromUrl) ? typeFromUrl : 'ALL'
  );

  const [sorting, setSorting]               = useState<SortingState>([]);
  const [rowSelection, setRowSelection]     = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  useEffect(() => {
    const t = searchParams.get('type')?.toUpperCase() ?? 'ALL';
    setTypeFilter(['FACTURE', 'DEVIS', 'AVOIR'].includes(t) ? t : 'ALL');
  }, [searchParams]);

  const filtered = useMemo(() =>
    documents.filter((d) => {
      const clientName = d.crmAccount?.name ?? d.occasionalClient?.name ?? '';
      const matchSearch =
        d.number.toLowerCase().includes(search.toLowerCase()) ||
        clientName.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'ALL' || d.type === typeFilter;
      return matchSearch && matchType;
    }),
    [documents, search, typeFilter]
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, rowSelection, columnVisibility },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
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
            <button
              className="text-base font-bold hover:underline"
              style={{ color: '#1E1D3D' }}
              onClick={() => router.push('/finance/invoices')}
            >
              Devis &amp; Factures
            </button>
            <p className="mt-0.5 text-xs text-gray-400">
              {filtered.length} document{filtered.length > 1 ? 's' : ''}
            </p>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <button
              onClick={() => setOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
            >
              <Plus className="h-4 w-4" />
              Nouveau
            </button>
            <SheetContent className="min-w-[900px] space-y-2">
              <SheetHeader>
                <SheetTitle>Nouveau document</SheetTitle>
              </SheetHeader>
              <div className="h-full overflow-y-auto pb-10">
                <NewBillingDocumentForm onFinish={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Filtres */}
        <div className="mt-4 flex items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un numéro, un client…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 text-sm focus:border-[#FF7E00] focus-visible:ring-1 focus-visible:ring-[#FF7E00] focus-visible:ring-offset-0"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9 w-44 text-sm focus:ring-[#FF7E00]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les types</SelectItem>
              <SelectItem value="FACTURE">Factures</SelectItem>
              <SelectItem value="DEVIS">Devis</SelectItem>
              <SelectItem value="AVOIR">Avoirs</SelectItem>
            </SelectContent>
          </Select>
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
                    Aucun document trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination — même format que le module CRM */}
        <div className="border-t">
          <BillingPagination table={table} />
        </div>
      </CardContent>
    </Card>
  );
}
