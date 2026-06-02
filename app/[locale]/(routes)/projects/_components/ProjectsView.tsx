import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';

import { getActiveUsers } from '@/actions/get-users';
import { getBoards } from '@/actions/projects/get-boards';

import { authOptions } from '@/lib/auth';

import NewTaskDialog from '../dialogs/NewTask';
import NewProjectDialog from '../dialogs/NewProject';

import H2Title from '@/components/typography/h2';

import { ProjectsDataTable } from '../table-components/data-table';
import { columns } from '../table-components/columns';
import AiAssistant from './AiAssistant';

const ProjectsView = async () => {
  const session = await getServerSession(authOptions);

  if (!session) return null;

  const userId = session.user.id;

  const [users, boards] = await Promise.all([
    getActiveUsers(),
    getBoards(userId!),
  ]);

  return (
    <>
      <div className="flex flex-wrap gap-2 py-10">
        <NewProjectDialog />
        <NewTaskDialog users={users} boards={boards} />
        <Link
          href="/projects/tasks"
          className="flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-[#FF7E00]/[0.06]"
          style={{ color: '#1E1D3D' }}
        >
          Toutes les tâches
        </Link>
        <Link
          href={`/projects/tasks/${userId}`}
          className="flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-[#FF7E00]/[0.06]"
          style={{ color: '#1E1D3D' }}
        >
          Mes tâches
        </Link>
        <Link
          href="/projects/dashboard"
          className="flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-[#FF7E00]/[0.06]"
          style={{ color: '#1E1D3D' }}
        >
          Tableau de bord
        </Link>
        <Link
          href="/projects/teams"
          className="flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-[#FF7E00]/[0.06]"
          style={{ color: '#1E1D3D' }}
        >
          Équipes
        </Link>
        <Link
          href="/projects/teams/my-teams"
          className="flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-[#FF7E00]/[0.06]"
          style={{ color: '#1E1D3D' }}
        >
          Mes équipes
        </Link>
        <AiAssistant session={session} />
      </div>
      <div className="space-y-3 pt-2">
        <H2Title>Projets</H2Title>
        <ProjectsDataTable data={boards} columns={columns} />
      </div>
    </>
  );
};

export default ProjectsView;
