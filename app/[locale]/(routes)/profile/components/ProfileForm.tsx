'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';

interface ProfileFormProps {
  data: any;
}

const FormSchema = z.object({
  id: z.string(),
  name: z.string().min(3).max(50),
  username: z.string().min(2).max(50),
  account_name: z.string().min(2).max(50),
});

export function ProfileForm({ data }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();

  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: data
      ? { ...data }
      : {
          name: '',
          username: '',
          account_name: '',
        },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      setIsLoading(true);
      await axios.put(`/api/user/${data.id}/updateprofile`, data);
      //TODO: send data to the server
      toast({
        title: 'Profil mis à jour avec succès.',
      });
      router.refresh();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la mise à jour du profil.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full items-end space-x-5 p-5"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="w-1/3">
              <FormLabel>Nom complet</FormLabel>
              <FormControl>
                <Input disabled={isLoading} placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="w-1/3">
              <FormLabel>Nom d&apos;utilisateur</FormLabel>
              <FormControl>
                <Input disabled={isLoading} placeholder="jdoe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="account_name"
          render={({ field }) => (
            <FormItem className="w-1/3">
              <FormLabel>Entreprise</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder="Tesla Inc.,"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="flex h-9 w-[150px] items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
        >
          Mettre à jour
        </button>
      </form>
    </Form>
  );
}
