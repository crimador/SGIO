'use client';

import type { ColumnDef } from '@tanstack/react-table';

import { statuses } from '../table-data/data';
import type { Opportunity } from '../table-data/schema';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';
import moment from 'moment';
import Link from 'next/link';

export const columns: ColumnDef<Opportunity>[] = [
  {
    accessorKey: 'close_date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Clôture prévue" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">
        {moment(row.getValue('close_date')).format('DD/MM/YY')}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    filterFn: (row, id, value: { from: string; to: string }) => {
      const raw = row.getValue(id);
      if (!raw) return true;
      const d = new Date(raw as string);
      if (value.from && d < new Date(value.from)) return false;
      if (value.to && d > new Date(value.to + 'T23:59:59')) return false;
      return true;
    },
  },
  {
    accessorKey: 'assigned_to_user',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Responsable" />
    ),
    cell: ({ row }) => (
      <div className="w-[150px]">
        {
          //@ts-ignore
          row.getValue('assigned_to_user')?.name ?? 'Non assigné'
        }
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'assigned_account',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Compte associé" />
    ),
    cell: ({ row }) => (
      <div className="w-[250px]">
        {
          //@ts-ignore
          row.getValue('assigned_account')?.name ?? '—'
        }
      </div>
    ),
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Opportunité" />
    ),
    cell: ({ row }) => (
      <Link
        href={`/crm/opportunities/${row.original.id}`}
        className="w-[250px] block font-medium hover:underline"
        style={{ color: '#1E1D3D' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#FF7E00')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#1E1D3D')}
      >
        {row.getValue('name')}
      </Link>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'budget',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Budget" />
    ),
    cell: ({ row }) => (
      <div>
        {row.original.budget
          ? row.original.budget.toLocaleString('fr-FR') + ' FCFA'
          : '—'}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value: { min: string; max: string }) => {
      const num = row.getValue(id) as number | null;
      if (num === null || num === undefined) return !value.min;
      if (value.min && num < Number(value.min)) return false;
      if (value.max && num > Number(value.max)) return false;
      return true;
    },
  },
  {
    accessorKey: 'next_step',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prochaine étape" />
    ),
    cell: ({ row }) => (
      <div className="w-[150px]">{row.getValue('next_step')}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statut" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue('status')
      );
      if (!status) return null;
      return (
        <div className="flex w-[100px] items-center">
          {status.icon && (
            <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{status.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
