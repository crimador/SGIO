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

//TODO: fix all the types
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
    insurance: z.string().min(3).max(50).optional(),
    salary: z.coerce.number().positive(),
  });

  type NewEmployeeFormValues = z.infer<typeof formSchema>;

  //TODO: fix this any
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
    return <div>Erreur : données du formulaire introuvables.</div>;

  //console.log(accounts, "accounts");
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="h-full px-10">
        {/*    <div>
          <pre>
            <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
          </pre>
        </div> */}
        {/*     <pre>
          <code>{JSON.stringify(initialData, null, 2)}</code>
        </pre> */}
        {/*   <div>
          <pre>
            <code>{JSON.stringify(form.watch(), null, 2)}</code>
          </pre>
        </div> */}
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
                        <Input
                          disabled={isLoading}
                          placeholder="Matt"
                          {...field}
                        />
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
                        <Input
                          disabled={isLoading}
                          placeholder="Parker"
                          {...field}
                        />
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
                        <Input
                          disabled={isLoading}
                          placeholder="+420 ...."
                          {...field}
                        />
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
                        <Input
                          disabled={isLoading}
                          placeholder="account@domain.com"
                          {...field}
                        />
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
                        <Input
                          disabled={isLoading}
                          placeholder="Développeur"
                          {...field}
                        />
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
                      <FormLabel>Salaire</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          placeholder="3500"
                          {...field}
                        />
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
                name="IBAN"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IBAN</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Saisir IBAN"
                        {...field}
                      />
                    </FormControl>
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
                    <FormLabel>Date d&apos;embauche</FormLabel>
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
                            {field.value ? (
                              format(field?.value, 'PPP')
                            ) : (
                              <span>Choisir une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          //@ts-ignore
                          //TODO: fix this
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
                name="taxid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro fiscal</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Numéro fiscal"
                        {...field}
                      />
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
                    <FormLabel>Assurance</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Détails assurance"
                        {...field}
                      />
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
                      <Textarea
                        disabled={isLoading}
                        placeholder="Adresse..."
                        {...field}
                      />
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
            disabled={isLoading}
            type="submit"
            className="flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
          >
            {isLoading ? (
              <span className="animate-pulse">Enregistrement...</span>
            ) : (
              'Mettre à jour'
            )}
          </button>
        </div>
      </form>
    </Form>
  );
}
