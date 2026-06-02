'use client';

import type { ColumnDef } from '@tanstack/react-table';

import type { Contact } from '../table-data/schema';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';
import moment from 'moment';
import Link from 'next/link';

export const columns: ColumnDef<Contact>[] = [
  {
    accessorKey: 'created_on',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Créé le" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">
        {moment(row.getValue('created_on')).format('DD/MM/YY')}
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
      <div className="min-w-[150px]">
        {
          //@ts-ignore
          row.original.assigned_accounts?.name ?? '—'
        }
      </div>
    ),
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'first_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prénom" />
    ),
    cell: ({ row }) => (
      <Link
        href={`/crm/contacts/${row.original.id}`}
        className="font-medium hover:underline"
        style={{ color: '#1E1D3D' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#FF7E00')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#1E1D3D')}
      >
        {row.getValue('first_name')}
      </Link>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'last_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom de famille" />
    ),
    cell: ({ row }) => <div className="">{row.getValue('last_name')}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="E-mail" />
    ),
    cell: ({ row }) => <div className="">{row.getValue('email')}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'mobile_phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Téléphone" />
    ),
    cell: ({ row }) => <div className="">{row.getValue('mobile_phone')}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statut" />
    ),
    cell: ({ row }) => (
      <div className="">{row.original.status ? 'Actif' : 'Inactif'}</div>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
