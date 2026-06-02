'use client';

import { Cross2Icon } from '@radix-ui/react-icons';
import type { Table } from '@tanstack/react-table';

import { Input } from '@/components/ui/input';
import { DataTableViewOptions } from './data-table-view-options';
import { DataTableFacetedFilter } from './data-table-faceted-filter';

const STATUTS = [
  { label: 'Validé', value: 'true' },
  { label: 'En attente', value: 'false' },
];

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Rechercher par employé..."
          value={(table.getColumn('employeeName')?.getFilterValue() as string) ?? ''}
          onChange={(e) => table.getColumn('employeeName')?.setFilterValue(e.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn('verified') && (
          <DataTableFacetedFilter
            column={table.getColumn('verified')}
            title="Statut"
            options={STATUTS}
          />
        )}
        {isFiltered && (
          <button
            onClick={() => table.resetColumnFilters()}
            className="flex h-8 items-center gap-1.5 rounded-md border px-2 text-sm font-medium transition-colors hover:bg-gray-50 lg:px-3"
            style={{ color: '#1E1D3D' }}
          >
            Réinitialiser
            <Cross2Icon className="h-4 w-4" />
          </button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
