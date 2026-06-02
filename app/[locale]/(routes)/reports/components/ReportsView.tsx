'use client';

import { useState } from 'react';
import { Download, Users, DollarSign, FileText, TrendingDown, Receipt, Palmtree } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTHS = [
  { value: '01', label: 'Janvier' }, { value: '02', label: 'Février' },
  { value: '03', label: 'Mars' },    { value: '04', label: 'Avril' },
  { value: '05', label: 'Mai' },     { value: '06', label: 'Juin' },
  { value: '07', label: 'Juillet' }, { value: '08', label: 'Août' },
  { value: '09', label: 'Septembre'},{ value: '10', label: 'Octobre' },
  { value: '11', label: 'Novembre' },{ value: '12', label: 'Décembre' },
];

const currentYear  = new Date().getFullYear();
const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');

const YEARS = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

// ─── Composant carte d'export ─────────────────────────────────────────────────

function ExportCard({
  icon: Icon, title, description, children,
}: {
  icon: any; title: string; description: string; children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <p className="text-base font-bold flex items-center gap-2" style={{ color: '#1E1D3D' }}>
          <Icon className="h-4 w-4 text-gray-400" />
          {title}
        </p>
        <p className="text-sm text-gray-400">{description}</p>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function ReportsView() {
  const [payslipMonth, setPayslipMonth] = useState(currentMonth);
  const [payslipYear,  setPayslipYear]  = useState(String(currentYear));
  const [requestYear,  setRequestYear]  = useState(String(currentYear));
  const [invoiceMode,  setInvoiceMode]  = useState<'month' | 'year'>('month');
  const [invoiceMonth, setInvoiceMonth] = useState(currentMonth);
  const [invoiceYear,  setInvoiceYear]  = useState(String(currentYear));
  const [expenseYear,  setExpenseYear]  = useState(String(currentYear));

  const payslipUrl  = `/api/exports/payslips?period=${payslipYear}-${payslipMonth}`;
  const requestUrl  = `/api/exports/requests?year=${requestYear}`;
  const invoiceUrl  = invoiceMode === 'month'
    ? `/api/exports/invoices?period=${invoiceYear}-${invoiceMonth}`
    : `/api/exports/invoices?year=${invoiceYear}`;
  const expenseUrl  = `/api/exports/expenses?year=${expenseYear}`;

  return (
    <div className="space-y-8">

      {/* ── Section RH ──────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-4 flex items-center gap-2">
          <Users className="h-4 w-4" /> Ressources Humaines
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* Employés */}
          <ExportCard
            icon={Users}
            title="Liste des employés"
            description="Tous les employés avec coordonnées, poste, salaire et date d'embauche."
          >
            <a href="/api/exports/employees" download>
              <button
                className="flex w-full items-center justify-center gap-2 h-9 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
              >
                <Download className="h-4 w-4" />
                Télécharger CSV
              </button>
            </a>
          </ExportCard>

          {/* Bulletins de paie */}
          <ExportCard
            icon={DollarSign}
            title="Bulletins de paie"
            description="Export des bulletins pour un mois donné (salaires, primes, retenues, statuts)."
          >
            <div className="space-y-3">
              <div className="flex gap-2">
                <Select value={payslipMonth} onValueChange={setPayslipMonth}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={payslipYear} onValueChange={setPayslipYear}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <a href={payslipUrl} download>
                <button
                  className="flex w-full items-center justify-center gap-2 h-9 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
                >
                  <Download className="h-4 w-4" />
                  Télécharger CSV
                </button>
              </a>
            </div>
          </ExportCard>

          {/* Solde de congés */}
          <ExportCard
            icon={Palmtree}
            title="Solde de congés"
            description="Solde actuel de chaque employé : jours acquis (2,5/mois), jours pris, jours restants."
          >
            <a href="/api/exports/leave-balance" download>
              <button
                className="flex w-full items-center justify-center gap-2 h-9 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
              >
                <Download className="h-4 w-4" />
                Télécharger CSV
              </button>
            </a>
          </ExportCard>

          {/* Congés & Demandes */}
          <ExportCard
            icon={FileText}
            title="Congés & Demandes"
            description="Toutes les demandes de l'année (congés, augmentations, documents) avec statuts."
          >
            <div className="space-y-3">
              <Select value={requestYear} onValueChange={setRequestYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
              <a href={requestUrl} download>
                <button
                  className="flex w-full items-center justify-center gap-2 h-9 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
                >
                  <Download className="h-4 w-4" />
                  Télécharger CSV
                </button>
              </a>
            </div>
          </ExportCard>
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* ── Section Finance ──────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-4 flex items-center gap-2">
          <DollarSign className="h-4 w-4" /> Finance & Facturation
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* Factures */}
          <ExportCard
            icon={Receipt}
            title="Factures & Documents"
            description="Export des factures, devis et avoirs avec montants HT/TTC, TVA, statuts et encaissements."
          >
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  className="flex flex-1 h-8 items-center justify-center rounded-md text-sm font-medium transition-all active:scale-[0.98]"
                  onClick={() => setInvoiceMode('month')}
                  style={invoiceMode === 'month'
                    ? { background: 'linear-gradient(135deg, #FF7E00, #e8950a)', color: 'white' }
                    : { border: '1px solid #e5e7eb', color: '#1E1D3D' }}
                >
                  Par mois
                </button>
                <button
                  className="flex flex-1 h-8 items-center justify-center rounded-md text-sm font-medium transition-all active:scale-[0.98]"
                  onClick={() => setInvoiceMode('year')}
                  style={invoiceMode === 'year'
                    ? { background: 'linear-gradient(135deg, #FF7E00, #e8950a)', color: 'white' }
                    : { border: '1px solid #e5e7eb', color: '#1E1D3D' }}
                >
                  Toute l&apos;année
                </button>
              </div>
              {invoiceMode === 'month' && (
                <div className="flex gap-2">
                  <Select value={invoiceMonth} onValueChange={setInvoiceMonth}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={invoiceYear} onValueChange={setInvoiceYear}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {invoiceMode === 'year' && (
                <Select value={invoiceYear} onValueChange={setInvoiceYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              <a href={invoiceUrl} download>
                <button
                  className="flex w-full items-center justify-center gap-2 h-9 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
                >
                  <Download className="h-4 w-4" />
                  Télécharger CSV
                </button>
              </a>
            </div>
          </ExportCard>

          {/* Dépenses */}
          <ExportCard
            icon={TrendingDown}
            title="Dépenses"
            description="Export des charges et dépenses de l'année par catégorie avec moyens de paiement."
          >
            <div className="space-y-3">
              <Select value={expenseYear} onValueChange={setExpenseYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
              <a href={expenseUrl} download>
                <button
                  className="flex w-full items-center justify-center gap-2 h-9 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
                >
                  <Download className="h-4 w-4" />
                  Télécharger CSV
                </button>
              </a>
            </div>
          </ExportCard>
        </div>
      </div>

      {/* ── Note format ─────────────────────────────────────────────────────── */}
      <div className="rounded-lg border bg-gray-50 px-4 py-3">
        <p className="text-xs text-gray-400">
          Tous les fichiers sont au format <strong>CSV (séparateur point-virgule)</strong>, compatibles avec Excel, LibreOffice Calc et Google Sheets.
          Pour ouvrir dans Excel : Données → Obtenir des données → À partir d&apos;un fichier texte/CSV, sélectionner le séparateur <em>point-virgule</em>.
        </p>
      </div>

    </div>
  );
}
