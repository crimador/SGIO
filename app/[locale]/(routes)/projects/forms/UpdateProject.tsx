'use client';

import { DialogTrigger } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useRouter } from 'next/navigation';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type Props = {
  initialData: any;
  openEdit: (value: boolean) => void;
};

const UpdateProjectForm = ({ initialData, openEdit }: Props) => {
  const [, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const formSchema = z.object({
    id: z.string().default(initialData.id),
    title: z.string().min(3).max(255),
    description: z.string().min(3).max(500),
    visibility: z.string().min(3).max(255),
  });

  type NewAccountFormValues = z.infer<typeof formSchema>;

  const form = useForm<NewAccountFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;

  const onSubmit = async (data: NewAccountFormValues) => {
    setIsLoading(true);
    try {
      await axios.put('/api/projects/', data);
      toast({
        title: 'Succès',
        description: `Projet "${data.title}" mis à jour avec succès.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error?.response?.data,
      });
    } finally {
      setIsLoading(false);
      setOpen(false);
      openEdit(false);
      router.refresh();
    }
  };

  return (
    <div className="flex w-full py-5">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="h-full w-full space-y-3"
        >
          <div className="flex flex-col space-y-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du projet</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} placeholder="Nom du projet" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={10} disabled={isLoading} placeholder="Description du projet" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibilité</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir la visibilité" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Privé</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
              disabled={isLoading}
              className="flex h-9 items-center rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
            >
              {isLoading ? <Icons.spinner className="animate-spin" /> : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UpdateProjectForm;
