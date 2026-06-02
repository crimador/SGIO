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
import axios from 'axios';
import { useRouter } from 'next/navigation';

const FormSchema = z.object({
  password: z.string().min(5).max(50),
  cpassword: z.string().min(5).max(50),
});

export function PasswordChangeForm({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();

  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      setIsLoading(true);
      await axios.put(`/api/user/${userId}/setnewpass`, data);
      //TODO: send data to the server
      toast({
        title: 'Mot de passe modifié avec succès.',
      });
      router.refresh();
    } catch (error: any) {
      console.log(error.response.data);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description:
          'Une erreur est survenue lors du changement de mot de passe : ' +
          error.response.data,
      });
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
          name="password"
          render={({ field }) => (
            <FormItem className="w-1/3">
              <FormLabel>Nouveau mot de passe</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  type="password"
                  placeholder="Y0ourSup3rS3cr3tP@ssW0rd"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cpassword"
          render={({ field }) => (
            <FormItem className="w-1/3">
              <FormLabel>Confirmer le mot de passe</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  type="password"
                  placeholder="Y0ourSup3rS3cr3tP@ssW0rd"
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
          className="flex h-9 w-[250px] items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
        >
          Changer le mot de passe
        </button>
      </form>
    </Form>
  );
}
