'use client';

import type { Column } from '@tanstack/react-table';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type DateRange = { from: string; to: string };

interface Props<TData> {
  column: Column<TData, unknown> | undefined;
  title?: string;
}

export function DateRangeFilter<TData>({ column, title = 'Période' }: Props<TData>) {
  const value = (column?.getFilterValue() as DateRange) ?? { from: '', to: '' };

  const handleChange = (key: 'from' | 'to', val: string) => {
    const next = { ...value, [key]: val };
    column?.setFilterValue(!next.from && !next.to ? undefined : next);
  };

  const hasFilter = !!(value.from || value.to);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex h-8 items-center gap-1.5 rounded-md border border-dashed px-2 text-sm font-medium transition-colors hover:bg-gray-50 lg:px-3"
          style={{ color: '#1E1D3D' }}
        >
          <CalendarIcon className="h-4 w-4" />
          {title}
          {hasFilter && (
            <span className="ml-1 inline-flex items-center rounded-sm bg-gray-100 px-1 text-xs font-normal">
              {value.from && value.to
                ? `${value.from} → ${value.to}`
                : value.from || value.to}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Du</label>
            <input
              type="date"
              value={value.from}
              onChange={(e) => handleChange('from', e.target.value)}
              className="h-8 rounded-md border px-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Au</label>
            <input
              type="date"
              value={value.to}
              onChange={(e) => handleChange('to', e.target.value)}
              className="h-8 rounded-md border px-2 text-sm"
            />
          </div>
          {hasFilter && (
            <button
              onClick={() => column?.setFilterValue(undefined)}
              className="flex h-8 w-full items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100"
              style={{ color: '#1E1D3D' }}
            >
              Effacer
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
