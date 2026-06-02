'use client';

import type { ColumnDef } from '@tanstack/react-table';


import { visibility } from '../data/data';
import type { Task } from '../data/schema';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';
import moment from 'moment';
import Link from 'next/link';

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: 'date_created',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date de création" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">
        {moment(row.getValue('date_created')).format('YY-MM-DD')}
      </div>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'assigned_user',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assigné à" />
    ),

    cell: ({ row }) => (
      <div className="w-[150px]">
        {row.original.assigned_user.name ?? 'Non assigné'}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
  },

  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom" />
    ),
    cell: ({ row }) => (
      <Link href={`/projects/boards/${row.original.id}`}>
        <div className="w-[300px]">{row.getValue('title')}</div>
      </Link>
    ),
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => (
      <div className="w-[300px]">{row.getValue('description')}</div>
    ),
  },
  {
    accessorKey: 'visibility',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Visibilité" />
    ),
    cell: ({ row }) => {
      const status = visibility.find(
        (status) => status.value === row.getValue('visibility')
      );

      if (!status) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center">
          {status.label && (
        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium" style={{ color: '#1E1D3D' }}>
          {status.label}
        </span>
      )}
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
