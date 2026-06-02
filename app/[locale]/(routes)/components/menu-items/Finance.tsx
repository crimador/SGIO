'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import type { FC } from 'react';

type Props = {
  open: boolean;
  title?: string;
};

const FinanceModuleMenu: FC<Props> = ({ open, title }) => {
  const router   = useRouter();
  const pathname = usePathname();
  const isPath   = pathname.includes('finance');

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
          <Wallet className="h-[18px] w-[18px] shrink-0" />
          {open && <span className="truncate">{title ?? 'Finance'}</span>}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="ml-2 w-[250px]">
          <DropdownMenuItem onClick={() => router.push('/finance')}>
            Tableau de bord
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/finance/invoices')}>
            Devis &amp; Factures
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/finance/invoices?type=AVOIR')}>
            Avoirs
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/finance/invoices/unpaid')}>
            Impayés
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/finance/releve')}>
            Relevé de compte
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/finance/treasury')}>
            Trésorerie
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/finance/treasury/accounts')}>
            Comptes
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/finance/expenses')}>
            Dépenses
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/finance/tva')}>
            Rapport TVA
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/finance/export')}>
            Export CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default FinanceModuleMenu;
