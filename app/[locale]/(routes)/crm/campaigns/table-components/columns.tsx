'use client';

import type { ColumnDef } from '@tanstack/react-table';
import moment from 'moment';
import { statuses } from '../table-data/data';
import type { Campaign } from '../table-data/schema';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';

export const columns: ColumnDef<Campaign>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nom" />,
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate text-muted-foreground">
        {row.getValue('description') ?? '—'}
      </div>
    ),
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Statut" />,
    cell: ({ row }) => {
      const status = statuses.find((s) => s.value === row.getValue('status'));
      if (!status) return <div className="text-muted-foreground">—</div>;
      return (
        <div className="flex items-center gap-2">
          {status.icon && <status.icon className="h-4 w-4 text-muted-foreground" />}
          <span>{status.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: '_count',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Opportunités" />,
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {/* @ts-ignore */}
        {row.getValue('_count')?.opportunities ?? 0}
      </div>
    ),
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
