import { differenceInMonths } from 'date-fns';

export const ACCRUAL_RATE = 2.5; // jours par mois (standard OHADA/Togo)

// Jours légalement accordés par sous-type (code du travail togolais)
// Art. 134 — Loi N°2006-010 du 13 décembre 2006 portant Code du travail au Togo
export const LEGAL_DAYS_BY_SUBTYPE: Record<string, { label: string; days: number }> = {
  mariage_propre:        { label: 'Mariage du travailleur',           days: 4 },
  mariage_enfant:        { label: 'Mariage d\'un enfant',             days: 2 },
  naissance:             { label: 'Naissance / adoption d\'un enfant',days: 3 },
  deces_conjoint:        { label: 'Décès du conjoint',                days: 5 },
  deces_enfant:          { label: 'Décès d\'un enfant',               days: 5 },
  deces_parent:          { label: 'Décès du père ou de la mère',      days: 3 },
  deces_beau_parent:     { label: 'Décès beau-père / belle-mère',     days: 3 },
  deces_frere_soeur:     { label: 'Décès frère / sœur',               days: 2 },
  demenagement:          { label: 'Déménagement',                     days: 1 },
  communion:             { label: 'Communion / baptême d\'un enfant', days: 1 },
  autre_exceptionnel:    { label: 'Autre (exceptionnel)',             days: 0 },
};

export type LeaveBalance = {
  accrued:         number; // jours acquis total (ancienneté × 2,5)
  used:            number; // jours effectivement déduits du solde
  remaining:       number; // solde restant
  months:          number; // ancienneté en mois
  vacationDays:    number; // jours pris en congé annuel
  excessLeaveDays: number; // jours de congé exceptionnel imputés sur le solde
};

type RequestForBalance = {
  type:         string;
  status:       string;
  numberOfDays: number | null;
  legalDays?:   number | null;
};

export function calcLeaveBalance(
  onBoarding: Date | string | null | undefined,
  requests:   RequestForBalance[]
): LeaveBalance | null {
  if (!onBoarding) return null;

  const months  = Math.max(0, differenceInMonths(new Date(), new Date(onBoarding)));
  const accrued = Math.floor(months * ACCRUAL_RATE);

  const approved = requests.filter(r => r.status === 'APPROUVE');

  // Congés annuels : intégralement déduits
  const vacationDays = approved
    .filter(r => r.type === 'Vacation')
    .reduce((s, r) => s + (r.numberOfDays ?? 0), 0);

  // Congés exceptionnels : seul l'excédent sur les jours légaux est déduit
  const excessLeaveDays = approved
    .filter(r => r.type === 'Leave')
    .reduce((s, r) => {
      const total = r.numberOfDays ?? 0;
      const legal = r.legalDays   ?? 0;
      return s + Math.max(0, total - legal);
    }, 0);

  const used      = vacationDays + excessLeaveDays;
  const remaining = accrued - used;

  return { accrued, used, remaining, months, vacationDays, excessLeaveDays };
}
