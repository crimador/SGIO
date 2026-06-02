import { addDays } from 'date-fns';

// Algorithme de Butcher — calcule le dimanche de Pâques
function getEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day   = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

// Jours fériés islamiques approximatifs (Togo) — à mettre à jour annuellement
const ISLAMIC_HOLIDAYS: Record<number, [number, number][]> = {
  2024: [[4,10],[6,16],[9,15]],   // Aïd el-Fitr, Aïd el-Adha, Maouloud
  2025: [[3,30],[6, 6],[9, 4]],
  2026: [[3,19],[5,26],[8,25]],
  2027: [[3, 8],[5,16],[8,14]],
  2028: [[2,25],[5, 4],[8, 2]],
  2029: [[2,14],[4,23],[7,22]],
  2030: [[2, 2],[4,12],[7,11]],
};

export function getTogoHolidays(year: number): Date[] {
  const easter = getEaster(year);
  const fixed: Date[] = [
    new Date(year,  0,  1),   // Jour de l'An
    new Date(year,  0, 13),   // Fête nationale (13 janvier)
    new Date(year,  3, 27),   // Fête de l'Indépendance
    new Date(year,  4,  1),   // Fête du Travail
    new Date(year,  7, 15),   // Assomption
    new Date(year, 10,  1),   // Toussaint
    new Date(year, 11, 25),   // Noël
    addDays(easter,  1),      // Lundi de Pâques
    addDays(easter, 39),      // Ascension (Jeudi)
    addDays(easter, 50),      // Lundi de Pentecôte
  ];

  const islamic = (ISLAMIC_HOLIDAYS[year] ?? []).map(
    ([m, d]) => new Date(year, m - 1, d)
  );

  return [...fixed, ...islamic];
}

export function isTogoHoliday(date: Date, holidays: Date[]): boolean {
  return holidays.some(
    h => h.getFullYear() === date.getFullYear()
      && h.getMonth()    === date.getMonth()
      && h.getDate()     === date.getDate()
  );
}
