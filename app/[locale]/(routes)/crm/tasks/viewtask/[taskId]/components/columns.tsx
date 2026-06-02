'use client';

import type { ColumnDef } from '@tanstack/react-table';

import { labels } from '../data/data';
import type { Task } from '../data/schema';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: 'assigned_to_user',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assigné à" />
    ),

    cell: ({ row }) => (
      <div className="w-[150px]">
        {
          //@ts-ignore
          row.getValue('assigned_to_user')?.name ?? 'Non assigné'
        }
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'document_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom du document" />
    ),
    cell: ({ row }) => {
      const label = labels.find(
        (label) => label.value === row.original.document_name
      );

      return (
        <div className="flex space-x-2">
          {label && (
            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium" style={{ color: '#1E1D3D' }}>
              {label.label}
            </span>
          )}
          <span className="max-w-[500px] truncate font-medium">
            {row.original.document_name}
          </span>
        </div>
      );
    },
  },

  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
