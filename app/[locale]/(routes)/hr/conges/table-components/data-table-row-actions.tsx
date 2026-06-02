'use client';

import { CheckCircle2, XCircle, LogIn, Download, Trash2 } from 'lucide-react';
import type { Row } from '@tanstack/react-table';

import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { requestSchema } from '../table-data/schema';
import { useRouter } from 'next/navigation';
import AlertModal from '@/components/modals/alert-modal';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import axios, { AxiosError } from 'axios';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  canApprove: boolean;
}

export function DataTableRowActions<TData>({ row, canApprove }: DataTableRowActionsProps<TData>) {
  const router = useRouter();
  const { toast } = useToast();
  const req = requestSchema.parse(row.original);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const changeStatus = async (status: string) => {
    try {
      await axios.put(`/api/requests/${req.id}`, { status });
      toast({ title: status === 'APPROUVE' ? 'Demande approuvée' : 'Demande rejetée' });
      router.refresh();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({ variant: 'destructive', title: 'Erreur lors de la mise à jour' });
      }
    }
  };

  const onDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`/api/requests/${req.id}`);
      toast({ title: 'Demande supprimée' });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({ variant: 'destructive', title: 'Erreur lors de la suppression' });
      }
    } finally {
      setLoading(false);
      setOpen(false);
      router.refresh();
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const LEAVE_TYPES = ['Vacation', 'Leave', 'Sick', 'Maternity', 'Training'];
  const isPendingReturn =
    LEAVE_TYPES.includes(req.type) &&
    req.status === 'APPROUVE' &&
    req.endDate &&
    new Date(req.endDate) < today &&
    !req.returnedAt;

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
            <MoreHorizontal className="h-4 w-4 text-gray-500" />
            <span className="sr-only">Menu</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          {canApprove && req.status === 'EN_ATTENTE' && (
            <>
              <DropdownMenuItem onClick={() => changeStatus('APPROUVE')}>
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                Approuver
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeStatus('REJETE')}>
                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                Rejeter
              </DropdownMenuItem>
            </>
          )}
          {isPendingReturn && (
            <DropdownMenuItem onClick={() => router.push(`/hr/conges`)}>
              <LogIn className="mr-2 h-4 w-4 text-orange-500" />
              Confirmer retour
            </DropdownMenuItem>
          )}
          {req.type === 'Documents' && req.status === 'APPROUVE' && (
            <DropdownMenuItem asChild>
              <a href={`/api/requests/${req.id}/document`} download>
                <Download className="mr-2 h-4 w-4" />
                Télécharger
              </a>
            </DropdownMenuItem>
          )}
          {canApprove && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setOpen(true)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
