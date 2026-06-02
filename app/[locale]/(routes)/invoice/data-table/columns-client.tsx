'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';

import { statuses } from '../data/data';
import type { Task } from '../data/schema';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';
import moment from 'moment';

export const createColumns = (): ColumnDef<Task>[] => {
  const t = useTranslations('InvoicePage');

  return [
    {
      accessorKey: 'date_due',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('dueDate')} />
      ),
      cell: ({ row }) => (
        <div className="w-[120px]">
          {moment(row.getValue('date_due')).format('YY-MM-DD-HH:mm')}
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'variable_symbol',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('number')} />
      ),
      cell: ({ row }) => (
        <div className="w-[120px]">{row.getValue('variable_symbol')}</div>
      ),
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'invoice_amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('amount')} />
      ),
      cell: ({ row }) => (
        <div className="w-[120px]">{row.getValue('invoice_amount')}</div>
      ),
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: 'partner',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('partner')} />
      ),
      cell: ({ row }) => (
        <div className="w-[120px]">{row.getValue('partner')}</div>
      ),
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'rossum_status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('rossumState')} />
      ),
      cell: ({ row }) => <div className="">{row.getValue('rossum_status')}</div>,
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('status')} />
      ),
      cell: ({ row }) => {
        const status = statuses.find(
          (status) => status.value === row.getValue('status')
        );

        if (!status) {
          return null;
        }

        return (
          <div className="flex w-[100px] items-center">
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
      id: 'actions',
      cell: ({ row }) => <DataTableRowActions row={row} />,
    },
  ];
};
