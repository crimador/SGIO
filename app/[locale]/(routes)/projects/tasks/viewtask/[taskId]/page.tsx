import { getTask } from '@/actions/projects/get-task';
import React from 'react';
import moment from 'moment';

import { getDocuments } from '@/actions/documents/get-documents';
import { getTaskComments } from '@/actions/projects/get-task-comments';
import { getTaskDocuments } from '@/actions/projects/get-task-documents';

import { TeamConversations } from './components/team-conversation';
import { TaskDataTable } from './components/data-table';
import { columns } from './components/columns';
import { columnsTask } from './components/columns-task';

import TaskViewActions from './components/TaskViewActions';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Calendar, Shield, User } from 'lucide-react';
import { getActiveUsers } from '@/actions/get-users';
import { getBoards } from '@/actions/projects/get-boards';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

type TaskPageProps = {
  params: {
    taskId: string;
  };
};

const PRIORITY_CLASSES: Record<string, string> = {
  critical: 'bg-purple-100 text-purple-700',
  high:     'bg-red-100 text-red-700',
  medium:   'bg-orange-100 text-orange-700',
  low:      'bg-green-100 text-green-700',
  normal:   'bg-yellow-100 text-yellow-700',
};

const STATUS_CLASSES: Record<string, string> = {
  COMPLETE: 'bg-green-100 text-green-700',
  ACTIVE:   'bg-blue-100 text-blue-700',
  PENDING:  'bg-yellow-50 text-yellow-700',
};

const TaskPage = async ({ params }: TaskPageProps) => {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  const { taskId } = params;
  const task: any = await getTask(taskId);
  const taskDocuments: any = await getTaskDocuments(taskId);
  const documents: any = await getDocuments();
  const comments: any = await getTaskComments(taskId);
  const activeUsers: any = await getActiveUsers();
  const boards = await getBoards(user?.id!, user?.userRole);

  return (
    <div className="flex w-full flex-col space-x-2 px-2 md:flex-row">
      <div className="flex w-full flex-col md:w-2/3">
        <div className="mb-5 w-full rounded-lg border">
          <Card className="overflow-hidden">
            <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
            <CardHeader className="pb-3 pt-5">
              <p className="text-base font-bold" style={{ color: '#1E1D3D' }}>{task.title}</p>
              <p className="mt-0.5 text-sm text-gray-400">{task.content}</p>
            </CardHeader>
            <CardContent>
              <div>
                <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-[#FF7E00]/[0.04]">
                  <Calendar className="mt-px h-5 w-5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Date de création
                    </p>
                    <p className="text-sm text-gray-400">
                      {moment(task.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                    </p>
                  </div>
                </div>
                <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-[#FF7E00]/[0.04]">
                  <Calendar className="mt-px h-5 w-5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Date d&apos;échéance</p>
                    <p className="text-sm text-gray-400">
                      {moment(task.dueDateAt).format('YYYY-MM-DD HH:mm')}
                    </p>
                  </div>
                </div>
                <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-[#FF7E00]/[0.04]">
                  <Calendar className="mt-px h-5 w-5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Dernière modification
                    </p>
                    <p className="text-sm text-gray-400">
                      {moment(task.lastEditedAt).format('YYYY-MM-DD HH:mm:ss')}
                    </p>
                  </div>
                </div>
                <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-[#FF7E00]/[0.04]">
                  <Shield className="mt-px h-5 w-5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Priorité</p>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_CLASSES[task.priority as string] ?? 'bg-gray-100 text-gray-600'}`}>
                      {{ low: 'Faible', normal: 'Normale', medium: 'Moyenne', high: 'Haute', critical: 'Critique' }[task.priority as string] ?? task.priority}
                    </span>
                  </div>
                </div>
                <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-[#FF7E00]/[0.04]">
                  <Shield className="mt-px h-5 w-5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Statut</p>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[task.taskStatus as string] ?? 'bg-gray-100 text-gray-600'}`}>
                      {{ ACTIVE: 'Actif', PENDING: 'En attente', COMPLETE: 'Terminé' }[task.taskStatus as string] ?? task.taskStatus}
                    </span>
                  </div>
                </div>
                <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-[#FF7E00]/[0.04]">
                  <User className="mt-px h-5 w-5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Assigné à
                    </p>
                    <p className="text-sm text-gray-400">
                      {task.assigned_user?.name || 'Non assigné'}
                    </p>
                  </div>
                </div>
                <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-[#FF7E00]/[0.04]">
                  <User className="mt-px h-5 w-5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Créé par
                    </p>
                    <p className="text-sm text-gray-400">
                      {activeUsers.find(
                        (user: any) => user.id === task.createdBy
                      )?.name || 'Inconnu'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="flex flex-wrap gap-2 px-6 pb-6">
              <TaskViewActions
                taskId={taskId}
                users={activeUsers}
                boards={boards}
                initialData={task}
                allDocuments={documents}
                linkedDocuments={taskDocuments}
              />
            </div>
          </Card>
        </div>
        <h4 className="scroll-m-20 py-5 text-xl font-semibold tracking-tight">
          Documents de la tâche ({taskDocuments.length})
        </h4>
        <TaskDataTable data={taskDocuments} columns={columnsTask} />
        <div className="my-4 h-px bg-gray-100" />
        <h4 className="scroll-m-20 py-5 text-xl font-semibold tracking-tight">
          Documents disponibles ({documents.length})
        </h4>
        <TaskDataTable data={documents} columns={columns} />
      </div>

      <div className="w-full md:w-1/3">
        <TeamConversations data={comments} taskId={task.id} />
      </div>
    </div>
  );
};

export default TaskPage;
