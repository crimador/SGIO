'use client';

import type { Row } from '@tanstack/react-table';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { adminUserSchema } from '../table-data/schema';
import { useRouter } from 'next/navigation';
import AlertModal from '@/components/modals/alert-modal';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import axios, { AxiosError } from 'axios';

import { Copy, Edit, MoreHorizontal, Trash, ShieldCheck } from 'lucide-react';
import { ROLE_LABELS } from '@/lib/permissions';
import type { UserRole } from '@/lib/permissions';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const router = useRouter();
  const data = adminUserSchema.parse(row.original);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({ title: 'Copié', description: 'ID copié dans le presse-papiers.' });
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/user/${data.id}`);
      router.refresh();
      toast({ title: 'Supprimé', description: 'L\'utilisateur a été supprimé.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer l\'utilisateur.' });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const onActivate = async () => {
    try {
      setLoading(true);
      await axios.post(`/api/user/activate/${data.id}`);
      router.refresh();
      toast({ title: 'Compte activé', description: 'L\'utilisateur peut maintenant se connecter.' });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d\'activer le compte.' });
      }
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const onDeactivate = async () => {
    try {
      setLoading(true);
      await axios.post(`/api/user/deactivate/${data.id}`);
      router.refresh();
      toast({ title: 'Compte désactivé', description: 'L\'utilisateur ne peut plus se connecter.' });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de désactiver le compte.' });
      }
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const onDeactivateAdmin = async () => {
    try {
      setLoading(true);
      await axios.post(`/api/user/deactivateAdmin/${data.id}`);
      router.refresh();
      toast({ title: 'Droits admin retirés', description: 'Les droits administrateur ont été retirés.' });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de retirer les droits admin.' });
      }
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const onSetRole = async (role: UserRole) => {
    try {
      setLoading(true);
      await axios.patch(`/api/user/${data.id}/set-role`, { role });
      router.refresh();
      toast({ title: 'Rôle mis à jour', description: `Rôle : ${ROLE_LABELS[role]}` });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de changer le rôle.' });
    } finally {
      setLoading(false);
    }
  };

  const onActivateAdmin = async () => {
    try {
      setLoading(true);
      await axios.post(`/api/user/activateAdmin/${data.id}`);
      router.refresh();
      toast({ title: 'Droits admin accordés', description: 'Les droits administrateur ont été activés.' });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d\'accorder les droits admin.' });
      }
    } finally {
      setLoading(false);
      setOpen(false);
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-[#FF7E00]/[0.08]">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4 text-gray-500" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data?.id)}>
            <Copy className="mr-2 h-4 w-4" />
            Copier l&apos;ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onActivate()}>
            <Edit className="mr-2 h-4 w-4" />
            Activer le compte
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDeactivate()}>
            <Edit className="mr-2 h-4 w-4" />
            Désactiver le compte
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onActivateAdmin()}>
            <Edit className="mr-2 h-4 w-4" />
            Donner les droits admin
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDeactivateAdmin()}>
            <Edit className="mr-2 h-4 w-4" />
            Retirer les droits admin
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
            <DropdownMenuItem key={role} onClick={() => onSetRole(role)}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Rôle : {ROLE_LABELS[role]}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(true)} className="text-destructive focus:text-destructive">
            <Trash className="mr-2 h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
