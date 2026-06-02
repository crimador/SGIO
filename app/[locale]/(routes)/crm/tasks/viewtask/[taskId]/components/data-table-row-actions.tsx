'use client';

import { MoreHorizontal } from 'lucide-react';
import type { Row } from '@tanstack/react-table';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useParams } from 'next/navigation';

import { taskSchema } from '../data/schema';
import { useRouter } from 'next/navigation';
import DocumentViewModal from '@/components/modals/document-view-modal';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const document = taskSchema.parse(row.original);

  const router = useRouter();
  const params = useParams();

  const { toast } = useToast();

  const onAssign = async () => {
    setLoading(true);
    try {
      await axios.post(`/api/projects/tasks/${document.id}/assign`, {
        taskId: params?.taskId!,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erreur',
        description: "Une erreur est survenue lors de l'association du document.",
      });
    } finally {
      toast({
        title: 'Succès',
        description: 'Document associé à la tâche.',
      });
      router.refresh();
      setLoading(false);
    }
  };

  return (
    <>
      <DocumentViewModal
        isOpen={open}
        onClose={() => setOpen(false)}
        loading={loading}
        document={document}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-[#FF7E00]/[0.08]">
            <MoreHorizontal className="h-4 w-4 text-gray-500" />
            <span className="sr-only">Ouvrir le menu</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={onAssign}>
            Associer à la tâche
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Voir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
