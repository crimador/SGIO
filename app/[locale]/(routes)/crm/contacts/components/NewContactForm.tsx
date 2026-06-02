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
import { Switch } from '@/components/ui/switch';

type NewContactFormProps = {
  users: any[];
  accounts: any[];
};

const contactTypes = [
  { name: 'Client',      id: 'Customer' },
  { name: 'Partenaire',  id: 'Partner' },
  { name: 'Fournisseur', id: 'Vendor' },
];

const yearArray  = Array.from({ length: 100 }, (_, i) => i + 1923);
const monthArray = Array.from({ length: 12  }, (_, i) => i + 1);
const dayArray   = Array.from({ length: 31  }, (_, i) => i + 1);

const formSchema = z.object({
  first_name:      z.string().optional(),
  last_name:       z.string().min(1, 'Le nom est obligatoire'),
  email:           z.string().email('E-mail invalide'),
  personal_email:  z.string().optional(),
  mobile_phone:    z.string().optional(),
  office_phone:    z.string().optional(),
  website:         z.string().optional(),
  position:        z.string().optional(),
  type:            z.string().min(1, 'Sélectionnez un type'),
  status:          z.boolean(),
  assigned_to:     z.string().min(1, 'Sélectionnez un responsable'),
  assigned_account: z.string().optional(),
  description:     z.string().optional(),
  birthday_year:   z.string().optional(),
  birthday_month:  z.string().optional(),
  birthday_day:    z.string().optional(),
  social_twitter:  z.string().optional(),
  social_facebook: z.string().optional(),
  social_linkedin: z.string().optional(),
  social_skype:    z.string().optional(),
  social_instagram: z.string().optional(),
  social_youtube:  z.string().optional(),
  social_tiktok:   z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function NewContactForm({ users, accounts }: NewContactFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { status: true },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await axios.post('/api/crm/contacts', data);
      toast({ title: 'Succès', description: 'Contact créé avec succès.' });
      form.reset({ first_name: '', last_name: '', email: '', status: true });
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
            <FormField control={form.control} name="position" render={({ field }) => (
              <FormItem>
                <FormLabel>Fonction</FormLabel>
                <FormControl><Input disabled={isLoading} placeholder="Directeur Financier" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem>
                <FormLabel>Type de contact *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {contactTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Coordonnées */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Coordonnées</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail *</FormLabel>
                <FormControl><Input disabled={isLoading} placeholder="contact@entreprise.tg" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="personal_email" render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail personnel</FormLabel>
                <FormControl><Input disabled={isLoading} placeholder="jean.dupont@gmail.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="mobile_phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Tél. mobile</FormLabel>
                <FormControl><Input disabled={isLoading} placeholder="+228 90 00 00 00" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="office_phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Tél. bureau</FormLabel>
                <FormControl><Input disabled={isLoading} placeholder="+228 22 00 00 00" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="website" render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Site web</FormLabel>
                <FormControl><Input disabled={isLoading} placeholder="https://www.entreprise.tg" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Date de naissance */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Date de naissance (facultatif)</p>
          <div className="flex gap-3">
            <FormField control={form.control} name="birthday_year" render={({ field }) => (
              <FormItem className="flex-1">
                <Select onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Année" /></SelectTrigger></FormControl>
                  <SelectContent className="h-56 overflow-y-auto">
                    {yearArray.map((y) => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="birthday_month" render={({ field }) => (
              <FormItem className="flex-1">
                <Select onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Mois" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {monthArray.map((m) => (
                      <SelectItem key={m} value={String(m)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="birthday_day" render={({ field }) => (
              <FormItem className="flex-1">
                <Select onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Jour" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {dayArray.map((d) => (
                      <SelectItem key={d} value={String(d)}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <FormField control={form.control} name="assigned_account" render={({ field }) => (
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
          <div className="mt-4">
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <FormLabel className="text-sm">Contact actif</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )} />
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Description */}
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea disabled={isLoading} placeholder="Informations utiles sur ce contact..." {...field} className="min-h-[70px]" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="h-px bg-gray-100" />

        {/* Réseaux sociaux */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Réseaux sociaux (facultatif)</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="social_twitter" render={({ field }) => (
              <FormItem>
                <FormLabel>Twitter</FormLabel>
                <FormControl><Input disabled={isLoading} placeholder="https://twitter.com/..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="social_facebook" render={({ field }) => (
              <FormItem>
                <FormLabel>Facebook</FormLabel>
                <FormControl><Input disabled={isLoading} placeholder="https://facebook.com/..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="social_linkedin" render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn</FormLabel>
                <FormControl><Input disabled={isLoading} placeholder="https://linkedin.com/in/..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="social_skype" render={({ field }) => (
              <FormItem>
                <FormLabel>Skype</FormLabel>
                <FormControl><Input disabled={isLoading} placeholder="identifiant Skype" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="social_instagram" render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram</FormLabel>
                <FormControl><Input disabled={isLoading} placeholder="https://instagram.com/..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="social_youtube" render={({ field }) => (
              <FormItem>
                <FormLabel>YouTube</FormLabel>
                <FormControl><Input disabled={isLoading} placeholder="https://youtube.com/..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="social_tiktok" render={({ field }) => (
              <FormItem>
                <FormLabel>TikTok</FormLabel>
                <FormControl><Input disabled={isLoading} placeholder="https://tiktok.com/@..." {...field} /></FormControl>
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
          {isLoading ? 'Enregistrement...' : 'Créer le contact'}
        </button>
      </form>
    </Form>
  );
}
