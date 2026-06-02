'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DataTablePagination,
} from './data-table-pagination';
import {
  DataTableRowActions,
} from './data-table-row-actions';
import {
  DataTableToolbar,
} from './data-table-toolbar';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  RowData,
} from '@tanstack/react-table';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <DataTableToolbar data={data} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {columns.map((column) => (
              <TableHead key={column.id} colSpan={column.colSpan}>
                {column.isPlaceholder
                  ? null
                  : flexRender(
                      column.header,
                      column.getIsPlaceholder()
                    )}
              </TableHead>
            ))}
          </TableHeader>
          <TableBody>
            {data?.length ? (
              data.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected()}
                >
                  {columns.map((column) => (
                    <TableCell key={column.id}>
                      {flexRender(
                        column.cell,
                        row.getIsSelected(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="flex h-24 items-center justify-center">
                    Aucune dépense trouvée
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-end space-x-2 py-4">
          <DataTablePagination data={data} />
        </div>
      </div>
    </div>
  );
}
