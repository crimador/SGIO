import React from 'react';
import moment from 'moment';

import { getDocuments } from '@/actions/documents/get-documents';
import { getTaskComments } from '@/actions/projects/get-task-comments';
import { getTaskDocuments } from '@/actions/projects/get-task-documents';

import { TeamConversations } from './components/team-conversation';
import { TaskDataTable } from './components/data-table';
import { columns } from './components/columns';
import { columnsTask } from './components/columns-task';
import { getCrMTask } from '@/actions/crm/account/get-task';

const PRIORITY_CLASSES: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-orange-100 text-orange-700',
  low: 'bg-green-100 text-green-700',
};

type TaskPageProps = {
  params: {
    taskId: string;
  };
};

const CRMTaskPage = async ({ params }: TaskPageProps) => {
  const { taskId } = params;
  const task: any = await getCrMTask(taskId);
  const taskDocuments: any = await getTaskDocuments(taskId);
  const documents: any = await getDocuments();
  const comments: any = await getTaskComments(taskId);

  return (
    <div className="flex w-full flex-col space-x-2 px-2 md:flex-row">
      <div className="flex w-full flex-col md:w-2/3">
        <h4 className="scroll-m-20 py-5 text-xl font-semibold tracking-tight">
          Détails de la tâche
        </h4>
        <div className="mb-5 w-full rounded-lg border">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="border-b px-4 py-2 font-semibold">
                  <span className="flex justify-start">Propriété</span>
                </th>
                <th className="border-b px-4 py-2 font-semibold">
                  <span className="flex justify-start">Valeur</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-b px-4 py-2">ID</td>
                <td className="border-b px-4 py-2">{task.id}</td>
              </tr>
              <tr>
                <td className="border-b px-4 py-2">Date de création</td>
                <td className="border-b px-4 py-2">
                  {moment(task.createdAt).format('YYYY-MM-DD')}
                </td>
              </tr>
              <tr>
                <td className="border-b px-4 py-2">Date d&apos;échéance</td>
                <td className="border-b px-4 py-2">
                  {moment(task.dueDateAt).format('YYYY-MM-DD')}
                </td>
              </tr>
              <tr>
                <td className="border-b px-4 py-2">Dernière modification</td>
                <td className="border-b px-4 py-2">
                  {moment(task.lastEditedAt).format('YYYY-MM-DD')}
                </td>
              </tr>
              <tr>
                <td className="border-b px-4 py-2">Priorité</td>
                <td className="border-b px-4 py-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_CLASSES[task.priority] ?? 'bg-gray-100 text-gray-700'}`}
                  >
                    {task.priority}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="border-b px-4 py-2">Titre</td>
                <td className="border-b px-4 py-2">{task.title}</td>
              </tr>
              <tr>
                <td className="border-b px-4 py-2">Contenu</td>
                <td className="border-b px-4 py-2">{task.content}</td>
              </tr>
              <tr>
                <td className="border-b px-4 py-2">Assigné à</td>
                <td className="border-b px-4 py-2">
                  {task.assigned_user?.name || 'Non assigné'}
                </td>
              </tr>
            </tbody>
          </table>
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

export default CRMTaskPage;
