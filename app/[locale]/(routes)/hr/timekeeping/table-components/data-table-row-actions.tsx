'use client';

import type { Row } from '@tanstack/react-table';

import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { timekeepingSchema } from '../table-data/schema';
import { useRouter } from 'next/navigation';
import AlertModal from '@/components/modals/alert-modal';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import axios, { AxiosError } from 'axios';
import RightViewModalNoTrigger from '@/components/modals/right-view-notrigger';
import { UpdateTimekeepingForm } from '../components/UpdateTimekeepingForm';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const router = useRouter();
  const timekeeping = timekeepingSchema.parse(row.original);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);

  const { toast } = useToast();

  const onDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`/api/timekeeping/${timekeeping?.id}`);
      toast({
        title: 'Succès',
        description: 'Entrée de pointage supprimée',
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la suppression.',
        });
      }
    } finally {
      setLoading(false);
      setOpen(false);
      router.refresh();
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
      <RightViewModalNoTrigger
        title={
          'Modifier pointage' +
          ' - ' +
          timekeeping?.employee?.firstName +
          ' ' +
          timekeeping?.employee?.lastName
        }
        description="Mettre à jour les informations de pointage"
        open={updateOpen}
        setOpen={setUpdateOpen}
      >
        <UpdateTimekeepingForm
          initialData={row.original}
          setOpen={setUpdateOpen}
        />
      </RightViewModalNoTrigger>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-[#FF7E00]/[0.08]">
            <MoreHorizontal className="h-4 w-4 text-gray-500" />
            <span className="sr-only">Open menu</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            onClick={() => router.push(`/timekeeping/${timekeeping?.id}`)}
          >
            Voir
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setUpdateOpen(true)}>
            Modifier
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Supprimer
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
