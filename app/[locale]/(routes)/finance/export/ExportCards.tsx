'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileSpreadsheet } from 'lucide-react';

const now   = new Date();
const year  = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const DEFAULT_DEBUT = `${year}-${month}-01`;
const DEFAULT_FIN   = new Date(year, now.getMonth() + 1, 0).toISOString().split('T')[0];

function DateRange({
  debut, fin, onChange,
}: {
  debut: string; fin: string;
  onChange: (field: 'debut' | 'fin', val: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label className="text-xs">Du</Label>
        <input
          type="date"
          value={debut}
          onChange={(e) => onChange('debut', e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Au</Label>
        <input
          type="date"
          value={fin}
          onChange={(e) => onChange('fin', e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
    </div>
  );
}

/* ── Facturation ───────────────────────────────────────────────────────── */
export function FacturationExportCard() {
  const [debut, setDebut] = useState(DEFAULT_DEBUT);
  const [fin,   setFin]   = useState(DEFAULT_FIN);
  const [type,  setType]  = useState('ALL');

  const href = `/api/finance/export/facturation?debut=${debut}&fin=${fin}&type=${type}`;

  return (
    <Card className="overflow-hidden">
      <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
      <CardHeader className="pb-3 pt-5">
        <p className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#1E1D3D' }}>
          <FileSpreadsheet className="h-4 w-4 text-green-600" />
          Facturation
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Devis, factures et avoirs — numéro, client, régime TVA, montants HT/TVA/TTC, statut.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <DateRange
          debut={debut} fin={fin}
          onChange={(f, v) => f === 'debut' ? setDebut(v) : setFin(v)}
        />
        <div className="space-y-1">
          <Label className="text-xs">Type de document</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous (devis, factures, avoirs)</SelectItem>
              <SelectItem value="DEVIS">Devis uniquement</SelectItem>
              <SelectItem value="FACTURE">Factures uniquement</SelectItem>
              <SelectItem value="AVOIR">Avoirs uniquement</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <a href={href} download>
          <button
            className="flex w-full h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
          >
            <Download className="h-4 w-4" />
            Télécharger CSV
          </button>
        </a>
      </CardContent>
    </Card>
  );
}

/* ── Dépenses ──────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { value: 'ALL',           label: 'Toutes les catégories' },
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

export function DepensesExportCard() {
  const [debut,    setDebut]    = useState(DEFAULT_DEBUT);
  const [fin,      setFin]      = useState(DEFAULT_FIN);
  const [category, setCategory] = useState('ALL');

  const href = `/api/finance/export/depenses?debut=${debut}&fin=${fin}&categorie=${category}`;

  return (
    <Card className="overflow-hidden">
      <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
      <CardHeader className="pb-3 pt-5">
        <p className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#1E1D3D' }}>
          <FileSpreadsheet className="h-4 w-4 text-red-600" />
          Dépenses
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Toutes les dépenses — date, description, catégorie, montant, mode de paiement, compte.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <DateRange
          debut={debut} fin={fin}
          onChange={(f, v) => f === 'debut' ? setDebut(v) : setFin(v)}
        />
        <div className="space-y-1">
          <Label className="text-xs">Catégorie</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <a href={href} download>
          <button
            className="flex w-full h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
          >
            <Download className="h-4 w-4" />
            Télécharger CSV
          </button>
        </a>
      </CardContent>
    </Card>
  );
}

/* ── Trésorerie ────────────────────────────────────────────────────────── */
export function TresorerieExportCard({ accounts }: { accounts: { id: string; name: string }[] }) {
  const [debut,     setDebut]     = useState(DEFAULT_DEBUT);
  const [fin,       setFin]       = useState(DEFAULT_FIN);
  const [accountId, setAccountId] = useState('ALL');

  const href = `/api/finance/export/tresorerie?debut=${debut}&fin=${fin}&compte=${accountId}`;

  return (
    <Card className="overflow-hidden">
      <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
      <CardHeader className="pb-3 pt-5">
        <p className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#1E1D3D' }}>
          <FileSpreadsheet className="h-4 w-4 text-blue-600" />
          Mouvements de trésorerie
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Entrées et sorties — date, compte, type, montant, description, mode de paiement, référence.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <DateRange
          debut={debut} fin={fin}
          onChange={(f, v) => f === 'debut' ? setDebut(v) : setFin(v)}
        />
        <div className="space-y-1">
          <Label className="text-xs">Compte de trésorerie</Label>
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les comptes</SelectItem>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <a href={href} download>
          <button
            className="flex w-full h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
          >
            <Download className="h-4 w-4" />
            Télécharger CSV
          </button>
        </a>
      </CardContent>
    </Card>
  );
}
