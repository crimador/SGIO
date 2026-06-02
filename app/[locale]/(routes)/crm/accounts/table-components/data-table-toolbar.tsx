'use client';

import { Cross2Icon } from '@radix-ui/react-icons';
import type { Table } from '@tanstack/react-table';
import { format } from 'date-fns';

import { Input } from '@/components/ui/input';
import { DataTableViewOptions } from './data-table-view-options';
import { statuses } from '../table-data/data';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { ExportCsvButton } from '@/components/ui/export-csv-button';
import { DateRangeFilter } from '@/components/ui/date-range-filter';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Filtrer par nom..."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(e) => table.getColumn('name')?.setFilterValue(e.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn('status') && (
          <DataTableFacetedFilter column={table.getColumn('status')} title="Statut" options={statuses} />
        )}
        <DateRangeFilter column={table.getColumn('createdAt')} title="Période" />
        {isFiltered && (
          <button
            onClick={() => table.resetColumnFilters()}
            className="flex h-8 items-center gap-1.5 rounded-md border px-2 text-sm font-medium transition-colors hover:bg-gray-50 lg:px-3"
            style={{ color: '#1E1D3D' }}
          >
            Réinitialiser <Cross2Icon className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ExportCsvButton
          table={table}
          filename={`comptes_${format(new Date(), 'yyyy-MM-dd')}`}
          getExportRow={(row: any) => ({
            'Nom': row.name ?? '',
            'Email': row.email ?? '',
            'Téléphone': row.phone ?? '',
            'Type': row.type ?? '',
            'Statut': row.status ?? '',
            'Secteur': row.industry ?? '',
            'Site web': row.website ?? '',
            'Responsable': row.assigned_to_user?.name ?? '',
            'Contact principal': row.contacts?.map((c: any) => `${c.first_name ?? ''} ${c.last_name}`).join(' / ') ?? '',
            'Créé le': row.createdAt ? format(new Date(row.createdAt), 'dd/MM/yyyy') : '',
          })}
        />
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
