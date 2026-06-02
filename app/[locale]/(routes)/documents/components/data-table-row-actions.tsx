'use client';

import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import type { Row } from '@tanstack/react-table';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { taskSchema } from '../data/schema';
import { useRouter } from 'next/navigation';
import DocumentViewModal from '@/components/modals/document-view-modal';
import { useState } from 'react';
import AlertModal from '@/components/modals/alert-modal';
import { useToast } from '@/components/ui/use-toast';
import axios, { AxiosError } from 'axios';
import { AssociateAccountModal } from './AssociateAccountModal';
import { EditMetadataModal } from './EditMetadataModal';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const [open, setOpen] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openAssociate, setOpenAssociate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const document = taskSchema.parse(row.original);

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/documents/${document.id}`);
      router.refresh();
      toast({
        title: 'Succès',
        description: 'Le document a été supprimé.',
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description:
            'Une erreur est survenue lors de la suppression du document. Veuillez réessayer.',
        });
      }
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      {openView && (
        <DocumentViewModal
          isOpen={openView}
          onClose={() => setOpenView(false)}
          loading={loading}
          document={document}
        />
      )}
      {open && (
        <AlertModal
          isOpen={open}
          onClose={() => setOpen(false)}
          onConfirm={onDelete}
          loading={loading}
        />
      )}
      {openAssociate && (
        <AssociateAccountModal
          isOpen={openAssociate}
          onClose={() => setOpenAssociate(false)}
          documentId={document.id}
          documentName={document.document_name}
          linkedAccounts={document.accounts ?? []}
        />
      )}
      {openEdit && (
        <EditMetadataModal
          isOpen={openEdit}
          onClose={() => setOpenEdit(false)}
          documentId={document.id}
          initialName={document.document_name}
          initialType={document.document_system_type}
          initialDescription={(row.original as any).description}
        />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md p-0 transition-colors hover:bg-gray-100 data-[state=open]:bg-gray-100"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Ouvrir le menu</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[210px]">
          <DropdownMenuItem onClick={() => setOpenView(true)}>
            Voir le document
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            Modifier les informations
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenAssociate(true)}>
            Associer à un compte CRM
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            Supprimer
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
