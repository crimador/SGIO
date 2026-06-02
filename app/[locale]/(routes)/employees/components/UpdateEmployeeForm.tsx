'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';

import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Textarea } from '@/components/ui/textarea';

import fetcher from '@/lib/fetcher';
import useSWR from 'swr';
import SuspenseLoading from '@/components/loadings/suspense';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from '@radix-ui/react-icons';
import { Calendar } from '@/components/ui/calendar';

type NewEmployeeFormProps = {
  initialData: any;
  setOpen: (value: boolean) => void;
};

export function UpdateEmployeeForm({
  initialData,
  setOpen,
}: NewEmployeeFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { data: users, isLoading: isLoadingUsers } = useSWR(
    '/api/user',
    fetcher
  );

  const formSchema = z.object({
    id: z.string(),
    firstName: z.string().min(3).max(50),
    lastName: z.string().min(3).max(50),
    email: z.string().email(),
    phone: z.string().optional(),
    position: z.string().optional(),
    IBAN: z.string().min(3).max(50),
    taxid: z.string().min(2).max(30).optional(),
    address: z.string().min(3).max(250).optional(),
    onBoarding: z.date().default(new Date()).optional(),
    dateOfBirth: z.date().optional(),
    insurance: z.string().min(3).max(50).optional(),
    salary: z.coerce.number().positive(),
  });

  type NewEmployeeFormValues = z.infer<typeof formSchema>;

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: NewEmployeeFormValues) => {
    setIsLoading(true);
    try {
      await axios.put('/api/employee', data);
      toast({
        title: 'Succès',
        description: 'Employé mis à jour avec succès.',
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: error?.response?.data,
        });
      }
    } finally {
      setIsLoading(false);
      router.refresh();
      setOpen(false);
    }
  };

  if (isLoadingUsers)
    return (
      <div>
        <SuspenseLoading />
      </div>
    );

  if (!users || !initialData)
    return <div>Impossible de charger les données du formulaire.</div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="h-full px-10">
        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder="Matt"
                  type="hidden"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="w-[800px] text-sm">
          <div className="space-y-2 pb-5">
            <div className="flex gap-5 pb-5">
              <div className="w-1/2 space-y-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input disabled={isLoading} placeholder="Koffi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-1/2 space-y-2">
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input disabled={isLoading} placeholder="Mensah" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="flex gap-5 pb-5">
              <div className="w-1/2 space-y-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input disabled={isLoading} placeholder="+228 90 00 00 00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-1/2 space-y-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input disabled={isLoading} placeholder="account@domain.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="flex gap-5 pb-5">
              <div className="w-1/2 space-y-2">
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Poste</FormLabel>
                      <FormControl>
                        <Input disabled={isLoading} placeholder="Comptable" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-1/2 space-y-2">
                <FormField
                  control={form.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salaire (FCFA)</FormLabel>
                      <FormControl>
                        <Input disabled={isLoading} placeholder="150000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-5 pb-5">
            <div className="w-1/2 space-y-2">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de naissance</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <button
                            type="button"
                            className={cn(
                              'flex h-9 w-full items-center rounded-lg border px-3 text-sm font-normal transition-colors hover:bg-gray-50',
                              !field.value && 'text-gray-400'
                            )}
                          >
                            {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'JJ/MM/AAAA'}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={field.onChange}
                          captionLayout="dropdown"
                          fromYear={1950}
                          toYear={new Date().getFullYear() - 18}
                          disabled={(date) => date > new Date() || date < new Date('1950-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="w-1/2 space-y-2">
              <FormField
                control={form.control}
                name="onBoarding"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date d'embauche</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <button
                            type="button"
                            className={cn(
                              'flex h-9 w-full items-center rounded-lg border px-3 text-sm font-normal transition-colors hover:bg-gray-50',
                              !field.value && 'text-gray-400'
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), 'dd/MM/yyyy')
                            ) : (
                              <span>JJ/MM/AAAA</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date('1900-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="flex gap-5 pb-5">
            <div className="w-1/2 space-y-2">
              <FormField
                control={form.control}
                name="IBAN"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IBAN</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} placeholder="TG53 TG008..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="flex gap-5 pb-5">
            <div className="w-1/2 space-y-2">
              <FormField
                control={form.control}
                name="taxid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIF</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} placeholder="NIF personnel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="w-1/2 space-y-2">
              <FormField
                control={form.control}
                name="insurance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>N° CNSS</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} placeholder="N° immatriculation CNSS" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="flex gap-5 pb-5">
            <div className="w-full space-y-2">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Textarea disabled={isLoading} placeholder="Adresse de résidence..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        <div className="grid gap-2 py-5">
          <button
            type="submit"
            disabled={isLoading}
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
          >
            {isLoading ? (
              <span className="flex animate-pulse items-center">Enregistrement...</span>
            ) : (
              'Mettre à jour'
            )}
          </button>
        </div>
      </form>
    </Form>
  );
}
