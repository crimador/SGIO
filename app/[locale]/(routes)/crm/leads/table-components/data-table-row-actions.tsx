'use client';

import { MoreHorizontal } from 'lucide-react';
import type { Row } from '@tanstack/react-table';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { leadSchema } from '../table-data/schema';
import { useRouter } from 'next/navigation';
import AlertModal from '@/components/modals/alert-modal';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import axios, { AxiosError } from 'axios';
import { UpdateLeadForm } from '../components/UpdateLeadForm';
import { ConvertLeadForm } from '../components/ConvertLeadForm';
import RightViewModalNoTrigger from '@/components/modals/right-view-notrigger';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const router = useRouter();
  const lead = leadSchema.parse(row.original);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);

  const { toast } = useToast();

  const onDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`/api/crm/leads/${lead?.id}`);
      toast({
        title: 'Succès',
        description: 'Le prospect a été supprimé.',
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description:
            'Une erreur est survenue lors de la suppression. Veuillez réessayer.',
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
        title={'Modifier le prospect' + ' - ' + lead?.firstName + ' ' + lead?.lastName}
        description="Modifier les informations du prospect"
        open={updateOpen}
        setOpen={setUpdateOpen}
      >
        <UpdateLeadForm initialData={row.original} setOpen={setUpdateOpen} />
      </RightViewModalNoTrigger>
      <RightViewModalNoTrigger
        title={'Convertir - ' + (lead?.firstName ?? '') + ' ' + lead?.lastName}
        description="Créez automatiquement un compte, un contact et une opportunité à partir de ce prospect."
        open={convertOpen}
        setOpen={setConvertOpen}
      >
        <ConvertLeadForm lead={row.original} setOpen={setConvertOpen} />
      </RightViewModalNoTrigger>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-[#FF7E00]/[0.08]">
            <MoreHorizontal className="h-4 w-4 text-gray-500" />
            <span className="sr-only">Ouvrir le menu</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuItem
            onClick={() => router.push(`/crm/leads/${lead?.id}`)}
          >
            Voir
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setUpdateOpen(true)}>
            Modifier
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setConvertOpen(true)}
            className="font-medium text-green-600 focus:text-green-600"
          >
            Convertir en client
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
