'use client';

import { useState, useRef } from 'react';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ImageIcon, Trash2, Upload } from 'lucide-react';

type Account = {
  id:           string;
  company_name: string;
  email:        string | null;
  phone:        string | null;
  mobile:       string | null;
  website:      string | null;
  street:       string | null;
  city:         string | null;
  state:        string | null;
  zip:          string | null;
  country:      string | null;
  VAT_number:   string;
  TAX_number:   string | null;
  services:     string | null;
  logoUrl:      string | null;
  signer_name:  string | null;
  signer_title: string | null;
};

type Props = { initialData: Account | null };

function Field({
  id, label, value, onChange, placeholder, type = 'text',
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? label}
      />
    </div>
  );
}

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
      <CardHeader className="pb-3 pt-5">
        <p className="text-sm font-semibold" style={{ color: '#1E1D3D' }}>{title}</p>
        {description && <p className="mt-0.5 text-xs text-gray-400">{description}</p>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function CabinetSettingsForm({ initialData }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    company_name: initialData?.company_name ?? '',
    VAT_number:   initialData?.VAT_number   ?? '',
    TAX_number:   initialData?.TAX_number   ?? '',
    email:        initialData?.email        ?? '',
    phone:        initialData?.phone        ?? '',
    mobile:       initialData?.mobile       ?? '',
    website:      initialData?.website      ?? '',
    street:       initialData?.street       ?? '',
    city:         initialData?.city         ?? '',
    state:        initialData?.state        ?? '',
    zip:          initialData?.zip          ?? '',
    country:      initialData?.country      ?? 'Togo',
    services:     initialData?.services     ?? '',
    signer_name:  initialData?.signer_name  ?? '',
    signer_title: initialData?.signer_title ?? '',
  });

  const [logoUrl, setLogoUrl]         = useState<string | null>(initialData?.logoUrl ?? null);
  const [logoLoading, setLogoLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500_000) {
      toast({ variant: 'destructive', title: 'Fichier trop grand', description: 'Le logo doit faire moins de 500 Ko.' });
      return;
    }
    setLogoLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoUrl(ev.target?.result as string);
      setLogoLoading(false);
      toast({ title: 'Logo chargé', description: 'Cliquez sur Enregistrer pour sauvegarder.' });
    };
    reader.readAsDataURL(file);
  };

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.company_name.trim()) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Le nom du cabinet est requis.' });
      return;
    }
    if (!form.VAT_number.trim()) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Le NIF est requis.' });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        services:     form.services     || null,
        signer_name:  form.signer_name  || null,
        signer_title: form.signer_title || null,
        logoUrl,
      };
      if (initialData?.id) {
        await axios.put('/api/my-account', { ...payload, id: initialData.id });
      } else {
        await axios.post('/api/my-account', payload);
      }
      toast({ title: 'Enregistré', description: 'Les informations du cabinet ont été mises à jour.' });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible d'enregistrer." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">

      {/* Logo */}
      <SectionCard
        title="Logo du cabinet"
        description="Affiché en haut à gauche de vos factures et devis PDF. Format recommandé : PNG transparent, 400×150 px max."
      >
        <div className="flex items-center gap-6">
          <div className="flex h-24 w-48 items-center justify-center overflow-hidden rounded-lg border border-dashed bg-gray-50/50">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo cabinet" className="h-full w-full object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-gray-400">
                <ImageIcon className="h-8 w-8" />
                <span className="text-xs">Aucun logo</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="hidden"
              onChange={handleLogoChange}
            />
            <button
              type="button"
              disabled={logoLoading}
              onClick={() => fileInputRef.current?.click()}
              className="flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-[#FF7E00]/[0.06]"
              style={{ color: '#1E1D3D' }}
            >
              <Upload className="h-4 w-4" />
              {logoLoading ? 'Chargement...' : 'Choisir un logo'}
            </button>
            <p className="text-xs text-gray-400">PNG, JPG, SVG · Max 500 Ko</p>
            {logoUrl && (
              <button
                type="button"
                className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                onClick={() => { setLogoUrl(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Supprimer le logo
              </button>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Identité */}
      <SectionCard
        title="Identité du cabinet"
        description="Ces informations apparaissent sur vos factures et devis PDF."
      >
        <div className="space-y-4">
          <Field id="company_name" label="Nom du cabinet *" value={form.company_name}
            onChange={(v) => set('company_name', v)} placeholder="Ex : Cabinet Expert Comptable SARL" />
          <div className="grid grid-cols-2 gap-4">
            <Field id="VAT_number" label="NIF (Numéro d'Identification Fiscale) *"
              value={form.VAT_number} onChange={(v) => set('VAT_number', v)} placeholder="Ex : 1234567A" />
            <Field id="TAX_number" label="RCCM" value={form.TAX_number ?? ''}
              onChange={(v) => set('TAX_number', v)} placeholder="Ex : TG-LOM-2020-B-0001" />
          </div>
        </div>
      </SectionCard>

      {/* Coordonnées */}
      <SectionCard title="Coordonnées">
        <div className="grid grid-cols-2 gap-4">
          <Field id="email" label="Email" type="email" value={form.email}
            onChange={(v) => set('email', v)} placeholder="contact@cabinet.tg" />
          <Field id="phone" label="Téléphone fixe" value={form.phone ?? ''}
            onChange={(v) => set('phone', v)} placeholder="+228 22 XX XX XX" />
          <Field id="mobile" label="Mobile" value={form.mobile ?? ''}
            onChange={(v) => set('mobile', v)} placeholder="+228 90 XX XX XX" />
          <Field id="website" label="Site web" value={form.website ?? ''}
            onChange={(v) => set('website', v)} placeholder="www.cabinet.tg" />
        </div>
      </SectionCard>

      {/* Adresse */}
      <SectionCard title="Adresse">
        <div className="space-y-4">
          <Field id="street" label="Rue / Quartier" value={form.street ?? ''}
            onChange={(v) => set('street', v)} placeholder="Ex : Rue de l'Université, Tokoin" />
          <div className="grid grid-cols-2 gap-4">
            <Field id="city" label="Ville" value={form.city ?? ''}
              onChange={(v) => set('city', v)} placeholder="Lomé" />
            <Field id="state" label="Région / Province" value={form.state ?? ''}
              onChange={(v) => set('state', v)} placeholder="Maritime" />
            <Field id="zip" label="Code postal" value={form.zip ?? ''}
              onChange={(v) => set('zip', v)} placeholder="00228" />
            <Field id="country" label="Pays" value={form.country}
              onChange={(v) => set('country', v)} placeholder="Togo" />
          </div>
        </div>
      </SectionCard>

      {/* Services */}
      <SectionCard
        title="Services proposés"
        description="Listez vos prestations — elles apparaîtront sur vos documents PDF (factures, devis)."
      >
        <div className="space-y-1">
          <Label htmlFor="services">Services du cabinet</Label>
          <Textarea
            id="services"
            value={form.services}
            onChange={(e) => set('services', e.target.value)}
            placeholder={`Ex :\n• Tenue de comptabilité\n• Établissement des déclarations fiscales\n• Audit et commissariat aux comptes\n• Conseil fiscal et juridique\n• Gestion de la paie`}
            className="min-h-[140px]"
          />
          <p className="text-xs text-gray-400">
            Utilisez une ligne par service pour un meilleur affichage sur le PDF.
          </p>
        </div>
      </SectionCard>

      {/* Signataire */}
      <SectionCard
        title="Signataire des factures"
        description="Nom et fonction affichés dans le bloc signature en bas de chaque facture PDF."
      >
        <div className="grid grid-cols-2 gap-4">
          <Field id="signer_name" label="Nom du signataire" value={form.signer_name}
            onChange={(v) => set('signer_name', v)} placeholder="Ex : KOFFI Amela" />
          <Field id="signer_title" label="Fonction / Titre" value={form.signer_title}
            onChange={(v) => set('signer_title', v)} placeholder="Ex : Directeur Général" />
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex h-10 w-48 items-center justify-center rounded-lg text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
        >
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
