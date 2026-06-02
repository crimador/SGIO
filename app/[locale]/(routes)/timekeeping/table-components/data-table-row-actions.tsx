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

import { timekeepingSchema } from '../table-data/schema';
import { useRouter } from 'next/navigation';
import AlertModal from '@/components/modals/alert-modal';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import axios, { AxiosError } from 'axios';
import RightViewModalNoTrigger from '@/components/modals/right-view-notrigger';
// import { UpdateTimekeepingForm } from '../../components/UpdateTimekeepingForm';

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
        title: 'Success',
        description: 'Timekeeping has been deleted',
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description:
            'Something went wrong while deleting timekeeping. Please try again.',
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
          'Update Timekeeping' +
          ' - ' +
          timekeeping?.employee?.firstName +
          ' ' +
          timekeeping?.employee?.lastName
        }
        description="Update timekeeping details"
        open={updateOpen}
        setOpen={setUpdateOpen}
      >
        <div className="p-4">
          <p>Update form coming soon...</p>
        </div>
      </RightViewModalNoTrigger>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-8 w-8 items-center justify-center rounded-md p-0 transition-colors hover:bg-gray-100 data-[state=open]:bg-gray-100">
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            onClick={() => router.push(`/timekeeping/${timekeeping?.id}`)}
          >
            View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setUpdateOpen(true)}>
            Update
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Delete
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
