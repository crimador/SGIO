'use client';

import type { Row } from '@tanstack/react-table';

import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { taskSchema } from '../data/schema';
import { useRouter } from 'next/navigation';
import AlertModal from '@/components/modals/alert-modal';
import { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff, Glasses, Pencil, Trash } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import UpdateProjectForm from '../forms/UpdateProject';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const router = useRouter();
  const project = taskSchema.parse(row.original);

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const onDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`/api/projects/${project.id}`);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de supprimer le projet.',
      });
      console.log(error);
    } finally {
      toast({ title: `Projet "${project.title}" supprimé.` });
      router.refresh();
      setOpen(false);
      setLoading(false);
    }
  };

  const onWatch = async () => {
    setLoading(true);
    try {
      await axios.post(`/api/projects/${project.id}/watch`);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de suivre le projet.',
      });
      console.log(error);
    } finally {
      toast({ title: `Vous suivez maintenant "${project.title}".` });
      setLoading(false);
    }
  };

  const onUnWatch = async () => {
    setLoading(true);
    try {
      await axios.post(`/api/projects/${project.id}/unwatch`);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de ne plus suivre le projet.',
      });
      console.log(error);
    } finally {
      toast({ title: `Vous ne suivez plus "${project.title}".` });
      setLoading(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <Sheet open={editOpen} onOpenChange={() => setEditOpen(false)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Modifier le projet</SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>
          <UpdateProjectForm initialData={project} openEdit={setEditOpen} />
        </SheetContent>
      </Sheet>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-[#FF7E00]/[0.08]">
            <MoreHorizontal className="h-4 w-4 text-gray-500" />
            <span className="sr-only">Menu</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[260px]">
          <DropdownMenuItem
            onClick={() => router.push(`/projects/boards/${project.id}`)}
          >
            <Glasses className="mr-2 h-4 w-4" />
            Voir le détail
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onWatch}>
            <Eye className="mr-2 h-4 w-4" />
            Suivre le projet
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onUnWatch}>
            <EyeOff className="mr-2 h-4 w-4" />
            Ne plus suivre
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
