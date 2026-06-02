import * as React from 'react';
import { Filter } from 'lucide-react';

import { Input } from '@/components/ui/input';

interface DataTableToolbarProps<TData> {
  table: any;
  data: TData[];
}

export function DataTableToolbar<TData>({
  table,
  data,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex items-center py-4">
      <Input
        placeholder={`Filtrer les dépenses... (${data.length} dépenses)`}
        value={(table.getColumn('description')?.getFilterValue() as string) ?? ''}
        onChange={(event) =>
          table.getColumn('description')?.setFilterValue(event.target.value)
        }
        className="max-w-sm"
      />
      <button
        className="ml-2 flex h-8 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors hover:bg-gray-50"
        style={{ color: '#1E1D3D' }}
      >
        <Filter className="mr-1 h-4 w-4" />
        Filtres avancés
      </button>
    </div>
  );
}
