'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import useSWR from 'swr';
import fetcher from '@/lib/fetcher';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Send, CheckCircle, XCircle, FileText, RotateCcw, AlertTriangle,
} from 'lucide-react';

type TreasuryAccount = { id: string; name: string; type: string };

type Props = {
  documentId: string;
  type:       string;
  status:     string;
};

const PAYMENT_METHODS = [
  { value: 'VIREMENT', label: 'Virement bancaire' },
  { value: 'ESPECES',  label: 'Espèces' },
  { value: 'FLOOZ',    label: 'Flooz (Moov)' },
  { value: 'T_MONEY',  label: 'T-Money (Togocel)' },
];

export function DocumentActions({ documentId, type, status }: Props) {
  const router    = useRouter();
  const { toast } = useToast();
  const [loading, setLoading]           = useState(false);
  const [confirm, setConfirm]           = useState<'transformer' | null>(null);
  const [showAvoirForm, setShowAvoirForm] = useState(false);

  const [avoirForm, setAvoirForm] = useState({
    mode:              'TOTAL' as 'TOTAL' | 'PARTIEL',
    motif:             '',
    montantPartiel:    '',
    notes:             '',
    treasuryAccountId: '',
    paymentMethod:     '',
    refundDate:        new Date().toISOString().split('T')[0],
  });

  const { data: treasuryAccounts } = useSWR<TreasuryAccount[]>(
    showAvoirForm ? '/api/finance/treasury' : null,
    fetcher
  );

  const doAction = async (action: string, payload: Record<string, unknown>, successMsg: string, redirect = false) => {
    setLoading(true);
    setConfirm(null);
    setShowAvoirForm(false);
    try {
      const res = await axios.patch(`/api/billing/documents/${documentId}`, { action, ...payload });
      toast({ title: 'Succès', description: successMsg });
      if (redirect) {
        router.push(`/finance/invoices/${(res.data as { id: string }).id}`);
      } else {
        router.refresh();
      }
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Action impossible.' });
    } finally {
      setLoading(false);
    }
  };

  const submitAvoir = () => {
    if (!avoirForm.motif.trim()) {
      toast({ variant: 'destructive', title: 'Champ requis', description: 'Le motif de l\'avoir est obligatoire.' });
      return;
    }
    if (avoirForm.mode === 'PARTIEL' && (!avoirForm.montantPartiel || Number(avoirForm.montantPartiel) <= 0)) {
      toast({ variant: 'destructive', title: 'Montant invalide', description: 'Saisissez un montant à rembourser.' });
      return;
    }
    if (status === 'PAYEE' && (!avoirForm.treasuryAccountId || !avoirForm.paymentMethod)) {
      toast({ variant: 'destructive', title: 'Champs requis', description: 'Sélectionnez le compte et le mode de remboursement.' });
      return;
    }
    doAction('avoir', {
      mode:              avoirForm.mode,
      motif:             avoirForm.motif,
      montantPartiel:    avoirForm.mode === 'PARTIEL' ? Number(avoirForm.montantPartiel) : undefined,
      notes:             avoirForm.notes || undefined,
      treasuryAccountId: status === 'PAYEE' ? avoirForm.treasuryAccountId : undefined,
      paymentMethod:     status === 'PAYEE' ? avoirForm.paymentMethod     : undefined,
      refundDate:        status === 'PAYEE' ? avoirForm.refundDate         : undefined,
    }, 'Avoir créé avec succès.', true);
  };

  const ConfirmBanner = ({ message, onConfirm }: { message: string; onConfirm: () => void }) =>
    confirm === 'transformer' ? (
      <div className="flex items-center gap-3 rounded-lg border border-[#FF7E00]/30 bg-[#FF7E00]/[0.04] px-4 py-2.5 text-sm">
        <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: '#FF7E00' }} />
        <span className="flex-1" style={{ color: '#1E1D3D' }}>{message}</span>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex h-8 items-center rounded-lg px-3 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
        >
          Confirmer
        </button>
        <button
          onClick={() => setConfirm(null)}
          disabled={loading}
          className="flex h-8 items-center rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-gray-50"
          style={{ color: '#1E1D3D' }}
        >
          Annuler
        </button>
      </div>
    ) : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">

        {/* DEVIS — BROUILLON */}
        {type === 'DEVIS' && status === 'BROUILLON' && (
          <button
            onClick={() => doAction('envoyer', {}, 'Devis marqué comme envoyé.')}
            disabled={loading}
            className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
          >
            <Send className="h-4 w-4" />
            Marquer envoyé
          </button>
        )}

        {/* DEVIS — ENVOYE */}
        {type === 'DEVIS' && status === 'ENVOYE' && (
          <>
            <button
              onClick={() => doAction('accepter', {}, 'Devis accepté.')}
              disabled={loading}
              className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
            >
              <CheckCircle className="h-4 w-4" />
              Accepter
            </button>
            <button
              onClick={() => doAction('refuser', {}, 'Devis refusé.')}
              disabled={loading}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 active:scale-[0.98] disabled:opacity-60"
            >
              <XCircle className="h-4 w-4" />
              Refuser
            </button>
          </>
        )}

        {/* DEVIS — ACCEPTE */}
        {type === 'DEVIS' && status === 'ACCEPTE' && (
          <button
            onClick={() => setConfirm('transformer')}
            disabled={loading}
            className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
          >
            <FileText className="h-4 w-4" />
            Transformer en facture
          </button>
        )}

        {/* FACTURE — BROUILLON */}
        {type === 'FACTURE' && status === 'BROUILLON' && (
          <button
            onClick={() => doAction('envoyer', {}, 'Facture émise.')}
            disabled={loading}
            className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
          >
            <Send className="h-4 w-4" />
            Émettre la facture
          </button>
        )}

        {/* FACTURE — EMISE ou PAYEE → avoir */}
        {type === 'FACTURE' && (status === 'EMISE' || status === 'PAYEE') && (
          <button
            onClick={() => setShowAvoirForm((v) => !v)}
            disabled={loading}
            className="flex h-9 items-center gap-1.5 rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-[#FF7E00]/[0.06] disabled:opacity-60"
            style={{ color: '#1E1D3D' }}
          >
            <RotateCcw className="h-4 w-4" />
            Émettre un avoir
          </button>
        )}
      </div>

      {/* Formulaire avoir */}
      {showAvoirForm && (
        <div className="rounded-lg border border-[#FF7E00]/20 bg-[#FF7E00]/[0.03] p-4 space-y-4">
          <p className="text-sm font-semibold" style={{ color: '#1E1D3D' }}>Émission d&apos;un avoir</p>

          <div className="flex gap-2">
            {(['TOTAL', 'PARTIEL'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setAvoirForm((p) => ({ ...p, mode: m }))}
                className={`flex h-8 items-center rounded-lg px-3 text-sm font-medium transition-all ${
                  avoirForm.mode === m
                    ? 'text-white'
                    : 'border hover:bg-gray-50'
                }`}
                style={avoirForm.mode === m
                  ? { background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }
                  : { color: '#1E1D3D' }
                }
              >
                {m === 'TOTAL' ? 'Remboursement total' : 'Remboursement partiel'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Motif de l&apos;avoir *</Label>
              <Input
                placeholder="Ex : Erreur de facturation, Retour de prestation..."
                value={avoirForm.motif}
                onChange={(e) => setAvoirForm((p) => ({ ...p, motif: e.target.value }))}
              />
            </div>

            {avoirForm.mode === 'PARTIEL' && (
              <div className="space-y-1">
                <Label className="text-xs">Montant à rembourser TTC (FCFA) *</Label>
                <Input
                  type="number" min="0" step="1" placeholder="0"
                  value={avoirForm.montantPartiel}
                  onChange={(e) => setAvoirForm((p) => ({ ...p, montantPartiel: e.target.value }))}
                />
              </div>
            )}

            <div className={`space-y-1 ${avoirForm.mode === 'PARTIEL' ? '' : 'col-span-2'}`}>
              <Label className="text-xs">Notes complémentaires</Label>
              <Textarea
                placeholder="Conditions, précisions..."
                value={avoirForm.notes}
                onChange={(e) => setAvoirForm((p) => ({ ...p, notes: e.target.value }))}
                className="min-h-[60px]"
              />
            </div>

            {status === 'PAYEE' && (
              <>
                <div className="col-span-2">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 px-3 py-2 text-xs text-blue-700 dark:text-blue-300">
                    Cette facture a été encaissée — le remboursement sera enregistré comme sortie de trésorerie.
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Compte de remboursement *</Label>
                  <Select value={avoirForm.treasuryAccountId} onValueChange={(v) => setAvoirForm((p) => ({ ...p, treasuryAccountId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner un compte..." /></SelectTrigger>
                    <SelectContent>
                      {(treasuryAccounts ?? []).map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Mode de remboursement *</Label>
                  <Select value={avoirForm.paymentMethod} onValueChange={(v) => setAvoirForm((p) => ({ ...p, paymentMethod: v }))}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Date du remboursement *</Label>
                  <Input
                    type="date"
                    value={avoirForm.refundDate}
                    onChange={(e) => setAvoirForm((p) => ({ ...p, refundDate: e.target.value }))}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowAvoirForm(false)}
              disabled={loading}
              className="flex h-8 items-center rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-gray-50"
              style={{ color: '#1E1D3D' }}
            >
              Annuler
            </button>
            <button
              onClick={submitAvoir}
              disabled={loading}
              className="flex h-8 items-center rounded-lg px-3 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
            >
              {loading ? 'Création...' : 'Créer l\'avoir'}
            </button>
          </div>
        </div>
      )}

      <ConfirmBanner
        message="Une nouvelle facture sera créée à partir de ce devis. Confirmer ?"
        onConfirm={() => doAction('transformer', {}, 'Facture créée avec succès.', true)}
      />
    </div>
  );
}
