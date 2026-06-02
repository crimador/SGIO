'use client';

import { useRouter } from 'next/navigation';

import { useToast } from '@/components/ui/use-toast';
import { getTaskDone } from '@/app/[locale]/(routes)/projects/actions/get-task-done';
import { CheckSquare, Paperclip, Pencil } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import UpdateTaskDialog from '@/app/[locale]/(routes)/projects/dialogs/UpdateTask';
import { useState } from 'react';
import { Icons } from '@/components/ui/icons';
import { LinkDocumentDialog } from './LinkDocumentDialog';

interface Doc {
  id: string;
  document_name: string;
  document_system_type?: string | null;
}

const TaskViewActions = ({
  taskId,
  users,
  boards,
  initialData,
  allDocuments = [],
  linkedDocuments = [],
}: {
  taskId: string;
  users: any;
  boards: any;
  initialData: any;
  allDocuments?: Doc[];
  linkedDocuments?: Doc[];
}) => {
  const { toast } = useToast();
  const router = useRouter();

  const [openEdit, setOpenEdit] = useState(false);
  const [openDocuments, setOpenDocuments] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onDone = async () => {
    setIsLoading(true);
    try {
      await getTaskDone(taskId);
      toast({ title: 'Tâche terminée.' });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de marquer la tâche comme terminée.',
        });
      }
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  return (
    <div className="space-y-3 pb-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Actions</p>
      <div className="h-px bg-gray-100" />
      <div className="flex flex-wrap gap-2">
        {initialData.taskStatus !== 'COMPLETE' && (
          <button
            onClick={onDone}
            disabled={isLoading}
            className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors hover:bg-[#FF7E00]/[0.06] disabled:opacity-50"
            style={{ color: '#1E1D3D' }}
          >
            {isLoading ? (
              <Icons.spinner className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckSquare className="mr-2 h-3.5 w-3.5" />
            )}
            Marquer terminée
          </button>
        )}

        <button
          onClick={() => setOpenEdit(true)}
          className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors hover:bg-[#FF7E00]/[0.06]"
          style={{ color: '#1E1D3D' }}
        >
          <Pencil className="mr-2 h-3.5 w-3.5" />
          Modifier
        </button>

        <button
          onClick={() => setOpenDocuments(true)}
          className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors hover:bg-[#FF7E00]/[0.06]"
          style={{ color: '#1E1D3D' }}
        >
          <Paperclip className="mr-2 h-3.5 w-3.5" />
          Lier un document
          {linkedDocuments.length > 0 && (
            <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: '#FF7E00' }}>
              {linkedDocuments.length}
            </span>
          )}
        </button>
      </div>

      <Sheet open={openEdit} onOpenChange={() => setOpenEdit(false)}>
        <SheetContent>
          <UpdateTaskDialog
            users={users}
            boards={boards}
            initialData={initialData}
            onDone={() => setOpenEdit(false)}
          />
          <div className="flex w-full justify-end pt-2">
            <button
              onClick={() => setOpenEdit(false)}
              className="flex h-9 items-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-red-50"
              style={{ color: '#dc2626' }}
            >
              Fermer
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <LinkDocumentDialog
        isOpen={openDocuments}
        onClose={() => setOpenDocuments(false)}
        taskId={taskId}
        allDocuments={allDocuments}
        linkedDocuments={linkedDocuments}
      />
    </div>
  );
};

export default TaskViewActions;
