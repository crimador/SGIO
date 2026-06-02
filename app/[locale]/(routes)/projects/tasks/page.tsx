import React from 'react';
import Container from '../../components/ui/Container';
import { getTasks } from '@/actions/projects/get-tasks';
import { getActiveUsers } from '@/actions/get-users';
import { getBoards } from '@/actions/projects/get-boards';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TasksDataTable } from './components/data-table';
import { columns } from './components/columns';
import NewTaskDialog from '../dialogs/NewTask';

const TasksPage = async () => {
  const session = await getServerSession(authOptions);
  const [tasks, activeUsers, boards] = await Promise.all([
    getTasks(),
    getActiveUsers(),
    getBoards(session?.user?.id),
  ]);

  return (
    <Container
      title="Toutes les tâches"
      description="Vue d'ensemble de toutes vos tâches."
    >
      <div className="py-5">
        <NewTaskDialog users={activeUsers} boards={boards ?? []} />
      </div>
      <div>
        <TasksDataTable data={tasks ?? []} columns={columns} />
      </div>
    </Container>
  );
};

export default TasksPage;
