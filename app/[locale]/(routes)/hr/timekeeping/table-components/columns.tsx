'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format, differenceInMinutes } from 'date-fns';

import type { Timekeeping } from '../table-data/schema';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';

const getDuration = (timeIn: string, timeOut: string | null) => {
  if (!timeOut) return '—';
  const diff = differenceInMinutes(new Date(timeOut), new Date(timeIn));
  if (diff <= 0) return '—';
  return `${Math.floor(diff / 60)}h${String(diff % 60).padStart(2, '0')}`;
};

export const columns: ColumnDef<Timekeeping>[] = [
  {
    id: 'employeeName',
    accessorFn: (row) => `${row.employee.firstName} ${row.employee.lastName}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Employé" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.employee.firstName} {row.original.employee.lastName}
        <div className="text-xs text-gray-400">{row.original.employee.email}</div>
      </div>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: 'date',
    accessorFn: (row) => row.timeIn,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => (
      <div>{format(new Date(row.original.timeIn), 'dd/MM/yyyy')}</div>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'timeIn',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Arrivée" />
    ),
    cell: ({ row }) => (
      <div>{format(new Date(row.getValue('timeIn')), 'HH:mm')}</div>
    ),
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'timeOut',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Départ" />
    ),
    cell: ({ row }) => {
      const timeOut = row.getValue('timeOut') as string | null;
      return <div>{timeOut ? format(new Date(timeOut), 'HH:mm') : '—'}</div>;
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: 'duration',
    header: 'Durée',
    cell: ({ row }) => (
      <div>{getDuration(row.original.timeIn, row.original.timeOut)}</div>
    ),
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'verified',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statut" />
    ),
    cell: ({ row }) => {
      const verified = row.getValue('verified') as boolean;
      return verified ? (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Validé</span>
      ) : (
        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">En attente</span>
      );
    },
    filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
