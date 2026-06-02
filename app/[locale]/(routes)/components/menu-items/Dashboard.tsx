'use client';

import { Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type Props = {
  open: boolean;
  title: string;
};

const DashboardMenu = ({ open, title }: Props) => {
  const pathname = usePathname();
  const isPath = pathname === '/' || pathname.endsWith('/fr') || pathname.endsWith('/en') || pathname.endsWith('/de') || pathname.endsWith('/cz') || pathname.endsWith('/uk') || pathname.endsWith('/ko');

  return (
    <div className="my-0.5 px-2">
      <Link
        href={'/'}
        className={cn(
          'relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]',
          isPath
            ? 'border-l-2 border-[#FF7E00] bg-[#FF7E00]/[0.12] pl-[10px] text-white'
            : 'pl-3 text-white/65 hover:bg-white/[0.08] hover:text-white'
        )}
      >
        <Home className="h-[18px] w-[18px] shrink-0" />
        {open && <span className="truncate">{title}</span>}
      </Link>
    </div>
  );
};

export default DashboardMenu;
