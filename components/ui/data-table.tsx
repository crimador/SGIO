'use client';
import * as React from 'react';

import { Input } from '@/components/ui/input';

import type {
  ColumnDef,
  ColumnFiltersState,
  VisibilityState,
} from '@tanstack/react-table';
import {
  flexRender,
  getFilteredRowModel,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  search: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  search,
}: DataTableProps<TData, TValue>) {
  //This is for filtering the columns
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  //This is for hiding the columns
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    //For pagination
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    //For filtering
    getFilteredRowModel: getFilteredRowModel(),
    //For visibility
    onColumnVisibilityChange: setColumnVisibility,

    state: {
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Search in Titles ..."
          value={(table.getColumn(search)?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn(search)?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        {/* Visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="ml-auto flex h-8 items-center rounded-md border px-3 text-sm font-medium transition-colors hover:bg-gray-50"
              style={{ color: '#1E1D3D' }}
            >
              Columns
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Visibility */}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="flex h-8 items-center rounded-md border px-3 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-50"
          style={{ color: '#1E1D3D' }}
        >
          Previous
        </button>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="flex h-8 items-center rounded-md border px-3 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-50"
          style={{ color: '#1E1D3D' }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
