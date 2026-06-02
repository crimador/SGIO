'use client';

import moment from 'moment';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';

import type { ColumnDef } from '@tanstack/react-table';

import { statuses } from '../table-data/data';
import type { AdminUser } from '../table-data/schema';
import { DataTableRowActions } from './data-table-row-actions';
import { DataTableColumnHeader } from './data-table-column-header';

export const columns: ColumnDef<AdminUser>[] = [
  /*   {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="id" />
    ),
    cell: ({ row }) => <div className="">{row.getValue("id")}</div>,
    enableSorting: false,
    enableHiding: false,
  }, */
  {
    accessorKey: 'created_on',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date création" />
    ),
    cell: ({ row }) => (
      <div className="w-[130px]">
        {moment(row.getValue('created_on')).format('YYYY/MM/DD-HH:mm')}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'lastLoginAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dernière connexion" />
    ),
    cell: ({ row }) => {
      const val = row.getValue('lastLoginAt');
      return (
        <div className="min-w-[150px]">
          {val
            ? formatDistanceToNow(new Date(val as string), { addSuffix: true })
            : <span className="text-gray-400">Jamais connecté</span>
          }
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom" />
    ),

    cell: ({ row }) => <div className="">{row.getValue('name')}</div>,
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
    accessorKey: 'is_admin',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Admin" />
    ),

    cell: ({ row }) => (
      <div className="">{row.original.is_admin ? 'Oui' : 'Non'}</div>
    ),
    enableSorting: true,
    enableHiding: true,
  },

  {
    accessorKey: 'userStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue('userStatus')
      );

      if (!status) {
        return null;
      }

      return (
        <div className="flex items-center">
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
    accessorKey: 'userRole',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rôle" />
    ),
    cell: ({ row }) => {
      const role = row.getValue('userRole') as string | null;
      const labels: Record<string, string> = {
        DG: 'Dirigeant', COMPTABLE: 'Comptable',
        COMMERCIAL: 'Commercial', RH: 'Resp. RH',
      };
      return <div className="font-medium">{role ? (labels[role] ?? role) : '—'}</div>;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'userLanguage',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Langue" />
    ),
    cell: ({ row }) => <div className="">{row.getValue('userLanguage')}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
