'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';

import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(1, 'Le nom est obligatoire'),
  description: z.string().optional(),
  status: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function NewCampaignForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', description: '', status: 'PLANNED' },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await axios.post('/api/crm/campaigns', data);
      toast({ title: 'Succès', description: 'Campagne créée avec succès.' });
      form.reset({ name: '', description: '', status: 'PLANNED' });
      router.refresh();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: error?.response?.data ?? 'Erreur serveur' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 px-1 py-4">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Informations</p>
          <div className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de la campagne *</FormLabel>
                <FormControl>
                  <Input disabled={isLoading} placeholder="Ex: Campagne Rentrée 2026" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Statut</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Sélectionner un statut..." /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PLANNED">Planifiée</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Terminée</SelectItem>
                    <SelectItem value="CANCELLED">Annulée</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>
        <div className="h-px bg-gray-100" />
        <div>
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea disabled={isLoading} placeholder="Objectifs, cible, canal de diffusion..." className="min-h-[100px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <button
          disabled={isLoading}
          type="submit"
          className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
        >
          {isLoading ? 'Enregistrement...' : 'Créer la campagne'}
        </button>
      </form>
    </Form>
  );
}
