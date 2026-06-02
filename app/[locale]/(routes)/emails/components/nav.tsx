'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavProps {
  isCollapsed: boolean;
  links: {
    title: string;
    label?: string;
    icon: LucideIcon;
    variant: 'default' | 'ghost';
  }[];
}

export function Nav({ links, isCollapsed }: NavProps) {
  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) =>
          isCollapsed ? (
            <Tooltip key={index} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href="#"
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                    link.variant === 'default'
                      ? 'text-white'
                      : 'hover:bg-gray-100'
                  )}
                  style={link.variant === 'default'
                    ? { background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }
                    : { color: '#1E1D3D' }}
                >
                  <link.icon className="h-4 w-4" />
                  <span className="sr-only">{link.title}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {link.title}
                {link.label && (
                  <span className="ml-auto text-gray-400">
                    {link.label}
                  </span>
                )}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              key={index}
              href="#"
              className={cn(
                'flex h-8 items-center justify-start rounded-md px-3 text-sm font-medium transition-colors',
                link.variant === 'default'
                  ? 'text-white'
                  : 'hover:bg-gray-100'
              )}
              style={link.variant === 'default'
                ? { background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }
                : { color: '#1E1D3D' }}
            >
              <link.icon className="mr-2 h-4 w-4" />
              {link.title}
              {link.label && (
                <span
                  className={cn(
                    'ml-auto',
                    link.variant === 'default' && 'text-white'
                  )}
                >
                  {link.label}
                </span>
              )}
            </Link>
          )
        )}
      </nav>
    </div>
  );
}
