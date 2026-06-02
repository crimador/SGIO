'use client';

import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  receipt?: string;
  account?: {
    name: string;
  };
  createdAt: string;
};

export const columns: ColumnDef<Expense>[] = [
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => {
      return (
        <div className="max-w-[200px] truncate">
          {row.getValue('description')}
        </div>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Montant" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      return (
        <div className="font-medium">
          {amount.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
        </div>
      );
    },
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Catégorie" />
    ),
    cell: ({ row }) => {
      const category = row.getValue('category');
      return (
        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium" style={{ color: '#1E1D3D' }}>
          {category as string}
        </span>
      );
    },
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('date'));
      return (
        <div className="text-sm">
          {format(date, 'PPP', { locale: fr })}
        </div>
      );
    },
  },
  {
    accessorKey: 'account',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Compte" />
    ),
    cell: ({ row }) => {
      const account = row.getValue('account') as { name: string } | undefined;
      return (
        <div className="text-sm">
          {account?.name || '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Créé le" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return (
        <div className="text-sm">
          {format(date, 'PPP', { locale: fr })}
        </div>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: true,
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
