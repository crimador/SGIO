'use client';

import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, PowerIcon, PowerOffIcon } from 'lucide-react';

import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { ModuleColumn } from './Columns';

interface CellActionProps {
  data: ModuleColumn;
}

export const CellAction = ({ data }: CellActionProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const onActivate = async () => {
    try {
      await axios.post(`/api/admin/activateModule/${data.id}`);
      router.refresh();
      toast({ title: 'Module activé', description: `Le module "${data.name}" est maintenant actif.` });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d\'activer le module.' });
      }
    }
  };

  const onDeactivate = async () => {
    try {
      await axios.post(`/api/admin/deactivateModule/${data.id}`);
      router.refresh();
      toast({ title: 'Module désactivé', description: `Le module "${data.name}" a été désactivé.` });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de désactiver le module.' });
      }
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-[#FF7E00]/[0.08]">
            <span className="sr-only">Ouvrir le menu</span>
            <MoreHorizontal className="h-4 w-4 text-gray-500" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onActivate()}>
            <PowerIcon className="mr-2 h-4 w-4" />
            Activer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDeactivate()}>
            <PowerOffIcon className="mr-2 h-4 w-4" />
            Désactiver
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
