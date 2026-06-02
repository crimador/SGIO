'use client';

import { Wrench, Building2, Users, Puzzle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { FC } from 'react';

type Props = {
  open: boolean;
  title: string;
};

const AdministrationMenu: FC<Props> = ({ open, title }) => {
  const router   = useRouter();
  const pathname = usePathname();
  const isPath   = pathname.includes('admin') || pathname.includes('settings');

  return (
    <div className="my-0.5 px-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]',
            isPath
              ? 'border-l-2 border-[#FF7E00] bg-[#FF7E00]/[0.12] pl-[10px] text-white'
              : 'pl-3 text-white/65 hover:bg-white/[0.08] hover:text-white'
          )}
        >
          <Wrench className="h-[18px] w-[18px] shrink-0" />
          {open && <span className="truncate">{title}</span>}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="ml-2 w-[250px]">
          <DropdownMenuItem onClick={() => router.push('/finance/settings')}>
            <Building2 className="mr-2 h-4 w-4" />
            Paramètres du cabinet
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/admin/users')}>
            <Users className="mr-2 h-4 w-4" />
            Utilisateurs
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/admin/modules')}>
            <Puzzle className="mr-2 h-4 w-4" />
            Modules
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AdministrationMenu;
