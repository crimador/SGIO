'use client';

import type { ColumnDef } from '@tanstack/react-table';


import { labels, priorities, statuses } from '../data/data';
import type { Task } from '../data/schema';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';
import moment from 'moment';

export const columns: ColumnDef<Task>[] = [
  /*   {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }, */
  {
    accessorKey: 'dueDateAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Échéance" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">
        {moment(row.getValue('dueDateAt')).format('YY-MM-DD')}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'assigned_user',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assigné à" />
    ),

    cell: ({ row }) => (
      <div className="w-[180px]">
        {
          //@ts-ignore
          row.getValue('assigned_user')?.name ?? 'Non assigné'
        }
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Titre" />
    ),
    cell: ({ row }) => {
      const label = labels.find(
        (label) => label.value === row.original.content
      );

      return (
        <div className="flex space-x-2">
          {label && (
            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium" style={{ color: '#1E1D3D' }}>
              {label.label}
            </span>
          )}
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue('title')}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'taskStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statut" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue('taskStatus')
      );

      if (!status) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center">
          {status.icon && (
            <status.icon className="mr-2 h-4 w-4 text-gray-400" />
          )}
          <span>{status.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priorité" />
    ),
    cell: ({ row }) => {
      const priority = priorities.find(
        (priority) => priority.value === row.getValue('priority')
      );

      if (!priority) {
        return null;
      }

      return (
        <div className="flex items-center">
          {priority.icon && (
            <priority.icon className="mr-2 h-4 w-4 text-gray-400" />
          )}
          <span>{priority.label}</span>
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
