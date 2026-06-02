'use client';

import type { Table } from '@tanstack/react-table';
import { Download } from 'lucide-react';
import { exportToCsv } from '@/lib/export-csv';

type CsvRow = Record<string, string | number | boolean | null | undefined>;

interface ExportCsvButtonProps<TData> {
  table: Table<TData>;
  filename: string;
  getExportRow: (row: TData) => CsvRow;
}

export function ExportCsvButton<TData>({
  table,
  filename,
  getExportRow,
}: ExportCsvButtonProps<TData>) {
  const handleExport = () => {
    const rows = table.getFilteredRowModel().rows.map((r) => getExportRow(r.original));
    exportToCsv(filename, rows);
  };

  return (
    <button
      onClick={handleExport}
      className="flex h-8 items-center gap-1.5 rounded-md border px-2 text-sm font-medium transition-colors hover:bg-gray-50 lg:px-3"
      style={{ color: '#1E1D3D' }}
    >
      <Download className="h-4 w-4" />
      Exporter CSV
    </button>
  );
}
