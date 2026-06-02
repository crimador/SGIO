'use client';

import { BarChart } from '@tremor/react';

const CATEGORY_LABELS: Record<string, string> = {
  LOYER:         'Loyer',
  HONORAIRES:    'Honoraires',
  TRANSPORT:     'Transport',
  FOURNITURES:   'Fournitures',
  COMMUNICATION: 'Communication',
  BANQUE:        'Frais bancaires',
  IMPOTS:        'Impôts',
  SALAIRES:      'Salaires',
  PUBLICITE:     'Publicité',
  MAINTENANCE:   'Entretien',
  AUTRES:        'Autres',
};

function fmt(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA';
}

type MonthlyPoint  = { mois: string; Encaissements: number; Dépenses: number };
type CategoryPoint = { category: string; amount: number; pct: number };

type Props = {
  monthlyData:   MonthlyPoint[];
  topCategories: CategoryPoint[];
};

export function FinanceCharts({ monthlyData, topCategories }: Props) {
  return (
    <div className="space-y-6">

      {/* Graphique Encaissements vs Dépenses */}
      <div className="overflow-hidden rounded-xl border">
        <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
        <div className="p-4">
          <p className="text-sm font-semibold" style={{ color: '#1E1D3D' }}>
            Encaissements vs Dépenses — 6 derniers mois
          </p>
          <p className="mb-4 text-xs text-gray-400">Montants en FCFA</p>
          <BarChart
            data={monthlyData}
            index="mois"
            categories={['Encaissements', 'Dépenses']}
            colors={['orange', 'rose']}
            valueFormatter={fmt}
            yAxisWidth={80}
            className="h-56"
          />
        </div>
      </div>

      {/* Répartition dépenses par catégorie */}
      {topCategories.length > 0 && (
        <div className="overflow-hidden rounded-xl border">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <div className="p-4">
            <p className="mb-4 text-sm font-semibold" style={{ color: '#1E1D3D' }}>
              Répartition des dépenses par catégorie
            </p>
            <div className="space-y-3">
              {topCategories.map((c) => (
                <div key={c.category}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-500">{CATEGORY_LABELS[c.category] ?? c.category}</span>
                    <span className="font-medium" style={{ color: '#1E1D3D' }}>
                      {c.amount.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${c.pct}%`, background: 'linear-gradient(to right, #FF7E00, #FAC731)' }}
                    />
                  </div>
                  <p className="mt-0.5 text-right text-xs text-gray-400">{c.pct}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
