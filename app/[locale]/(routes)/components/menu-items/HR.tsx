'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Users, Clock, DollarSign, FileText, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import type { FC } from 'react';
import type { UserRole } from '@/lib/permissions';

type Props = {
  open: boolean;
  title?: string;
  userRole?: UserRole;
};

const HRModuleMenu: FC<Props> = ({ open, title, userRole }) => {
  const router   = useRouter();
  const pathname = usePathname();
  const isPath   = pathname.includes('/hr') || pathname.includes('/employees') || pathname.includes('/timekeeping') || pathname.includes('/trainings');
  const isEmployee = userRole === 'COMMERCIAL';

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
          <Users className="h-[18px] w-[18px] shrink-0" />
          {open && <span className="truncate">{title ?? 'RH'}</span>}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="ml-2 w-[250px]">
          {!isEmployee && (
            <>
              <DropdownMenuItem onClick={() => router.push('/hr')}>
                <Users className="mr-2 h-4 w-4" />
                Tableau de bord RH
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/hr/employees')}>
                <Users className="mr-2 h-4 w-4" />
                Employés
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/hr/timekeeping')}>
                <Clock className="mr-2 h-4 w-4" />
                Pointage
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => router.push('/hr/payslip')}>
            <DollarSign className="mr-2 h-4 w-4" />
            Bulletins de paie
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/hr/conges')}>
            <FileText className="mr-2 h-4 w-4" />
            Congés &amp; Demandes
          </DropdownMenuItem>
          {!isEmployee && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/hr/trainings')}>
                <GraduationCap className="mr-2 h-4 w-4" />
                Formations
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default HRModuleMenu;
