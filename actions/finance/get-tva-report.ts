import { prismadb } from '@/lib/prisma';

export type TvaPeriodType = 'MENSUEL' | 'TRIMESTRIEL';

export type TvaLineGroup = {
  regime:   string;
  label:    string;
  count:    number;
  baseHT:   number;
  tva:      number;
  totalTTC: number;
};

export type TvaDocRow = {
  id:        string;
  number:    string;
  type:      string;
  issueDate: string;
  client:    string;
  regime:    string;
  baseHT:    number;
  tva:       number;
  totalTTC:  number;
};

export type TvaReport = {
  periodLabel:        string;
  start:              string;
  end:                string;
  facturesGroups:     TvaLineGroup[];
  avoirsGroups:       TvaLineGroup[];
  totalFactureHT:     number;
  totalFactureTVA:    number;
  totalAvoirHT:       number;
  totalAvoirTVA:      number;
  tvaCollecteeNette:  number;
  documents:          TvaDocRow[];
};

const REGIME_LABELS: Record<string, string> = {
  NORMAL:  'Assujetti TVA (18%)',
  EXONERE: 'Exonéré de TVA (0%)',
  TPU:     'Régime TPU',
};

const QUARTER_MONTHS: Record<number, { start: number; end: number; label: string }> = {
  1: { start: 0,  end: 2,  label: '1er trimestre (Jan–Mar)' },
  2: { start: 3,  end: 5,  label: '2e trimestre (Avr–Jui)' },
  3: { start: 6,  end: 8,  label: '3e trimestre (Jui–Sep)' },
  4: { start: 9,  end: 11, label: '4e trimestre (Oct–Déc)' },
};

const MONTH_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

function groupByRegime(docs: { tvaRegime: string; totalHT: number; totalTVA: number; totalTTC: number }[]): TvaLineGroup[] {
  const map: Record<string, TvaLineGroup> = {};
  for (const doc of docs) {
    const r = doc.tvaRegime;
    if (!map[r]) map[r] = { regime: r, label: REGIME_LABELS[r] ?? r, count: 0, baseHT: 0, tva: 0, totalTTC: 0 };
    map[r].count++;
    map[r].baseHT   += doc.totalHT;
    map[r].tva      += doc.totalTVA;
    map[r].totalTTC += doc.totalTTC;
  }
  return Object.values(map).sort((a, b) => a.regime.localeCompare(b.regime));
}

export async function getTvaReport(params: {
  type:     TvaPeriodType;
  year:     number;
  month?:   number; // 1-12 pour MENSUEL
  quarter?: number; // 1-4  pour TRIMESTRIEL
}): Promise<TvaReport> {
  const { type, year } = params;

  let start: Date;
  let end:   Date;
  let periodLabel: string;

  if (type === 'MENSUEL') {
    const m = (params.month ?? 1) - 1; // 0-indexed
    start = new Date(year, m, 1);
    end   = new Date(year, m + 1, 0, 23, 59, 59, 999);
    periodLabel = `${MONTH_LABELS[m]} ${year}`;
  } else {
    const q = params.quarter ?? 1;
    const { start: sm, end: em, label } = QUARTER_MONTHS[q];
    start = new Date(year, sm, 1);
    end   = new Date(year, em + 1, 0, 23, 59, 59, 999);
    periodLabel = `${label} ${year}`;
  }

  const docs = await prismadb.billingDocument.findMany({
    where: {
      type:       { in: ['FACTURE', 'AVOIR'] },
      issueDate:  { gte: start, lte: end },
    },
    include: {
      crmAccount:      { select: { name: true } },
      occasionalClient: { select: { name: true } },
    },
    orderBy: { issueDate: 'asc' },
  });

  const factures = docs.filter((d) => d.type === 'FACTURE');
  const avoirs   = docs.filter((d) => d.type === 'AVOIR');

  const facturesGroups  = groupByRegime(factures);
  const avoirsGroups    = groupByRegime(avoirs);
  const totalFactureTVA = factures.reduce((s, d) => s + d.totalTVA, 0);
  const totalAvoirTVA   = avoirs.reduce((s, d) => s + d.totalTVA, 0);

  const documents: TvaDocRow[] = docs.map((d) => ({
    id:        d.id,
    number:    d.number,
    type:      d.type,
    issueDate: d.issueDate.toISOString(),
    client:    d.crmAccount?.name ?? d.occasionalClient?.name ?? '—',
    regime:    d.tvaRegime,
    baseHT:    d.totalHT,
    tva:       d.totalTVA,
    totalTTC:  d.totalTTC,
  }));

  return {
    periodLabel,
    start:             start.toISOString(),
    end:               end.toISOString(),
    facturesGroups,
    avoirsGroups,
    totalFactureHT:    factures.reduce((s, d) => s + d.totalHT,  0),
    totalFactureTVA,
    totalAvoirHT:      avoirs.reduce((s, d) => s + d.totalHT,  0),
    totalAvoirTVA,
    tvaCollecteeNette: totalFactureTVA - totalAvoirTVA,
    documents,
  };
}
