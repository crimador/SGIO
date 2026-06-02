'use client';

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

export const columns: any[] = [
  {
    accessorKey: 'description',
    header: 'Description',
    cell: (row: any) => (
      <div className="max-w-[200px] truncate">
        {row.getValue('description')}
      </div>
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Montant',
    cell: (row: any) => {
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
    header: 'Catégorie',
    cell: ({ row }) => {
      const category = row.getValue('category');
      return (
        <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
          {category}
        </div>
      );
    },
  },
  {
    accessorKey: 'date',
    header: 'Date',
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
    header: 'Compte',
    cell: ({ row }) => {
      const account = row.getValue('account');
      return (
        <div className="text-sm">
          {account?.name || '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Créé le',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return (
        <div className="text-sm">
          {format(date, 'PPP', { locale: fr })}
        </div>
      );
    },
  },
];
