'use client';

import { useRouter } from 'next/navigation';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

import type { crm_Accounts } from '@prisma/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import { columns } from '../tasks-data-table/components/columns';
import { TasksDataTable } from '../tasks-data-table/components/data-table';
import NewTaskForm from './NewTaskForm';

interface TasksViewProps {
  data: any;
  account: crm_Accounts | null;
}

const AccountsTasksView: FC<TasksViewProps> = ({ data, account }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;

  return (
    <Card className="overflow-hidden">
      <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
      <CardHeader className="pb-4 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <button
              className="text-base font-bold hover:underline"
              style={{ color: '#1E1D3D' }}
              onClick={() => router.push('/projects/tasks')}
            >
              Tâches
            </button>
            <p className="mt-0.5 text-xs text-gray-400">
              {data?.length ?? 0} tâche{(data?.length ?? 0) > 1 ? 's' : ''}
            </p>
          </div>
          <Sheet open={open} onOpenChange={() => setOpen(false)}>
            <button
              onClick={() => setOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
            >
              <Plus className="h-4 w-4" /> Nouvelle
            </button>
            <SheetContent className="min-w-[500px] space-y-2">
              <SheetHeader>
                <SheetTitle>Créer une tâche</SheetTitle>
              </SheetHeader>
              <div className="h-full overflow-y-auto">
                <NewTaskForm account={account} onFinish={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {!data || data.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">Aucune tâche assignée pour ce client.</p>
        ) : (
          <TasksDataTable data={data} columns={columns} />
        )}
      </CardContent>
    </Card>
  );
};

export default AccountsTasksView;
