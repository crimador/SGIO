'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

type Props = {
  open: boolean;
  title?: string;
};

const TimekeepingModuleMenu = ({ open, title }: Props) => {
  const pathname = usePathname();

  return (
    <div className="mb-5">
      <div className="mb-2 px-3 text-lg font-semibold tracking-tight">
        {title || 'Timekeeping'}
      </div>
      <div className="space-y-1">
        <Link
          href="/timekeeping"
          className={cn(
            'flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors',
            pathname === '/timekeeping'
              ? 'bg-accent text-accent-foreground'
              : 'transparent'
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {open && 'Pointage'}
        </Link>
      </div>
    </div>
  );
};

export default TimekeepingModuleMenu;
