'use client';

import { Cross2Icon } from '@radix-ui/react-icons';
import type { Table } from '@tanstack/react-table';
import { format } from 'date-fns';

import { Input } from '@/components/ui/input';
import { DataTableViewOptions } from './data-table-view-options';
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
          value={(table.getColumn('last_name')?.getFilterValue() as string) ?? ''}
          onChange={(e) => table.getColumn('last_name')?.setFilterValue(e.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <DateRangeFilter column={table.getColumn('created_on')} title="Période" />
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
          filename={`contacts_${format(new Date(), 'yyyy-MM-dd')}`}
          getExportRow={(row: any) => ({
            'Prénom': row.first_name ?? '',
            'Nom': row.last_name ?? '',
            'Poste': row.position ?? '',
            'Email': row.email ?? '',
            'Email personnel': row.personal_email ?? '',
            'Tél bureau': row.office_phone ?? '',
            'Tél mobile': row.mobile_phone ?? '',
            'Type': row.type ?? '',
            'Actif': row.status ? 'Oui' : 'Non',
            'Compte associé': row.assigned_accounts?.name ?? '',
            'Responsable': row.assigned_to_user?.name ?? '',
            'Créé le': row.created_on ? format(new Date(row.created_on), 'dd/MM/yyyy') : '',
          })}
        />
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
