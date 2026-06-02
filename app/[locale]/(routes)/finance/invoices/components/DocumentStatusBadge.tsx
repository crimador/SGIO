'use client';

/* ─ Statuts ─────────────────────────────────────────────────────────────── */
const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  BROUILLON:  { label: 'Brouillon',   cls: 'bg-gray-100 text-gray-600' },
  ENVOYE:     { label: 'Envoyé',      cls: 'bg-[#1E1D3D]/10 text-[#1E1D3D]' },
  ACCEPTE:    { label: 'Accepté',     cls: 'bg-green-100 text-green-700' },
  REFUSE:     { label: 'Refusé',      cls: 'bg-red-100 text-red-700' },
  TRANSFORME: { label: 'Transformé',  cls: 'bg-gray-100 text-gray-500' },
  EMISE:      { label: 'Émise',       cls: 'bg-[#1E1D3D]/10 text-[#1E1D3D]' },
  PAYEE:      { label: 'Payée',       cls: 'bg-green-100 text-green-700' },
  EN_RETARD:  { label: 'En retard',   cls: 'bg-[#FF7E00]/15 text-[#FF7E00] font-semibold' },
  ANNULEE:    { label: 'Annulée',     cls: 'bg-red-100 text-red-600' },
  APPLIQUEE:  { label: 'Appliquée',   cls: 'bg-green-100 text-green-700' },
};

/* ─ Types ────────────────────────────────────────────────────────────────── */
const TYPE_CONFIG: Record<string, { label: string; cls: string }> = {
  DEVIS:   { label: 'Devis',   cls: 'bg-[#1E1D3D]/10 text-[#1E1D3D]' },
  FACTURE: { label: 'Facture', cls: 'bg-[#FF7E00]/15 text-[#FF7E00]' },
  AVOIR:   { label: 'Avoir',   cls: 'bg-[#FAC731]/25 text-amber-700' },
};

/** Retourne EN_RETARD si la facture EMISE a dépassé son échéance */
export function getEffectiveStatus(status: string, dueDate?: string | null): string {
  if (status === 'EMISE' && dueDate) {
    const due = new Date(dueDate);
    due.setHours(23, 59, 59, 999);
    if (due < new Date()) return 'EN_RETARD';
  }
  return status;
}

export function DocumentStatusBadge({
  status,
  dueDate,
}: {
  status: string;
  dueDate?: string | null;
}) {
  const effective = getEffectiveStatus(status, dueDate);
  const { label, cls } = STATUS_CONFIG[effective] ?? { label: effective, cls: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${cls}`}>
      {label}
    </span>
  );
}

export function DocumentTypeBadge({ type }: { type: string }) {
  const { label, cls } = TYPE_CONFIG[type] ?? { label: type, cls: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
