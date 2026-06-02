'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isSameMonth, addMonths, subMonths, getDay, isToday, isPast,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type Opportunity = {
  id: string;
  name: string | null;
  close_date: string | null;
  budget: number;
  assigned_to_user: { name: string } | null;
  assigned_sales_stage: { name: string } | null;
};

type Props = { opportunities: Opportunity[] };

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export function CrmCalendarView({ opportunities }: Props) {
  const router = useRouter();
  const [current, setCurrent] = useState(new Date());

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startOffset = (getDay(monthStart) + 6) % 7;

  const oppsFor = (day: Date) =>
    opportunities.filter(o => o.close_date && isSameDay(new Date(o.close_date), day));

  const totalMonth = opportunities.filter(o => {
    if (!o.close_date) return false;
    const d = new Date(o.close_date);
    return isSameMonth(d, current);
  }).length;

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-[#FF7E00]/[0.06]"
            style={{ color: '#1E1D3D' }}
            onClick={() => setCurrent(subMonths(current, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="text-lg font-semibold capitalize">
            {format(current, 'MMMM yyyy', { locale: fr })}
          </h2>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-[#FF7E00]/[0.06]"
            style={{ color: '#1E1D3D' }}
            onClick={() => setCurrent(addMonths(current, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium" style={{ color: '#1E1D3D' }}>
            {totalMonth} opportunité{totalMonth > 1 ? 's' : ''} ce mois
          </span>
          <button
            className="flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors hover:bg-[#FF7E00]/[0.06]"
            style={{ color: '#1E1D3D' }}
            onClick={() => setCurrent(new Date())}
          >
            Aujourd&apos;hui
          </button>
        </div>
      </div>

      {/* Grille calendrier */}
      <div className="rounded-lg border overflow-hidden">
        {/* En-têtes jours */}
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {DAYS.map(d => (
            <div key={d} className="py-2 text-center text-xs font-medium text-gray-400">
              {d}
            </div>
          ))}
        </div>

        {/* Cases */}
        <div className="grid grid-cols-7">
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] border-b border-r bg-gray-50/50" />
          ))}

          {days.map((day) => {
            const dayOpps = oppsFor(day);
            const isCurrentDay = isToday(day);
            const isPastDay = isPast(day) && !isCurrentDay;

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[100px] border-b border-r p-1 ${
                  isPastDay && dayOpps.length > 0 ? 'bg-red-50/50' : ''
                } ${isCurrentDay ? 'bg-[#FF7E00]/5' : ''}`}
              >
                <div className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                  isCurrentDay
                    ? 'text-white'
                    : 'text-gray-400'
                }`} style={isCurrentDay ? { background: '#1E1D3D' } : {}}>
                  {format(day, 'd')}
                </div>

                <div className="space-y-0.5">
                  {dayOpps.slice(0, 2).map(opp => (
                    <Popover key={opp.id}>
                      <PopoverTrigger asChild>
                        <button className={`w-full truncate rounded px-1 py-0.5 text-left text-[11px] font-medium transition-colors hover:opacity-80 ${
                          isPastDay
                            ? 'bg-red-100 text-red-700'
                            : 'bg-[#FF7E00]/15 text-[#FF7E00]'
                        }`}>
                          {opp.name ?? 'Sans nom'}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-3" align="start">
                        <p className="font-semibold text-sm" style={{ color: '#1E1D3D' }}>{opp.name ?? 'Opportunité sans nom'}</p>
                        <div className="my-2 h-px bg-gray-100" />
                        <div className="space-y-1 text-xs text-gray-400">
                          {opp.assigned_sales_stage && (
                            <p>Stade : <span className="font-medium text-gray-700">{opp.assigned_sales_stage.name}</span></p>
                          )}
                          {opp.assigned_to_user && (
                            <p>Responsable : <span className="font-medium text-gray-700">{opp.assigned_to_user.name}</span></p>
                          )}
                          {opp.budget > 0 && (
                            <p>Budget : <span className="font-medium text-gray-700">{new Intl.NumberFormat('fr-FR').format(opp.budget)} FCFA</span></p>
                          )}
                          {opp.close_date && (
                            <p className={isPastDay ? 'text-red-500 font-medium' : ''}>
                              Clôture : {format(new Date(opp.close_date), 'dd MMMM yyyy', { locale: fr })}
                              {isPastDay && ' ⚠ En retard'}
                            </p>
                          )}
                        </div>
                        <button
                          className="mt-3 flex h-8 w-full items-center justify-center rounded-lg text-sm font-semibold text-white transition-all active:scale-[0.98]"
                          style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
                          onClick={() => router.push(`/crm/opportunities/${opp.id}`)}
                        >
                          Ouvrir
                        </button>
                      </PopoverContent>
                    </Popover>
                  ))}

                  {dayOpps.length > 2 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full rounded px-1 py-0.5 text-left text-[11px] text-gray-400 hover:bg-gray-50">
                          +{dayOpps.length - 2} autre{dayOpps.length - 2 > 1 ? 's' : ''}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-3" align="start">
                        <p className="mb-2 text-xs font-semibold text-gray-400">
                          {format(day, 'EEEE d MMMM', { locale: fr })}
                        </p>
                        <div className="space-y-2">
                          {dayOpps.slice(2).map(opp => (
                            <button
                              key={opp.id}
                              onClick={() => router.push(`/crm/opportunities/${opp.id}`)}
                              className="w-full rounded p-2 text-left text-xs hover:bg-gray-50"
                            >
                              <p className="font-medium">{opp.name ?? 'Sans nom'}</p>
                              <p className="text-gray-400">{opp.assigned_to_user?.name ?? '—'}</p>
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Légende */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-[#FF7E00]/15" />
          <span>Clôture prévue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-red-100" />
          <span>En retard</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full" style={{ background: '#1E1D3D' }} />
          <span>Aujourd&apos;hui</span>
        </div>
      </div>
    </div>
  );
}
