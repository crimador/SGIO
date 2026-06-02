'use client';

import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type Props = {
  open: boolean;
};

const ChatGPTModuleMenu = ({ open }: Props) => {
  const pathname = usePathname();
  const isPath = pathname.includes('openAi');

  return (
    <div className="my-0.5 px-2">
      <Link
        href={'/openAi'}
        className={cn(
          'relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]',
          isPath
            ? 'border-l-2 border-[#FF7E00] bg-[#FF7E00]/[0.12] pl-[10px] text-white'
            : 'pl-3 text-white/65 hover:bg-white/[0.08] hover:text-white'
        )}
      >
        <Sparkles className="h-[18px] w-[18px] shrink-0" />
        {open && <span className="truncate">Intelligence IA</span>}
      </Link>
    </div>
  );
};

export default ChatGPTModuleMenu;
