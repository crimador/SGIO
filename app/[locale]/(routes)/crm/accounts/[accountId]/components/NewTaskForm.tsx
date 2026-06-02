'use client';

import LoadingComponent from '@/components/LoadingComponent';
import { Calendar } from '@/components/ui/calendar';

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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

import fetcher from '@/lib/fetcher';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import type { crm_Accounts } from '@prisma/client';
import axios, { AxiosError } from 'axios';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { useRouter } from 'next/navigation';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import { z } from 'zod';

interface NewTaskFormProps {
  account: crm_Accounts | null;
  onFinish: () => void;
}

const NewTaskForm = ({ account, onFinish }: NewTaskFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [date] = useState<Date>();

  const { data: users, isLoading: isLoadingUsers } = useSWR(
    '/api/user',
    fetcher
  );

  const router = useRouter();

  const { toast } = useToast();

  const formSchema = z.object({
    title: z.string().min(3).max(255),
    user: z.string().min(3).max(255),
    account: z.string().default(account?.id!),
    dueDateAt: z.date().optional(),
    priority: z.string().min(3).max(10),
    content: z.string().min(3).max(500),
  });

  type NewAccountFormValues = z.infer<typeof formSchema>;

  const form = useForm<NewAccountFormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const onSubmit = form.handleSubmit(async (data) => {
    setIsLoading(true);
    try {
      await axios.post(`/api/crm/account/${account?.id}/task/create`, data);
      toast({
        title: 'Succès',
        description: `Tâche "${data.title}" créée avec succès.`,
      });
    } catch (error) {
      if (error instanceof AxiosError && error?.response?.data) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: error?.response?.data,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: error instanceof AxiosError ? error?.message : '',
        });
      }
    } finally {
      setIsLoading(false);
      onFinish();
      router.refresh();
    }
  });

  if (isLoadingUsers) {
    return <LoadingComponent />;
  }

  return (
    <div className="flex flex-col">
      {isLoading ? (
        <LoadingComponent />
      ) : (
        <div className="flex w-full">
          <Form {...form}>
            <form onSubmit={onSubmit} className="h-full w-full space-y-3">
              <div className="flex flex-col space-y-3">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de la tâche</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          placeholder="Ex : Appel de suivi client"
                          {...field}
                        />
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
                        <Textarea
                          disabled={isLoading}
                          placeholder="Détails de la tâche..."
                          {...field}
                        />
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
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className={cn(
                                'flex h-9 w-[240px] items-center justify-start rounded-lg border px-3 text-sm font-normal transition-colors hover:bg-gray-50',
                                !date && 'text-gray-400'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Choisir une date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="user"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsable</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Assigner à..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="h-56 overflow-y-auto">
                          {users.map((user: any) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une priorité" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Basse</SelectItem>
                          <SelectItem value="medium">Normale</SelectItem>
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
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="flex h-9 items-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-red-50"
                    style={{ color: '#dc2626' }}
                  >
                    Fermer
                  </button>
                </SheetTrigger>
                <button
                  type="submit"
                  className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
                >
                  Créer
                </button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
};

export default NewTaskForm;
