'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval,
         getDay, addMonths, subMonths, isSameMonth, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

type Request = {
  id:         string;
  employeeID: string;
  employee:   { firstName: string; lastName: string };
  type:       string;
  status:     string;
  startDate:  string;
  endDate:    string | null;
};

type Props = { requests: Request[] };

const TYPE_COLORS: Record<string, string> = {
  Vacation:  'bg-green-100 text-green-800 border-green-200',
  Leave:     'bg-blue-100 text-blue-800 border-blue-200',
  Sick:      'bg-red-100 text-red-800 border-red-200',
  Maternity: 'bg-pink-100 text-pink-800 border-pink-200',
  Training:  'bg-purple-100 text-purple-800 border-purple-200',
};

const TYPE_DOT: Record<string, string> = {
  Vacation:  'bg-green-500',
  Leave:     'bg-blue-500',
  Sick:      'bg-red-500',
  Maternity: 'bg-pink-500',
  Training:  'bg-purple-500',
};

const TYPE_LABELS: Record<string, string> = {
  Vacation:  'Congé annuel',
  Leave:     'Congé exceptionnel',
  Sick:      'Arrêt maladie',
  Maternity: 'Congé maternité',
  Training:  'Formation',
};

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function getApprovedForDay(requests: Request[], day: Date): Request[] {
  const ts = day.getTime();
  return requests.filter((r) => {
    if (r.status !== 'APPROUVE') return false;
    if (!r.endDate) return false;
    const start = new Date(r.startDate); start.setHours(0, 0, 0, 0);
    const end   = new Date(r.endDate);   end.setHours(23, 59, 59, 999);
    return ts >= start.getTime() && ts <= end.getTime();
  });
}

export default function LeaveCalendar({ requests }: Props) {
  const [current, setCurrent] = useState(new Date());

  const monthStart = startOfMonth(current);
  const monthEnd   = endOfMonth(current);
  const days       = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Lundi = 0 dans notre grille (getDay: 0=dim, 1=lun...6=sam → on remap)
  const firstDow = (getDay(monthStart) + 6) % 7; // décalage pour commencer lundi

  // Types présents ce mois (pour la légende)
  const typesThisMonth = [...new Set(
    requests
      .filter(r => r.status === 'APPROUVE' && r.endDate)
      .filter(r => {
        const s = new Date(r.startDate);
        const e = new Date(r.endDate!);
        return s <= monthEnd && e >= monthStart;
      })
      .map(r => r.type)
  )].filter(t => TYPE_LABELS[t]);

  return (
    <Card>
      <CardHeader className="pb-2">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-[#FF7E00]/[0.06]"
            onClick={() => setCurrent(subMonths(current, 1))}
          >
            <ChevronLeft className="h-4 w-4" style={{ color: '#1E1D3D' }} />
          </button>
          <h3 className="text-base font-semibold capitalize" style={{ color: '#1E1D3D' }}>
            {format(current, 'MMMM yyyy', { locale: fr })}
          </h3>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-[#FF7E00]/[0.06]"
            onClick={() => setCurrent(addMonths(current, 1))}
          >
            <ChevronRight className="h-4 w-4" style={{ color: '#1E1D3D' }} />
          </button>
        </div>

        {/* Légende */}
        {typesThisMonth.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {typesThisMonth.map(t => (
              <span key={t} className="flex items-center gap-1 text-xs text-gray-400">
                <span className={`inline-block h-2 w-2 rounded-full ${TYPE_DOT[t] ?? 'bg-gray-400'}`} />
                {TYPE_LABELS[t]}
              </span>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* En-tête jours de semaine */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS_FR.map(d => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Grille des jours */}
        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {/* Cases vides avant le 1er du mois */}
          {Array.from({ length: firstDow }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-muted/30 min-h-[80px]" />
          ))}

          {days.map((day) => {
            const onLeave = getApprovedForDay(requests, day);
            const isCurrentMonth = isSameMonth(day, current);
            const today = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`bg-background min-h-[80px] p-1.5 ${!isCurrentMonth ? 'bg-muted/20' : ''}`}
              >
                {/* Numéro du jour */}
                <div className={`text-xs font-medium mb-1 h-5 w-5 flex items-center justify-center rounded-full
                  ${today ? 'bg-primary text-primary-foreground' : 'text-gray-400'}`}>
                  {format(day, 'd')}
                </div>

                {/* Badges employés en congé */}
                <div className="space-y-0.5">
                  {onLeave.slice(0, 3).map((r) => (
                    <div
                      key={r.id}
                      className={`text-[10px] leading-tight px-1 py-0.5 rounded border truncate
                        ${TYPE_COLORS[r.type] ?? 'bg-gray-100 text-gray-800 border-gray-200'}`}
                      title={`${r.employee.firstName} ${r.employee.lastName} — ${TYPE_LABELS[r.type] ?? r.type}`}
                    >
                      {r.employee.firstName[0]}. {r.employee.lastName}
                    </div>
                  ))}
                  {onLeave.length > 3 && (
                    <div className="text-[10px] text-gray-400 px-1">
                      +{onLeave.length - 3} autre{onLeave.length - 3 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Résumé du mois */}
        {typesThisMonth.length === 0 && (
          <p className="text-sm text-gray-400 text-center pt-6">
            Aucune absence approuvée ce mois-ci.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
