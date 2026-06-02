'use client';

import type { ColumnDef } from '@tanstack/react-table';

import type { Payslip } from '../table-data/schema';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';

const MONTHS_FR: Record<string, string> = {
  '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Aoû',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc',
};

const formatPeriod = (period: string) => {
  const [year, month] = period.split('-');
  return `${MONTHS_FR[month] ?? month} ${year}`;
};

const StatusBadge = ({ status }: { status: Payslip['status'] }) => {
  if (status === 'BROUILLON')
    return <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">Brouillon</span>;
  if (status === 'EMIS')
    return <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Émis</span>;
  return <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Payé</span>;
};

export const columns: ColumnDef<Payslip>[] = [
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
    accessorKey: 'period',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Période" />
    ),
    cell: ({ row }) => <div>{formatPeriod(row.getValue('period'))}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'baseSalary',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Base brute" />
    ),
    cell: ({ row }) => (
      <div className="text-right">
        {(row.getValue('baseSalary') as number).toLocaleString('fr-FR')}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'bonuses',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Primes" />
    ),
    cell: ({ row }) => {
      const val = row.getValue('bonuses') as number;
      return (
        <div className={`text-right ${val > 0 ? 'text-green-600' : 'text-gray-400'}`}>
          {val > 0 ? `+${val.toLocaleString('fr-FR')}` : '—'}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'deductions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Retenues" />
    ),
    cell: ({ row }) => {
      const val = row.getValue('deductions') as number;
      return (
        <div className={`text-right ${val > 0 ? 'text-red-500' : 'text-gray-400'}`}>
          {val > 0 ? `-${val.toLocaleString('fr-FR')}` : '—'}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'netSalary',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Net à payer" />
    ),
    cell: ({ row }) => (
      <div className="text-right font-bold">
        {(row.getValue('netSalary') as number).toLocaleString('fr-FR')} FCFA
      </div>
    ),
    enableSorting: true,
    enableHiding: false,
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
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
