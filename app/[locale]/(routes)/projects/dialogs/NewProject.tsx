'use client';

import LoadingComponent from '@/components/LoadingComponent';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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

const NewProjectDialog = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const formSchema = z.object({
    title:      z.string().min(3).max(255),
    description: z.string().min(3).max(500),
    visibility: z.string().min(3).max(255),
  });

  type NewProjectFormValues = z.infer<typeof formSchema>;

  const form = useForm<NewProjectFormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;

  const onSubmit = async (data: NewProjectFormValues) => {
    setIsLoading(true);
    try {
      await axios.post('/api/projects/', data);
      toast({ title: 'Projet créé', description: `Le projet "${data.title}" a été créé avec succès.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: error?.response?.data });
    } finally {
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
          Nouveau projet
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="p-2">Nouveau projet</DialogTitle>
          <DialogDescription className="p-2">
            Remplissez le formulaire ci-dessous pour créer un nouveau projet.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <LoadingComponent />
        ) : (
          <div className="flex w-full">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="h-full w-full space-y-3">
                <div className="flex flex-col space-y-3">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du projet</FormLabel>
                        <FormControl>
                          <Input disabled={isLoading} placeholder="Saisir le nom du projet" {...field} />
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
                          <Textarea disabled={isLoading} placeholder="Décrire le projet" {...field} />
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

export default NewProjectDialog;
