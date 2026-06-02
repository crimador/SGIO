import { getTogoHolidays, isTogoHoliday } from './public-holidays';

// Compte les jours ouvrables entre start et end (inclus)
// Exclut samedis, dimanches et jours fériés togolais
export function countWorkingDays(start: Date, end: Date): number {
  const s = new Date(start); s.setHours(0, 0, 0, 0);
  const e = new Date(end);   e.setHours(0, 0, 0, 0);
  if (s > e) return 0;

  // Pré-charger les jours fériés pour toutes les années concernées
  const holidays: Date[] = [];
  for (let y = s.getFullYear(); y <= e.getFullYear(); y++) {
    holidays.push(...getTogoHolidays(y));
  }

  let count = 0;
  const cur = new Date(s);
  while (cur <= e) {
    const dow = cur.getDay(); // 0=dim, 6=sam
    if (dow !== 0 && dow !== 6 && !isTogoHoliday(cur, holidays)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}
