export const DAILY_THRESHOLD = 8; // heures normales par jour

export type OvertimeDay = {
  date:          string; // YYYY-MM-DD
  totalHours:    number;
  regularHours:  number;
  overtimeHours: number;
};

export type OvertimeSummary = {
  days:          OvertimeDay[];
  totalWorked:   number;
  regularHours:  number;
  overtimeHours: number;
};

export function calcOvertimeForPeriod(
  timekeeping: { timeIn: string; timeOut?: string | null }[],
  period:      string // 'YYYY-MM'
): OvertimeSummary {
  const [year, month] = period.split('-').map(Number);

  const byDay: Record<string, number> = {};
  for (const t of timekeeping) {
    if (!t.timeOut) continue;
    const d = new Date(t.timeIn);
    if (d.getFullYear() !== year || d.getMonth() + 1 !== month) continue;
    const h = (new Date(t.timeOut).getTime() - new Date(t.timeIn).getTime()) / 3_600_000;
    if (h <= 0) continue;
    const key = new Date(t.timeIn).toISOString().slice(0, 10);
    byDay[key] = (byDay[key] ?? 0) + h;
  }

  const days: OvertimeDay[] = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, totalHours]) => {
      const overtimeHours = Math.max(0, totalHours - DAILY_THRESHOLD);
      return { date, totalHours, regularHours: totalHours - overtimeHours, overtimeHours };
    });

  const totalWorked   = days.reduce((s, d) => s + d.totalHours, 0);
  const overtimeHours = days.reduce((s, d) => s + d.overtimeHours, 0);

  return { days, totalWorked, regularHours: totalWorked - overtimeHours, overtimeHours };
}
