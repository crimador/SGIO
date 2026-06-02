'use client';

import LoadingComponent from '@/components/LoadingComponent';
import { Calendar } from '@/components/ui/calendar';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type Props = { users: any; boardId: string; sections: any };

const NewTaskInProjectDialog = ({ users, boardId, sections }: Props) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const formSchema = z.object({
    title:    z.string().min(3).max(255),
    user:     z.string().min(3).max(255),
    dueDateAt: z.date().default(new Date()),
    priority: z.string().min(3).max(10),
    section:  z.string().min(3).max(255),
    content:  z.string().min(3).max(500),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await axios.post(`/api/projects/tasks/create-task/${boardId}`, data);
      toast({ title: 'Tâche créée', description: `La tâche "${data.title}" a été créée avec succès.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: error?.response?.data });
    } finally {
      setIsLoading(false);
      setOpen(false);
      form.reset({ title: '', content: '', user: '', priority: '', section: '' });
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
          Nouvelle tâche
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="p-2">Nouvelle tâche</DialogTitle>
          <DialogDescription className="p-2">
            Remplissez le formulaire ci-dessous pour créer une nouvelle tâche dans ce projet.
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
                        <FormLabel>Nom de la tâche</FormLabel>
                        <FormControl>
                          <Input disabled={isLoading} placeholder="Saisir le nom de la tâche" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea disabled={isLoading} placeholder="Décrire la tâche" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDateAt"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date d&apos;échéance</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <button
                                type="button"
                                className={cn(
                                  'flex w-[240px] items-center rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-[#FF7E00]/[0.06]',
                                  !field.value && 'text-gray-400'
                                )}
                              >
                                {field.value ? format(field.value, 'PPP', { locale: fr }) : <span>Choisir une date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              //@ts-ignore
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date('1900-01-01')}
                              initialFocus
                              locale={fr}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="user"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigné à</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un utilisateur" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users.map((user: any) => (
                              <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="section"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une section" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sections.map((section: any) => (
                              <SelectItem key={section.id} value={section.id}>{section.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priorité</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choisir la priorité" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Faible</SelectItem>
                            <SelectItem value="medium">Moyenne</SelectItem>
                            <SelectItem value="high">Haute</SelectItem>
                            <SelectItem value="critical">Critique</SelectItem>
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

export default NewTaskInProjectDialog;
