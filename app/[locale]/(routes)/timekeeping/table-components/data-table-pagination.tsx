import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import type { Table } from '@tanstack/react-table';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-gray-400">
        {table.getFilteredSelectedRowModel().rows.length} sur{' '}
        {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s).
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Lignes par page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} sur{' '}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="hidden h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-[#FF7E00]/[0.06] disabled:pointer-events-none disabled:opacity-50 lg:flex"
            style={{ color: '#1E1D3D' }}
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Première page</span>
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-[#FF7E00]/[0.06] disabled:pointer-events-none disabled:opacity-50"
            style={{ color: '#1E1D3D' }}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Page précédente</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-[#FF7E00]/[0.06] disabled:pointer-events-none disabled:opacity-50"
            style={{ color: '#1E1D3D' }}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Page suivante</span>
            <ChevronRightIcon className="h-4 w-4" />
          </button>
          <button
            className="hidden h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-[#FF7E00]/[0.06] disabled:pointer-events-none disabled:opacity-50 lg:flex"
            style={{ color: '#1E1D3D' }}
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Dernière page</span>
            <DoubleArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
