'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import useSWR from 'swr';

import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import SuspenseLoading from '@/components/loadings/suspense';
import fetcher from '@/lib/fetcher';

const schema = z.object({
  createAccount: z.boolean(),
  accountName: z.string().optional(),
  createContact: z.boolean(),
  createOpportunity: z.boolean(),
  opportunityName: z.string().optional(),
  budget: z.string().optional(),
  closeDate: z.string().optional(),
  salesStage: z.string().optional(),
  assignedTo: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  lead: any;
  setOpen: (v: boolean) => void;
};

export function ConvertLeadForm({ lead, setOpen }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { data: oppData, isLoading } = useSWR('/api/crm/opportunity', fetcher);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      createAccount: !!lead.company,
      accountName: lead.company || '',
      createContact: true,
      createOpportunity: true,
      opportunityName: lead.company ? `Opportunité - ${lead.company}` : `Opportunité - ${lead.firstName ?? ''} ${lead.lastName}`,
      budget: '',
      closeDate: '',
      salesStage: '',
      assignedTo: lead.assigned_to || '',
    },
  });

  const watchAccount = form.watch('createAccount');
  const watchContact = form.watch('createContact');
  const watchOpportunity = form.watch('createOpportunity');

  const onSubmit = async (values: FormValues) => {
    if (!values.createAccount && !values.createContact && !values.createOpportunity) {
      toast({ title: 'Sélectionnez au moins un élément à créer', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`/api/crm/leads/${lead.id}/convert`, values);
      const { accountId, opportunityId } = res.data;
      toast({ title: 'Prospect converti avec succès' });
      setOpen(false);
      if (opportunityId) {
        router.push(`/crm/opportunities/${opportunityId}`);
      } else if (accountId) {
        router.push(`/crm/accounts/${accountId}`);
      } else {
        router.refresh();
      }
    } catch {
      toast({ title: 'Erreur lors de la conversion', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <SuspenseLoading />;

  const saleStages = oppData?.saleStages ?? [];
  const users = oppData?.users ?? [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">

        {/* Résumé prospect */}
        <div className="rounded-md border bg-gray-50 p-3 text-sm">
          <p className="font-medium">{lead.firstName} {lead.lastName}</p>
          {lead.company && <p className="text-gray-400">{lead.company}</p>}
          {lead.email && <p className="text-gray-400">{lead.email}</p>}
          {lead.phone && <p className="text-gray-400">{lead.phone}</p>}
        </div>

        {/* COMPTE */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FormField
              control={form.control}
              name="createAccount"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-semibold">Créer un compte</FormLabel>
                </FormItem>
              )}
            />
            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium" style={{ color: '#1E1D3D' }}>Compte</span>
          </div>
          {watchAccount && (
            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du compte</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de l'entreprise" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="h-px bg-gray-100" />

        {/* CONTACT */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FormField
              control={form.control}
              name="createContact"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-semibold">Créer un contact</FormLabel>
                </FormItem>
              )}
            />
            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium" style={{ color: '#1E1D3D' }}>Contact</span>
          </div>
          {watchContact && (
            <div className="rounded-md border bg-gray-50 p-3 text-sm text-gray-400">
              Sera créé avec : <strong>{lead.firstName} {lead.lastName}</strong>
              {lead.email && ` · ${lead.email}`}
              {lead.phone && ` · ${lead.phone}`}
            </div>
          )}
        </div>

        <div className="h-px bg-gray-100" />

        {/* OPPORTUNITÉ */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FormField
              control={form.control}
              name="createOpportunity"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-semibold">Créer une opportunité</FormLabel>
                </FormItem>
              )}
            />
            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium" style={{ color: '#1E1D3D' }}>Opportunité</span>
          </div>
          {watchOpportunity && (
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="opportunityName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l&apos;opportunité</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de l'opportunité" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget (FCFA)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="closeDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de clôture</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="salesStage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stade de vente</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un stade..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {saleStages.map((s: any) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        <div className="h-px bg-gray-100" />

        {/* RESPONSABLE COMMUN */}
        <FormField
          control={form.control}
          name="assignedTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsable</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Assigner à..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-48 overflow-y-auto">
                  {users.map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <button
          type="submit"
          disabled={loading}
          className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
        >
          {loading ? 'Conversion en cours...' : 'Convertir le prospect'}
        </button>
      </form>
    </Form>
  );
}
