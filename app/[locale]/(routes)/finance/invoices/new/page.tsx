'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
import useSWR from 'swr';
import fetcher from '@/lib/fetcher';

import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, PlusCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// ─── Schéma Zod ─────────────────────────────────────────────────────────────

const lineSchema = z.object({
  position:    z.number(),
  designation: z.string().min(1, 'Requis'),
  quantity:    z.coerce.number().min(0.01),
  unitPrice:   z.coerce.number().min(0),
  totalHT:     z.number(),
  totalTVA:    z.number(),
  totalTTC:    z.number(),
});

const formSchema = z.object({
  type:        z.enum(['DEVIS', 'FACTURE']),
  clientMode:  z.enum(['CRM', 'OCCASIONNEL']),
  crmAccountId:      z.string().optional(),
  occasionalName:    z.string().optional(),
  occasionalNif:     z.string().optional(),
  occasionalPhone:   z.string().optional(),
  occasionalEmail:   z.string().optional(),
  occasionalAddress: z.string().optional(),
  occasionalCity:    z.string().optional(),
  tvaRegime:   z.enum(['NORMAL', 'EXONERE', 'TPU']),
  issueDate:   z.string(),
  dueDate:     z.string().optional(),
  notes:       z.string().optional(),
  lines:       z.array(lineSchema).min(1, 'Au moins une ligne est requise'),
});

type FormValues = z.infer<typeof formSchema>;

// ─── Helpers ────────────────────────────────────────────────────────────────

const TVA_LABELS: Record<string, string> = {
  NORMAL:  'Réel avec TVA (18%)',
  EXONERE: 'Exonéré de TVA (0%)',
  TPU:     'TVA non applicable – TPU',
};

function getTvaRate(regime: string): number {
  return regime === 'NORMAL' ? 18 : 0;
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="border-l-[3px] pl-3 text-xs font-semibold uppercase tracking-wide text-gray-400"
      style={{ borderColor: '#FF7E00' }}
    >
      {children}
    </p>
  );
}

// ─── Composant ──────────────────────────────────────────────────────────────

export default function NewBillingDocumentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { data: accounts } = useSWR<any[]>('/api/crm/account', fetcher);

  const today = new Date().toISOString().split('T')[0];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type:       'FACTURE',
      clientMode: 'CRM',
      tvaRegime:  'NORMAL',
      issueDate:  today,
      lines: [{ position: 1, designation: '', quantity: 1, unitPrice: 0, totalHT: 0, totalTVA: 0, totalTTC: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'lines' });

  const tvaRegime  = form.watch('tvaRegime');
  const clientMode = form.watch('clientMode');
  const lines      = form.watch('lines');

  useEffect(() => {
    const rate = getTvaRate(tvaRegime);
    lines.forEach((line, i) => {
      const ht  = (line.quantity ?? 0) * (line.unitPrice ?? 0);
      const tva = ht * rate / 100;
      form.setValue(`lines.${i}.totalHT`,  ht);
      form.setValue(`lines.${i}.totalTVA`, tva);
      form.setValue(`lines.${i}.totalTTC`, ht + tva);
    });
  }, [tvaRegime, JSON.stringify(lines.map((l) => [l.quantity, l.unitPrice]))]);

  const totalHT  = lines.reduce((s, l) => s + (l.totalHT  ?? 0), 0);
  const totalTVA = lines.reduce((s, l) => s + (l.totalTVA ?? 0), 0);
  const totalTTC = lines.reduce((s, l) => s + (l.totalTTC ?? 0), 0);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const payload: any = {
        type:      data.type,
        tvaRegime: data.tvaRegime,
        tvaRate:   getTvaRate(data.tvaRegime),
        issueDate: data.issueDate,
        dueDate:   data.dueDate || null,
        notes:     data.notes || null,
        lines:     data.lines,
      };

      if (data.clientMode === 'CRM') {
        payload.crmAccountId = data.crmAccountId;
      } else {
        payload.occasionalClient = {
          name:    data.occasionalName,
          nif:     data.occasionalNif    || null,
          phone:   data.occasionalPhone  || null,
          email:   data.occasionalEmail  || null,
          address: data.occasionalAddress || null,
          city:    data.occasionalCity   || null,
        };
      }

      await axios.post('/api/billing/documents', payload);
      toast({ title: 'Succès', description: 'Document créé avec succès.' });
      router.push('/finance/invoices');
      router.refresh();
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de créer le document.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <Link
          href="/finance/invoices"
          className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:bg-[#FF7E00]/[0.06]"
          style={{ color: '#1E1D3D' }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1E1D3D' }}>Nouveau document</h1>
          <p className="text-sm text-gray-400">Devis ou facture client</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Type de document */}
          <section className="rounded-xl border overflow-hidden">
            <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
            <div className="p-4 space-y-4">
              <SectionHeader>Type de document</SectionHeader>
              <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="FACTURE">Facture</SelectItem>
                        <SelectItem value="DEVIS">Devis (pro forma)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="issueDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date d&apos;émission</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="dueDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date d&apos;échéance</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>
          </section>

          {/* Client */}
          <section className="rounded-xl border overflow-hidden">
            <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
            <div className="p-4 space-y-4">
              <SectionHeader>Client</SectionHeader>
              <FormField control={form.control} name="clientMode" render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="w-56"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="CRM">Client enregistré (CRM)</SelectItem>
                      <SelectItem value="OCCASIONNEL">Client occasionnel</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />

              {clientMode === 'CRM' ? (
                <FormField control={form.control} name="crmAccountId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sélectionner le client</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Choisir un compte..." /></SelectTrigger></FormControl>
                      <SelectContent className="max-h-56 overflow-y-auto">
                        {(accounts ?? []).map((a: any) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name}{a.nif ? ` — NIF: ${a.nif}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'occasionalName',    label: 'Nom / Raison sociale *' },
                    { name: 'occasionalNif',     label: 'NIF' },
                    { name: 'occasionalPhone',   label: 'Téléphone' },
                    { name: 'occasionalEmail',   label: 'E-mail' },
                    { name: 'occasionalAddress', label: 'Adresse' },
                    { name: 'occasionalCity',    label: 'Ville' },
                  ].map(({ name, label }) => (
                    <FormField key={name} control={form.control} name={name as any} render={({ field }) => (
                      <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl><Input placeholder={label} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Régime TVA */}
          <section className="rounded-xl border overflow-hidden">
            <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
            <div className="p-4 space-y-4">
              <SectionHeader>Fiscalité</SectionHeader>
              <FormField control={form.control} name="tvaRegime" render={({ field }) => (
                <FormItem className="w-72">
                  <FormLabel>Régime TVA</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {Object.entries(TVA_LABELS).map(([val, lbl]) => (
                        <SelectItem key={val} value={val}>{lbl}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </section>

          {/* Lignes */}
          <section className="rounded-xl border overflow-hidden">
            <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
            <div className="p-4 space-y-4">
              <SectionHeader>Lignes</SectionHeader>

              <div className="space-y-2">
                {/* En-tête du tableau de lignes */}
                <div className="grid grid-cols-12 gap-2 px-1 text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>
                  <span className="col-span-5">Désignation</span>
                  <span className="col-span-2 text-right">Qté</span>
                  <span className="col-span-2 text-right">PU HT (FCFA)</span>
                  <span className="col-span-2 text-right">Total TTC</span>
                  <span className="col-span-1" />
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-5">
                      <FormField control={form.control} name={`lines.${index}.designation`} render={({ field: f }) => (
                        <FormItem>
                          <FormControl><Input placeholder="Description de la prestation" {...f} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="col-span-2">
                      <FormField control={form.control} name={`lines.${index}.quantity`} render={({ field: f }) => (
                        <FormItem>
                          <FormControl><Input type="number" min="0" step="0.01" className="text-right" {...f} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="col-span-2">
                      <FormField control={form.control} name={`lines.${index}.unitPrice`} render={({ field: f }) => (
                        <FormItem>
                          <FormControl><Input type="number" min="0" step="1" className="text-right" {...f} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="col-span-2 pt-2 text-right text-sm font-medium" style={{ color: '#1E1D3D' }}>
                      {(lines[index]?.totalTTC ?? 0).toLocaleString('fr-FR')}
                    </div>
                    <div className="col-span-1 pt-1">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-red-50 disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => append({ position: fields.length + 1, designation: '', quantity: 1, unitPrice: 0, totalHT: 0, totalTVA: 0, totalTTC: 0 })}
                  className="flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-[#FF7E00]/[0.06]"
                  style={{ color: '#1E1D3D' }}
                >
                  <PlusCircle className="h-4 w-4" style={{ color: '#FF7E00' }} />
                  Ajouter une ligne
                </button>
              </div>

              {/* Totaux */}
              <div className="flex justify-end border-t pt-4">
                <div className="w-64 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total HT</span>
                    <span style={{ color: '#1E1D3D' }}>{totalHT.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      TVA {tvaRegime === 'NORMAL' ? '(18%)' : tvaRegime === 'EXONERE' ? '(Exonéré)' : '(TPU)'}
                    </span>
                    <span style={{ color: '#1E1D3D' }}>{totalTVA.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 text-base font-bold">
                    <span style={{ color: '#1E1D3D' }}>Total TTC</span>
                    <span style={{ color: '#FF7E00' }}>{totalTTC.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Notes */}
          <section className="rounded-xl border overflow-hidden">
            <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
            <div className="p-4">
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes / Conditions</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Conditions de paiement, mentions particulières..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Link
              href="/finance/invoices"
              className="flex h-10 items-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-gray-50"
              style={{ color: '#1E1D3D' }}
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-10 items-center rounded-lg px-6 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}
