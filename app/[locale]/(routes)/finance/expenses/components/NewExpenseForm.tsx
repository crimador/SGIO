'use client';

import { useState } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import fetcher from '@/lib/fetcher';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const CATEGORIES = [
  { value: 'LOYER',         label: 'Loyer et charges locatives' },
  { value: 'HONORAIRES',    label: 'Honoraires et services' },
  { value: 'TRANSPORT',     label: 'Transport et déplacements' },
  { value: 'FOURNITURES',   label: 'Fournitures de bureau' },
  { value: 'COMMUNICATION', label: 'Téléphone et internet' },
  { value: 'BANQUE',        label: 'Frais bancaires' },
  { value: 'IMPOTS',        label: 'Impôts et taxes' },
  { value: 'SALAIRES',      label: 'Salaires et charges sociales' },
  { value: 'PUBLICITE',     label: 'Publicité et communication' },
  { value: 'MAINTENANCE',   label: 'Entretien et réparations' },
  { value: 'AUTRES',        label: 'Autres dépenses' },
];

const PAYMENT_METHODS = [
  { value: 'ESPECES',  label: 'Espèces' },
  { value: 'VIREMENT', label: 'Virement bancaire' },
  { value: 'FLOOZ',    label: 'Flooz (Moov)' },
  { value: 'T_MONEY',  label: 'T-Money (Togocel)' },
];

type TreasuryAccount = { id: string; name: string; type: string };

const today = new Date().toISOString().split('T')[0];

const empty = {
  description:       '',
  amount:            '',
  category:          '',
  date:              today,
  receipt:           '',
  paymentMethod:     'ESPECES',
  treasuryAccountId: '',
};

type Props = { onFinish: (expense: any) => void };

export function NewExpenseForm({ onFinish }: Props) {
  const { toast }   = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState(empty);

  const { data: accounts } = useSWR<TreasuryAccount[]>('/api/finance/treasury', fetcher);

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.description.trim()) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'La description est requise.' });
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Le montant doit être supérieur à 0.' });
      return;
    }
    if (!form.category) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'La catégorie est requise.' });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/finance/expense', {
        description:       form.description,
        amount:            Number(form.amount),
        category:          form.category,
        date:              form.date,
        receipt:           form.receipt || null,
        paymentMethod:     form.paymentMethod,
        treasuryAccountId: form.treasuryAccountId || null,
      });
      toast({ title: 'Succès', description: 'Dépense enregistrée.' });
      setForm(empty);
      onFinish(res.data);
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d\'enregistrer la dépense.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 px-1">

      <div className="space-y-1">
        <Label htmlFor="exp-desc">Description *</Label>
        <Textarea
          id="exp-desc"
          placeholder="Ex : Loyer bureau janvier 2026, Carburant véhicule..."
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          className="min-h-[72px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="exp-amount">Montant (FCFA) *</Label>
          <Input
            id="exp-amount"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={form.amount}
            onChange={(e) => set('amount', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="exp-date">Date *</Label>
          <Input
            id="exp-date"
            type="date"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="exp-cat">Catégorie *</Label>
        <Select value={form.category} onValueChange={(v) => set('category', v)}>
          <SelectTrigger id="exp-cat">
            <SelectValue placeholder="Choisir une catégorie" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="exp-account">Compte de trésorerie (débit)</Label>
        <Select value={form.treasuryAccountId} onValueChange={(v) => set('treasuryAccountId', v)}>
          <SelectTrigger id="exp-account">
            <SelectValue placeholder="Sélectionner un compte..." />
          </SelectTrigger>
          <SelectContent>
            {(accounts ?? []).map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-400">
          Si sélectionné, le solde du compte sera débité automatiquement.
        </p>
      </div>

      <div className="space-y-1">
        <Label htmlFor="exp-method">Mode de paiement</Label>
        <Select value={form.paymentMethod} onValueChange={(v) => set('paymentMethod', v)}>
          <SelectTrigger id="exp-method">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="exp-receipt">Référence / N° reçu</Label>
        <Input
          id="exp-receipt"
          placeholder="Ex : RECU-2026-0042"
          value={form.receipt}
          onChange={(e) => set('receipt', e.target.value)}
        />
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex h-10 items-center rounded-lg px-5 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
        >
          {loading ? 'Enregistrement...' : 'Enregistrer la dépense'}
        </button>
      </div>
    </div>
  );
}
