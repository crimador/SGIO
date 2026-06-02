'use client';

import { z } from 'zod';
import axios from 'axios';
import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import type {
  crm_Accounts,
  crm_Contacts,
  crm_Opportunities_Sales_Stages,
  crm_Opportunities_Type,
  crm_campaigns,
} from '@prisma/client';

type Props = {
  users: any[];
  accounts: crm_Accounts[];
  contacts: crm_Contacts[];
  salesType: crm_Opportunities_Type[];
  saleStages: crm_Opportunities_Sales_Stages[];
  campaigns: crm_campaigns[];
  selectedStage?: string;
  accountId?: string;
  onDialogClose: () => void;
};

const formSchema = z.object({
  name:        z.string().min(1, 'Le nom est obligatoire'),
  close_date:  z.date({ required_error: 'La date de clôture est obligatoire' }),
  sales_stage: z.string().min(1, "L'étape est obligatoire"),
  budget:      z.string().optional(),
  next_step:   z.string().optional(),
  assigned_to: z.string().min(1, 'Le responsable est obligatoire'),
  account:     z.string().optional(),
  description:      z.string().optional(),
  type:             z.string().optional(),
  currency:         z.string().optional(),
  expected_revenue: z.string().optional(),
  contact:          z.string().optional(),
  campaign:         z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function NewOpportunityForm({
  users, accounts, contacts, salesType, saleStages, campaigns, selectedStage, accountId, onDialogClose,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sales_stage: selectedStage ?? '',
      account:     accountId    ?? '',
      currency:    'FCFA',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await axios.post('/api/crm/opportunity', data);
      toast({ title: 'Succès', description: 'Opportunité créée avec succès.' });
      router.refresh();
      onDialogClose();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: error?.response?.data });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 px-1 py-4">

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Informations générales</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Nom de l&apos;opportunité *</FormLabel>
                <FormControl><Input disabled={isLoading} placeholder="Ex : Mission audit annuel SARL ABC" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="close_date" render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de clôture prévue *</FormLabel>
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
                        {field.value ? format(field.value, 'dd/MM/yyyy', { locale: fr }) : <span>Choisir une date</span>}
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
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="sales_stage" render={({ field }) => (
              <FormItem hidden={!!selectedStage}>
                <FormLabel>Étape commerciale *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={selectedStage ?? field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Sélectionner une étape..." /></SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-56 overflow-y-auto">
                    {saleStages.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="budget" render={({ field }) => (
              <FormItem>
                <FormLabel>Budget (FCFA)</FormLabel>
                <FormControl><Input type="number" disabled={isLoading} placeholder="0" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Affectation</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="assigned_to" render={({ field }) => (
              <FormItem>
                <FormLabel>Responsable *</FormLabel>
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

            <FormField control={form.control} name="account" render={({ field }) => (
              <FormItem hidden={!!accountId}>
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

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Informations complémentaires</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem>
                <FormLabel>Type de vente</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Sélectionner un type..." /></SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-56 overflow-y-auto">
                    {salesType.map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="campaign" render={({ field }) => (
              <FormItem>
                <FormLabel>Campagne</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Sélectionner une campagne..." /></SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-56 overflow-y-auto">
                    {campaigns.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="contact" render={({ field }) => (
              <FormItem>
                <FormLabel>Contact associé</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Sélectionner un contact..." /></SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-56 overflow-y-auto">
                    {contacts.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="expected_revenue" render={({ field }) => (
              <FormItem>
                <FormLabel>Revenu attendu (FCFA)</FormLabel>
                <FormControl><Input type="number" disabled={isLoading} placeholder="0" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        <FormField control={form.control} name="next_step" render={({ field }) => (
          <FormItem>
            <FormLabel>Prochaine étape</FormLabel>
            <FormControl>
              <Textarea disabled={isLoading} placeholder="Ex : Envoyer la proposition commerciale d'ici vendredi..." {...field} className="min-h-[70px]" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea disabled={isLoading} placeholder="Détails sur cette opportunité..." {...field} className="min-h-[70px]" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <button
          disabled={isLoading}
          type="submit"
          className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
        >
          {isLoading ? 'Enregistrement...' : "Créer l'opportunité"}
        </button>
      </form>
    </Form>
  );
}
