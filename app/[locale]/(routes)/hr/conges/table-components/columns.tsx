'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

import type { Request } from '../table-data/schema';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';

const TYPE_LABELS: Record<string, string> = {
  Vacation: 'Congé annuel',
  Leave: 'Congé exceptionnel',
  Sick: 'Arrêt maladie',
  Maternity: 'Congé maternité',
  Training: 'Formation',
  Raise: 'Augmentation',
  Documents: 'Documents',
  Other: 'Autre',
};

const LEAVE_TYPES = ['Vacation', 'Leave', 'Sick', 'Maternity', 'Training'];

const StatusBadge = ({ status }: { status: Request['status'] }) => {
  if (status === 'EN_ATTENTE')
    return <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">En attente</span>;
  if (status === 'APPROUVE')
    return <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Approuvé</span>;
  return <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Rejeté</span>;
};

export function getColumns(canApprove: boolean): ColumnDef<Request>[] {
return [
  {
    id: 'employeeName',
    accessorFn: (row) => `${row.employee.firstName} ${row.employee.lastName}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Employé" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.employee.firstName} {row.original.employee.lastName}
        {row.original.employee.position && (
          <div className="text-xs text-gray-400">{row.original.employee.position}</div>
        )}
      </div>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium" style={{ color: '#1E1D3D' }}>
        {TYPE_LABELS[row.getValue('type') as string] ?? row.getValue('type')}
      </span>
    ),
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'startDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Début" />
    ),
    cell: ({ row }) => {
      const type = row.original.type;
      if (!LEAVE_TYPES.includes(type)) return <span className="text-gray-400">—</span>;
      return <div>{format(new Date(row.getValue('startDate')), 'dd/MM/yyyy', { locale: fr })}</div>;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'endDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fin" />
    ),
    cell: ({ row }) => {
      const type = row.original.type;
      const endDate = row.getValue('endDate') as string | null;
      if (!LEAVE_TYPES.includes(type) || !endDate) return <span className="text-gray-400">—</span>;
      return <div>{format(new Date(endDate), 'dd/MM/yyyy', { locale: fr })}</div>;
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: 'dureeOuMontant',
    header: 'Durée / Montant',
    cell: ({ row }) => {
      const req = row.original;
      if (req.type === 'Raise') {
        return req.requestedAmount
          ? <div>{new Intl.NumberFormat('fr-FR').format(req.requestedAmount)} FCFA</div>
          : <span className="text-gray-400">—</span>;
      }
      if (LEAVE_TYPES.includes(req.type) && req.numberOfDays) {
        return <div>{req.numberOfDays} j.</div>;
      }
      return <span className="text-gray-400">—</span>;
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: 'retour',
    header: 'Retour',
    cell: ({ row }) => {
      const req = row.original;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (!LEAVE_TYPES.includes(req.type) || req.status !== 'APPROUVE' || !req.endDate) {
        return <span className="text-xs text-gray-400">—</span>;
      }
      if (req.returnedAt) {
        return (
          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {format(new Date(req.returnedAt), 'dd/MM', { locale: fr })}
          </span>
        );
      }
      if (new Date(req.endDate) < today) {
        return (
          <span className="flex items-center gap-1 text-xs text-orange-600 font-medium">
            <AlertTriangle className="h-3.5 w-3.5" />
            Non confirmé
          </span>
        );
      }
      return <span className="text-xs text-gray-400">En cours</span>;
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statut" />
    ),
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} canApprove={canApprove} />,
  },
];
}
