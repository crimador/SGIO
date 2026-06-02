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
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import LoadingComponent from '@/components/LoadingComponent';

type Props = { boardId: string };

const NewSectionDialog = ({ boardId }: Props) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const formSchema = z.object({ title: z.string().min(3).max(255) });
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await axios.post(`/api/projects/sections/${boardId}`, data);
      toast({ title: 'Section créée', description: `La section "${data.title}" a été créée avec succès.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: error?.response?.data });
    } finally {
      form.reset({ title: '' });
      setIsLoading(false);
      setOpen(false);
      router.refresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
        >
          Nouvelle section
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="p-2">Nouvelle section</DialogTitle>
          <DialogDescription className="p-2">
            Remplissez le formulaire ci-dessous pour ajouter une section à ce projet.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <LoadingComponent />
        ) : (
          <div className="flex w-full">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="h-full w-full space-y-3">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de la section</FormLabel>
                      <FormControl>
                        <Input disabled={isLoading} placeholder="Saisir le nom de la section" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex w-full justify-end space-x-2 pt-2">
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="flex h-9 items-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-red-50"
                      style={{ color: '#dc2626' }}
                    >
                      Annuler
                    </button>
                  </DialogTrigger>
                  <button
                    type="submit"
                    className="flex h-9 items-center rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
                  >
                    Créer
                  </button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewSectionDialog;
