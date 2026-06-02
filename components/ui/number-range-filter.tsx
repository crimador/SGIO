'use client';

import type { Column } from '@tanstack/react-table';
import { TrendingUp } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type NumberRange = { min: string; max: string };

interface Props<TData> {
  column: Column<TData, unknown> | undefined;
  title?: string;
  unit?: string;
}

export function NumberRangeFilter<TData>({ column, title = 'Montant', unit = 'FCFA' }: Props<TData>) {
  const value = (column?.getFilterValue() as NumberRange) ?? { min: '', max: '' };

  const handleChange = (key: 'min' | 'max', val: string) => {
    const next = { ...value, [key]: val };
    column?.setFilterValue(!next.min && !next.max ? undefined : next);
  };

  const fmt = (v: string) => Number(v).toLocaleString('fr-FR');
  const hasFilter = !!(value.min || value.max);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex h-8 items-center gap-1.5 rounded-md border border-dashed px-2 text-sm font-medium transition-colors hover:bg-gray-50 lg:px-3"
          style={{ color: '#1E1D3D' }}
        >
          <TrendingUp className="h-4 w-4" />
          {title}
          {hasFilter && (
            <span className="ml-1 inline-flex items-center rounded-sm bg-gray-100 px-1 text-xs font-normal">
              {value.min && value.max
                ? `${fmt(value.min)} → ${fmt(value.max)}`
                : value.min
                  ? `≥ ${fmt(value.min)}`
                  : `≤ ${fmt(value.max)}`}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-4" align="start">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Minimum ({unit})</label>
            <input
              type="number"
              value={value.min}
              onChange={(e) => handleChange('min', e.target.value)}
              className="h-8 rounded-md border px-2 text-sm"
              placeholder="0"
              min={0}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Maximum ({unit})</label>
            <input
              type="number"
              value={value.max}
              onChange={(e) => handleChange('max', e.target.value)}
              className="h-8 rounded-md border px-2 text-sm"
              placeholder="Illimité"
              min={0}
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
