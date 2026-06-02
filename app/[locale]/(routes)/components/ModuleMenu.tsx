'use client';

import type { FC } from 'react';
import React, { useEffect, useState } from 'react';

import ProjectModuleMenu from './menu-items/Projects';
import SecondBrainModuleMenu from './menu-items/SecondBrain';
import ReportsModuleMenu from './menu-items/Reports';
import DocumentsModuleMenu from './menu-items/Documents';
import ChatGPTModuleMenu from './menu-items/ChatGPT';
import HRModuleMenu from './menu-items/HR';
import WorkflowsModuleMenu from './menu-items/Workflows';
import DataboxModuleMenu from './menu-items/Databoxes';
import CrmModuleMenu from './menu-items/Crm';
import FinanceModuleMenu from './menu-items/Finance';
import AdministrationMenu from './menu-items/Administration';
import DashboardMenu from './menu-items/Dashboard';
import EmailsModuleMenu from './menu-items/Emails';

import { cn } from '@/lib/utils';
import { canAccess } from '@/lib/permissions';
import type { UserRole } from '@/lib/permissions';
import type { system_Modules_Enabled } from '@prisma/client';
import type { getDictionary } from '@/dictionaries';

type Props = {
  modules: system_Modules_Enabled[];
  dict: Awaited<ReturnType<typeof getDictionary>>;
  build: number;
  userRole: UserRole;
};

const ModuleMenu: FC<Props> = ({ modules, dict, build, userRole }) => {
  const [open, setOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return null;

  const mod = (name: string) => modules.find(m => m.name === name && m.enabled);

  return (
    <div
      className={cn(
        'relative flex h-screen flex-col transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
        open ? 'w-64' : 'w-[72px]'
      )}
      style={{ background: '#1E1D3D' }}
    >
      {/* Logo area */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <button
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #FF7E00, #FAC731)' }}
          aria-label="Toggle sidebar"
        >
          <span className="text-sm font-black text-white tracking-tight">KG</span>
        </button>
        <div
          className={cn(
            'overflow-hidden transition-all duration-300',
            open ? 'w-40 opacity-100' : 'w-0 opacity-0'
          )}
        >
          <span className="block text-base font-bold text-white leading-tight whitespace-nowrap">
            KEKELI Group
          </span>
          <span className="block text-[10px] font-medium tracking-widest uppercase"
            style={{ color: '#FAC731' }}>
            {process.env.NEXT_PUBLIC_APP_NAME}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 scrollbar-none">
        <DashboardMenu open={open} title={dict.ModuleMenu.dashboard} />

        {canAccess(userRole, 'crm') && mod('crm') && (
          <CrmModuleMenu open={open} localizations={dict.ModuleMenu.crm} />
        )}
        {canAccess(userRole, 'projects') && mod('projects') && (
          <ProjectModuleMenu open={open} title={dict.ModuleMenu.projects} />
        )}
        {mod('emails') && (
          <EmailsModuleMenu open={open} title={dict.ModuleMenu.emails} />
        )}
        {mod('secondBrain') && (
          <SecondBrainModuleMenu open={open} />
        )}
        {mod('employee') && (
          <HRModuleMenu open={open} title="Ressources Humaines" userRole={userRole} />
        )}
        {canAccess(userRole, 'finance') && mod('finance') && (
          <FinanceModuleMenu open={open} title="Finance" />
        )}
        {mod('workflow') && (
          <WorkflowsModuleMenu open={open} //@ts-ignore-next-line
            title={dict.ModuleMenu?.workflows} />
        )}
        {mod('reports') && (
          <ReportsModuleMenu open={open} title={dict.ModuleMenu.reports} />
        )}
        {canAccess(userRole, 'documents') && mod('documents') && (
          <DocumentsModuleMenu open={open} title={dict.ModuleMenu.documents} />
        )}
        {mod('databox') && <DataboxModuleMenu open={open} />}
        {mod('openai') && <ChatGPTModuleMenu open={open} />}
        {canAccess(userRole, 'admin') && (
          <AdministrationMenu open={open} title={dict.ModuleMenu.settings} />
        )}
      </nav>

      {/* Footer sidebar */}
      <div className={cn(
        'shrink-0 border-t border-white/10 px-4 py-3 transition-all duration-300',
        !open && 'opacity-0 pointer-events-none'
      )}>
        <span className="block text-[10px] font-medium tracking-wide text-white/40">
          build 0.0.3-beta-{build}
        </span>
      </div>

      {/* Orange accent bar at the right edge */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-[3px]"
        style={{ background: 'linear-gradient(to bottom, #FF7E00, #FAC731, transparent)' }} />
    </div>
  );
};

export default ModuleMenu;
