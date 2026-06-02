'use client';

import { z } from 'zod';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/components/ui/use-toast';
import { DialogClose } from '@radix-ui/react-dialog';

type NewSectionFormProps = {
  boardId: string;
  onClose: () => void;
};

const NewSectionForm = ({ boardId, onClose }: NewSectionFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const formSchema = z.object({
    title: z.string().min(3).max(255),
  });

  type NewAccountFormValues = z.infer<typeof formSchema>;

  const form = useForm<NewAccountFormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;

  const onSubmit = async (data: NewAccountFormValues) => {
    setIsLoading(true);
    try {
      await axios.post(`/api/projects/sections/${boardId}`, data);
      toast({
        title: 'Succès',
        description: `Section "${data.title}" créée avec succès.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error?.response?.data,
      });
    } finally {
      form.reset({ title: '' });
      setIsLoading(false);
      router.refresh();
      onClose();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="h-full w-full space-y-3">
        <div className="flex flex-col space-y-3">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input disabled={isLoading} placeholder="Nom de la section" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex w-full justify-end space-x-2 pt-2">
          <DialogClose asChild>
            <button
              type="button"
              className="flex h-9 items-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-red-50"
              style={{ color: '#dc2626' }}
            >
              Annuler
            </button>
          </DialogClose>
          <button
            type="submit"
            disabled={isLoading}
            className="flex h-9 items-center rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
          >
            {isLoading ? (
              <Icons.spinner className="animate-spin" />
            ) : (
              'Créer'
            )}
          </button>
        </div>
      </form>
    </Form>
  );
};

export default NewSectionForm;
