'use client';

import { CheckCircle2, Send, Download, Trash2 } from 'lucide-react';
import type { Row } from '@tanstack/react-table';

import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { payslipSchema } from '../table-data/schema';
import { useRouter } from 'next/navigation';
import AlertModal from '@/components/modals/alert-modal';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import axios, { AxiosError } from 'axios';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({ row }: DataTableRowActionsProps<TData>) {
  const router = useRouter();
  const { toast } = useToast();
  const payslip = payslipSchema.parse(row.original);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const changeStatus = async (status: string) => {
    try {
      await axios.put(`/api/payslip/${payslip.id}`, { status });
      toast({ title: `Statut mis à jour : ${status}` });
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
      await axios.delete(`/api/payslip/${payslip.id}`);
      toast({ title: 'Bulletin supprimé' });
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
          {payslip.status === 'BROUILLON' && (
            <DropdownMenuItem onClick={() => changeStatus('EMIS')}>
              <Send className="mr-2 h-4 w-4" />
              Émettre
            </DropdownMenuItem>
          )}
          {payslip.status === 'EMIS' && (
            <DropdownMenuItem onClick={() => changeStatus('PAYE')}>
              <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
              Marquer payé
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <a href={`/api/payslip/${payslip.id}/pdf`} download>
              <Download className="mr-2 h-4 w-4" />
              Télécharger PDF
            </a>
          </DropdownMenuItem>
          {payslip.status !== 'PAYE' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setOpen(true)} className="text-red-600">
                Supprimer
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
