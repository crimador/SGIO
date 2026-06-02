'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import axios from 'axios';
import useSWR from 'swr';
import fetcher from '@/lib/fetcher';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Banknote, CheckCircle2, FileDown } from 'lucide-react';

const PAYMENT_METHODS = [
  { value: 'ESPECES',  label: 'Espèces' },
  { value: 'VIREMENT', label: 'Virement bancaire' },
  { value: 'FLOOZ',    label: 'Flooz (Moov)' },
  { value: 'T_MONEY',  label: 'T-Money (Togocel)' },
];

const PM_LABELS: Record<string, string> = {
  ESPECES: 'Espèces', VIREMENT: 'Virement', FLOOZ: 'Flooz', T_MONEY: 'T-Money',
};

type Payment = {
  id: string; amount: number; date: string;
  paymentMethod: string; notes: string | null;
  treasuryAccount: { name: string } | null;
};

type TreasuryAccount = { id: string; name: string; type: string };

function fmt(n: number) {
  return Math.round(n).toLocaleString('fr-FR');
}

type Props = {
  documentId: string;
  totalTTC:   number;
  status:     string;
};

export function PaymentsSection({ documentId, totalTTC, status }: Props) {
  const router    = useRouter();
  const { toast } = useToast();
  const [open, setOpen]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [dlId, setDlId]         = useState<string | null>(null);

  const downloadReceipt = async (paymentId: string) => {
    setDlId(paymentId);
    try {
      const res = await fetch(`/api/billing/documents/${documentId}/payments/${paymentId}/receipt`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        toast({ variant: 'destructive', title: 'Erreur', description: (json as { error?: string }).error ?? 'Impossible de générer le reçu.' });
        return;
      }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `recu-${paymentId.slice(-6)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de générer le reçu.' });
    } finally {
      setDlId(null);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    amount:            '',
    date:              today,
    paymentMethod:     'ESPECES',
    treasuryAccountId: 'none',
    notes:             '',
  });

  const { data: payments = [], mutate } = useSWR<Payment[]>(
    `/api/billing/documents/${documentId}/payments`,
    fetcher
  );
  const { data: accounts = [] } = useSWR<TreasuryAccount[]>('/api/finance/treasury', fetcher);

  const totalPaye = payments.reduce((s, p) => s + p.amount, 0);
  const reste     = totalTTC - totalPaye;
  const pct       = Math.min(100, Math.round((totalPaye / totalTTC) * 100));
  const isSolde   = status === 'PAYEE' || reste <= 0.01;

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) {
      toast({ variant: 'destructive', title: 'Montant invalide' });
      return;
    }
    setLoading(true);
    try {
      await axios.post(`/api/billing/documents/${documentId}/payments`, {
        amount,
        date:              form.date,
        paymentMethod:     form.paymentMethod,
        treasuryAccountId: form.treasuryAccountId === 'none' ? null : form.treasuryAccountId,
        notes:             form.notes || null,
      });
      await mutate();
      setOpen(false);
      setForm({ amount: '', date: today, paymentMethod: 'ESPECES', treasuryAccountId: 'none', notes: '' });
      toast({ title: 'Paiement enregistré', description: amount >= reste ? 'Facture soldée !' : `${fmt(reste - amount)} FCFA restants.` });
      router.refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Erreur lors de l\'enregistrement';
      toast({ variant: 'destructive', title: 'Erreur', description: msg });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'BROUILLON' || status === 'ANNULEE') return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <p
          className="border-l-[3px] pl-3 text-xs font-semibold uppercase tracking-wide text-gray-400"
          style={{ borderColor: '#FF7E00' }}
        >
          Acomptes &amp; Paiements
        </p>
        {!isSolde && (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
              >
                <PlusCircle className="h-4 w-4" />
                Enregistrer un paiement
              </button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Enregistrer un paiement</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="rounded-lg border border-[#FF7E00]/20 bg-[#FF7E00]/[0.03] p-3 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total facture</span>
                    <span className="font-medium" style={{ color: '#1E1D3D' }}>{fmt(totalTTC)} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Déjà reçu</span>
                    <span className="font-medium text-green-700">{fmt(totalPaye)} FCFA</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 font-bold">
                    <span style={{ color: '#1E1D3D' }}>Reste à payer</span>
                    <span style={{ color: '#FF7E00' }}>{fmt(reste)} FCFA</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Montant reçu (FCFA) *</Label>
                  <Input
                    type="number"
                    min="1"
                    max={reste}
                    placeholder={`Max : ${fmt(reste)}`}
                    value={form.amount}
                    onChange={(e) => set('amount', e.target.value)}
                  />
                  {parseFloat(form.amount) >= reste && (
                    <p className="text-xs text-green-700 font-medium">Ce paiement soldera la facture.</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label>Date de réception *</Label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => set('date', e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Mode de paiement *</Label>
                  <Select value={form.paymentMethod} onValueChange={(v) => set('paymentMethod', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>Compte de trésorerie</Label>
                  <Select value={form.treasuryAccountId} onValueChange={(v) => set('treasuryAccountId', v)}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner un compte" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun compte</SelectItem>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-400">Si sélectionné, un mouvement ENTRÉE sera créé automatiquement.</p>
                </div>

                <div className="space-y-1">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Référence virement, numéro chèque..."
                    value={form.notes}
                    onChange={(e) => set('notes', e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
                >
                  {loading ? 'Enregistrement...' : 'Confirmer le paiement'}
                </button>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Barre de progression */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Payé : {fmt(totalPaye)} FCFA ({pct}%)</span>
          <span>{isSolde ? 'Soldée' : `Reste : ${fmt(reste)} FCFA`}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isSolde ? 'bg-green-500' : pct > 0 ? '' : 'bg-gray-200'}`}
            style={isSolde ? {} : pct > 0 ? { background: 'linear-gradient(to right, #FF7E00, #FAC731)', width: `${pct}%` } : { width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Liste des paiements */}
      {payments.length > 0 ? (
        <div className="rounded-xl border overflow-hidden divide-y text-sm">
          {payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-4 py-3 gap-4 transition-colors hover:bg-[#FF7E00]/[0.04]">
              <div className="flex items-center gap-3">
                <Banknote className="h-4 w-4 shrink-0" style={{ color: '#FF7E00' }} />
                <div>
                  <p className="font-medium" style={{ color: '#1E1D3D' }}>{fmt(p.amount)} FCFA</p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(p.date), 'dd MMMM yyyy', { locale: fr })}
                    {p.treasuryAccount && ` · ${p.treasuryAccount.name}`}
                    {p.notes && ` · ${p.notes}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-[#1E1D3D]/10 text-[#1E1D3D]">
                  {PM_LABELS[p.paymentMethod] ?? p.paymentMethod}
                </span>
                <button
                  onClick={() => downloadReceipt(p.id)}
                  disabled={dlId === p.id}
                  title="Télécharger le reçu"
                  className="flex h-7 items-center gap-1 rounded-md border px-2 text-xs font-medium transition-colors hover:bg-gray-50 disabled:opacity-50"
                  style={{ color: '#1E1D3D' }}
                >
                  <FileDown className="h-3.5 w-3.5" />
                  {dlId === p.id ? '...' : 'Reçu'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">Aucun paiement enregistré.</p>
      )}

      {isSolde && (
        <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
          <CheckCircle2 className="h-4 w-4" />
          Facture entièrement soldée
        </div>
      )}
    </section>
  );
}
