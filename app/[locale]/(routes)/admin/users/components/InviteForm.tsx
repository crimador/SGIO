'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/ui/icons';
import { UserPlus } from 'lucide-react';
import { ROLE_LABELS } from '@/lib/permissions';
import type { UserRole } from '@/lib/permissions';

const FormSchema = z.object({
  name:     z.string().min(2, 'Nom requis'),
  email:    z.string().email('Email invalide'),
  userRole: z.string().min(1, 'Rôle requis'),
});

export function InviteForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: '', email: '', userRole: '' },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    try {
      await axios.post('/api/user/inviteuser', { ...data, language: 'fr' });
      toast({
        title: 'Utilisateur créé',
        description: `Les identifiants ont été envoyés à ${data.email}.`,
      });
      form.reset({ name: '', email: '', userRole: '' });
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error instanceof AxiosError
          ? error.response?.data?.error || 'Une erreur est survenue.'
          : 'Une erreur est survenue.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-4 p-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="w-56">
              <FormLabel>Nom complet</FormLabel>
              <FormControl>
                <Input disabled={isLoading} placeholder="Jean Dupont" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-64">
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input disabled={isLoading} placeholder="jean@kekeligroup.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="userRole"
          render={({ field }) => (
            <FormItem className="w-48">
              <FormLabel>Rôle</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un rôle" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(Object.keys(ROLE_LABELS) as UserRole[]).map(role => (
                    <SelectItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
        >
          {isLoading ? <Icons.spinner className="animate-spin" /> : <><UserPlus className="h-4 w-4" />Créer et envoyer</>}
        </button>
      </form>
    </Form>
  );
}
