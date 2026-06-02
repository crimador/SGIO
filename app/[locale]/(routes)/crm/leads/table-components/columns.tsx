'use client';

import type { ColumnDef } from '@tanstack/react-table';

import { statuses } from '../table-data/data';
import type { Lead } from '../table-data/schema';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';
import moment from 'moment';
import Link from 'next/link';

export const columns: ColumnDef<Lead>[] = [
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Créé le" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">
        {moment(row.getValue('createdAt')).format('DD/MM/YY')}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    filterFn: (row, id, value: { from: string; to: string }) => {
      const d = new Date(row.getValue(id) as string);
      if (value.from && d < new Date(value.from)) return false;
      if (value.to && d > new Date(value.to + 'T23:59:59')) return false;
      return true;
    },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mise à jour" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">
        {moment(row.getValue('updatedAt')).format('DD/MM/YY')}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
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
    accessorKey: 'company',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Entreprise" />
    ),
    cell: ({ row }) => (
      <div className="">
        {
          //@ts-ignore
          row.getValue('company') ?? '—'
        }
      </div>
    ),
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'firstName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom & Prénom" />
    ),
    cell: ({ row }) => (
      <Link
        href={`/crm/leads/${row.original.id}`}
        className="font-medium hover:underline"
        style={{ color: '#1E1D3D' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#FF7E00')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#1E1D3D')}
      >
        {row.original.firstName ? row.getValue('firstName') : ''}
        {' '}
        {row.original.lastName}
      </Link>
    ),
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="E-mail" />
    ),
    cell: ({ row }) => <div className="w-[150px]">{row.getValue('email')}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Téléphone" />
    ),
    cell: ({ row }) => <div className="w-[150px]">{row.getValue('phone')}</div>,
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
