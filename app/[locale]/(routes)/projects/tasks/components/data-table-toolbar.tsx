'use client';

import { Cross2Icon } from '@radix-ui/react-icons';
import type { Table } from '@tanstack/react-table';

import { Input } from '@/components/ui/input';
import { DataTableViewOptions } from './data-table-view-options';

import { priorities, statuses } from '../data/data';
import { DataTableFacetedFilter } from './data-table-faceted-filter';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filtrer les tâches..."
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('title')?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn('taskStatus') && (
          <DataTableFacetedFilter
            column={table.getColumn('taskStatus')}
            title="Statut"
            options={statuses}
          />
        )}
        {table.getColumn('priority') && (
          <DataTableFacetedFilter
            column={table.getColumn('priority')}
            title="Priorité"
            options={priorities}
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
