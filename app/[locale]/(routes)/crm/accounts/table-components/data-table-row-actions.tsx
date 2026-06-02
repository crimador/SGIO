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

import { accountSchema } from '../table-data/schema';
import { useRouter } from 'next/navigation';
import AlertModal from '@/components/modals/alert-modal';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import axios, { AxiosError } from 'axios';
import RightViewModalNoTrigger from '@/components/modals/right-view-notrigger';
import { UpdateAccountForm } from '../components/UpdateAccountForm';
import { Eye, EyeOff } from 'lucide-react';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const router = useRouter();
  const account = accountSchema.parse(row.original);

  const [open, setOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const onDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`/api/crm/account/${account.id}`);
      toast({
        title: 'Succès',
        description: 'Le client a été supprimé.',
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

  const onWatch = async () => {
    setLoading(true);
    try {
      await axios.post(`/api/crm/account/${account.id}/watch`);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur — abonnement non enregistré. Veuillez réessayer.',
      });
      console.log(error);
    } finally {
      toast({
        title: 'Succès',
        description: `Vous suivez maintenant le client : ${account.name}.`,
      });
      setLoading(false);
    }
  };

  const onUnWatch = async () => {
    setLoading(true);
    try {
      await axios.post(`/api/crm/account/${account.id}/unwatch`);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur — abonnement non enregistré. Veuillez réessayer.',
      });
      console.log(error);
    } finally {
      toast({
        title: 'Succès',
        description: `Vous ne suivez plus le client : ${account.name}.`,
      });
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
      <RightViewModalNoTrigger
        title={'Modifier le client' + ' - ' + account?.name}
        description="Modifier les informations du client"
        open={updateOpen}
        setOpen={setUpdateOpen}
      >
        <UpdateAccountForm initialData={row.original} open={setUpdateOpen} />
      </RightViewModalNoTrigger>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-[#FF7E00]/[0.08]">
            <MoreHorizontal className="h-4 w-4 text-gray-500" />
            <span className="sr-only">Ouvrir le menu</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[260px]">
          <DropdownMenuItem
            onClick={() => router.push(`/crm/accounts/${account?.id}`)}
          >
            Voir
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setUpdateOpen(true)}>
            Modifier
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onWatch}>
            <Eye className="mr-2 h-4 w-4" />
            Suivre
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onUnWatch}>
            <EyeOff className="mr-2 h-4 w-4" />
            Ne plus suivre
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
