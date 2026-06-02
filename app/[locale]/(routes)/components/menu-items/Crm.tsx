'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { getDictionary } from '@/dictionaries';
import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import type { FC } from 'react';

type Props = {
  open: boolean;
  localizations: Awaited<ReturnType<typeof getDictionary>>['ModuleMenu']['crm'];
};

const CrmModuleMenu: FC<Props> = ({ open, localizations }) => {
  const router = useRouter();
  const pathname = usePathname();
  const isPath = pathname.includes('crm');

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
          <Coins className="h-[18px] w-[18px] shrink-0" />
          {open && <span className="truncate">{localizations.title}</span>}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="ml-2 w-[250px]">
          <DropdownMenuItem onClick={() => router.push('/crm/dashboard')}>
            Tableau de bord
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/crm/dashboard/user')}>
            Mon tableau de bord
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/crm')}>
            Vue d&apos;ensemble
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/crm/accounts')}>
            {localizations.accounts}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/crm/contacts')}>
            {localizations.contacts}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/crm/leads')}>
            {localizations.leads}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/crm/opportunities')}>
            {localizations.opportunities}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/crm/campaigns')}>
            Campagnes
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/crm/calendar')}>
            Calendrier
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/crm/reports')}>
            Rapports CRM
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/crm/trash')}>
            Corbeille
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CrmModuleMenu;
