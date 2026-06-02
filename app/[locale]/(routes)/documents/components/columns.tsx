'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Task } from '../data/schema';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';
import moment from 'moment';

const SYSTEM_TYPE_LABELS: Record<string, string> = {
  INVOICE: 'Facture',
  RECEIPT: 'Reçu',
  CONTRACT: 'Contrat',
  OFFER: 'Offre',
  ID: "Carte d'identité",
  PASSPORT: 'Passeport',
  VISA: 'Visa',
  INSURANCE: 'Assurance',
  HEALTH: 'Santé',
  CERTIFICATE: 'Certificat',
  OTHER: 'Autre',
};

function formatSize(bytes: number | null | undefined): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} Go`;
}

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date de création" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px] text-sm">
        {moment(row.getValue('createdAt')).format('YY-MM-DD')}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'document_system_type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = row.getValue('document_system_type') as string | null;
      if (!type) return <div className="text-gray-400">—</div>;
      return (
        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium" style={{ color: '#1E1D3D' }}>
          {SYSTEM_TYPE_LABELS[type] ?? type}
        </span>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'document_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom du document" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[300px] truncate font-medium block">
        {row.getValue('document_name')}
      </span>
    ),
  },
  {
    accessorKey: 'size',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Taille" />
    ),
    cell: ({ row }) => (
      <div className="w-[70px] text-sm text-gray-400">
        {formatSize(row.getValue('size'))}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'created_by',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Créé par" />
    ),
    cell: ({ row }) => {
      const creator = row.getValue('created_by') as { name: string | null } | null;
      return (
        <div className="w-[130px] text-sm text-gray-400">
          {creator?.name ?? '—'}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'tasks',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tâches liées" />
    ),
    cell: ({ row }) => {
      const tasks =
        (row.getValue('tasks') as { id: string; title: string }[]) ?? [];
      if (tasks.length === 0)
        return <div className="text-gray-400">—</div>;
      return (
        <div className="flex flex-wrap gap-1">
          {tasks.map((t) => (
            <span key={t.id} className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium" style={{ color: '#1E1D3D' }}>
              {t.title}
            </span>
          ))}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'accounts',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Comptes CRM" />
    ),
    cell: ({ row }) => {
      const accounts =
        (row.getValue('accounts') as { id: string; name: string }[]) ?? [];
      if (accounts.length === 0)
        return <div className="text-gray-400">—</div>;
      return (
        <div className="flex flex-wrap gap-1">
          {accounts.map((a) => (
            <span key={a.id} className="inline-flex items-center rounded-sm bg-gray-100 px-1 text-xs font-normal">
              {a.name}
            </span>
          ))}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'assigned_to_user',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assigné à" />
    ),
    cell: ({ row }) => (
      <div className="w-[130px] text-sm text-gray-400">
        {
          //@ts-ignore
          row.getValue('assigned_to_user')?.name ?? 'Non assigné'
        }
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[220px] truncate text-sm text-gray-400">
        {row.getValue('description') || '—'}
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
