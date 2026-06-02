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
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

type NewLeadFormProps = {
  users: any[];
  accounts: any[];
};

const formSchema = z.object({
  first_name:  z.string().optional(),
  last_name:   z.string().min(1, 'Le nom est obligatoire'),
  company:     z.string().optional(),
  jobTitle:    z.string().optional(),
  email:       z.string().email('E-mail invalide').optional().or(z.literal('')),
  phone:       z.string().optional(),
  assigned_to: z.string().optional(),
  accountIDs:  z.string().optional(),
  description: z.string().optional(),
  lead_source: z.string().optional(),
  refered_by:  z.string().optional(),
  campaign:    z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function NewLeadForm({ users, accounts }: NewLeadFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await axios.post('/api/crm/leads', data);
      toast({ title: 'Succès', description: 'Prospect créé avec succès.' });
      form.reset({ first_name: '', last_name: '', company: '', email: '', phone: '', assigned_to: '', accountIDs: '' });
      router.refresh();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: error?.response?.data });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 px-1 py-4">

        {/* Identité */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Identité</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="first_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl><Input disabled={isLoading} placeholder="Jean" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="last_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de famille *</FormLabel>
                <FormControl><Input disabled={isLoading} placeholder="Dupont" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="company" render={({ field }) => (
              <FormItem>
                <FormLabel>Entreprise</FormLabel>
                <FormControl><Input disabled={isLoading} placeholder="SARL ABC" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="jobTitle" render={({ field }) => (
              <FormItem>
                <FormLabel>Poste</FormLabel>
                <FormControl><Input disabled={isLoading} placeholder="Directeur Commercial" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl><Input disabled={isLoading} placeholder="contact@entreprise.tg" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl><Input disabled={isLoading} placeholder="+228 90 00 00 00" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Affectation */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Affectation</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="assigned_to" render={({ field }) => (
              <FormItem>
                <FormLabel>Responsable</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Assigner à..." /></SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-56 overflow-y-auto">
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="accountIDs" render={({ field }) => (
              <FormItem>
                <FormLabel>Client associé</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Sélectionner un client..." /></SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-56 overflow-y-auto">
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Informations complémentaires */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Informations complémentaires</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="lead_source" render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <FormControl><Input disabled={isLoading} placeholder="Ex : Salon, Recommandation..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="refered_by" render={({ field }) => (
              <FormItem>
                <FormLabel>Référé par</FormLabel>
                <FormControl><Input disabled={isLoading} placeholder="Nom du référent" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="campaign" render={({ field }) => (
              <FormItem>
                <FormLabel>Campagne</FormLabel>
                <FormControl><Input disabled={isLoading} placeholder="Nom de la campagne" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <div className="mt-4">
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea disabled={isLoading} placeholder="Informations utiles sur ce prospect..." {...field} className="min-h-[70px]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        <button
          disabled={isLoading}
          type="submit"
          className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
        >
          {isLoading ? 'Enregistrement...' : 'Créer le prospect'}
        </button>
      </form>
    </Form>
  );
}
