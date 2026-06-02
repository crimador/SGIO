'use client';

import { MoreHorizontal } from 'lucide-react';
import type { Row } from '@tanstack/react-table';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { type AxiosError } from 'axios';

import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AlertModal from '@/components/modals/alert-modal';
import RightViewModalNoTrigger from '@/components/modals/right-view-notrigger';
import { useToast } from '@/components/ui/use-toast';
import { campaignSchema } from '../table-data/schema';
import { UpdateCampaignForm } from '../components/UpdateCampaignForm';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({ row }: DataTableRowActionsProps<TData>) {
  const router = useRouter();
  const { toast } = useToast();
  const campaign = campaignSchema.parse(row.original);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const onDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`/api/crm/campaigns/${campaign.id}`);
      toast({ title: 'Supprimée', description: 'Campagne supprimée avec succès.' });
      router.refresh();
    } catch (e) {
      const err = e as AxiosError;
      toast({ variant: 'destructive', title: 'Erreur', description: String(err.response?.data ?? 'Erreur inconnue') });
    } finally {
      setLoading(false);
      setDeleteOpen(false);
    }
  };

  return (
    <>
      <AlertModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={onDelete} loading={loading} />
      <RightViewModalNoTrigger
        title={`Modifier — ${campaign.name}`}
        description="Modifier les informations de la campagne"
        open={editOpen}
        setOpen={setEditOpen}
      >
        <UpdateCampaignForm initialData={row.original} setOpen={setEditOpen} />
      </RightViewModalNoTrigger>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-[#FF7E00]/[0.08]">
            <MoreHorizontal className="h-4 w-4 text-gray-500" />
            <span className="sr-only">Menu</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => router.push(`/crm/campaigns/${campaign.id}`)}>
            Voir
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            Modifier
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
            Supprimer
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
