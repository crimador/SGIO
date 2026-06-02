'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, FileText, Users, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import useSWR from 'swr';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import fetcher from '@/lib/fetcher';

type Notification = {
  total: number;
  invoicesOverdue: Array<{
    id: string;
    number: string;
    totalTTC: number;
    dueDate: string | null;
    crmAccount: { name: string } | null;
    occasionalClient: { name: string } | null;
  }>;
  hrRequests: Array<{
    id: string;
    type: string;
    employee: { firstName: string; lastName: string };
    createdAt: string;
  }>;
  overdueOpportunities: Array<{
    id: string;
    name: string | null;
    close_date: string | null;
    assigned_to_user: { name: string } | null;
  }>;
};

const REQUEST_LABELS: Record<string, string> = {
  Vacation: 'Congé annuel',
  Leave: 'Congé exceptionnel',
  Sick: 'Arrêt maladie',
  Raise: 'Augmentation',
  Training: 'Formation',
  Documents: 'Documents',
  Other: 'Autre',
};

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data, mutate } = useSWR<Notification>('/api/notifications', fetcher, {
    refreshInterval: 60_000,
  });

  const total = data?.total ?? 0;

  function dismiss(
    kind: 'invoice' | 'hr' | 'opportunity',
    id: string,
    href: string,
  ) {
    setOpen(false);

    if (data) {
      const next: Notification = {
        invoicesOverdue:      kind === 'invoice'     ? data.invoicesOverdue.filter(x => x.id !== id)     : data.invoicesOverdue,
        hrRequests:           kind === 'hr'          ? data.hrRequests.filter(x => x.id !== id)          : data.hrRequests,
        overdueOpportunities: kind === 'opportunity' ? data.overdueOpportunities.filter(x => x.id !== id): data.overdueOpportunities,
        total: 0,
      };
      next.total = next.invoicesOverdue.length + next.hrRequests.length + next.overdueOpportunities.length;
      mutate(next, false);
    }

    router.push(href);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-gray-100">
          <Bell className="h-5 w-5" />
          {total > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {total > 9 ? '9+' : total}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="font-semibold">Notifications</p>
          {total > 0 && (
            <span className="inline-flex items-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">{total}</span>
          )}
        </div>
        <div className="h-px bg-gray-100" />

        <div className="max-h-[420px] overflow-y-auto">
          {total === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Bell className="mb-2 h-8 w-8 opacity-20" />
              <p className="text-sm">Aucune alerte</p>
            </div>
          )}

          {/* Factures en retard */}
          {(data?.invoicesOverdue.length ?? 0) > 0 && (
            <div>
              <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-destructive">
                <FileText className="h-3 w-3" />
                Factures en retard ({data!.invoicesOverdue.length})
              </div>
              {data!.invoicesOverdue.map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => dismiss('invoice', inv.id, `/finance/invoices/${inv.id}`)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{inv.number}</span>
                    <span className="text-destructive text-xs font-semibold">
                      {new Intl.NumberFormat('fr-FR').format(inv.totalTTC)} F
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-gray-400">
                    {inv.crmAccount?.name ?? inv.occasionalClient?.name ?? 'Client inconnu'}
                    {inv.dueDate && ` · échue le ${format(new Date(inv.dueDate), 'dd MMM', { locale: fr })}`}
                  </div>
                </button>
              ))}
              <div className="h-px bg-gray-100" />
            </div>
          )}

          {/* Demandes RH en attente */}
          {(data?.hrRequests.length ?? 0) > 0 && (
            <div>
              <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-amber-600">
                <Users className="h-3 w-3" />
                Demandes RH ({data!.hrRequests.length})
              </div>
              {data!.hrRequests.map((req) => (
                <button
                  key={req.id}
                  onClick={() => dismiss('hr', req.id, '/hr/conges')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100/50"
                >
                  <div className="font-medium">
                    {req.employee.firstName} {req.employee.lastName}
                  </div>
                  <div className="mt-0.5 text-xs text-gray-400">
                    {REQUEST_LABELS[req.type] ?? req.type}
                    {' · '}
                    {format(new Date(req.createdAt), 'dd MMM', { locale: fr })}
                  </div>
                </button>
              ))}
              <div className="h-px bg-gray-100" />
            </div>
          )}

          {/* Opportunités en retard */}
          {(data?.overdueOpportunities.length ?? 0) > 0 && (
            <div>
              <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-orange-600">
                <TrendingUp className="h-3 w-3" />
                Opportunités en retard ({data!.overdueOpportunities.length})
              </div>
              {data!.overdueOpportunities.map((opp) => (
                <button
                  key={opp.id}
                  onClick={() => dismiss('opportunity', opp.id, `/crm/opportunities/${opp.id}`)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100/50"
                >
                  <div className="font-medium">{opp.name ?? 'Opportunité sans nom'}</div>
                  <div className="mt-0.5 text-xs text-gray-400">
                    {opp.assigned_to_user?.name ?? 'Non assigné'}
                    {opp.close_date && ` · clôture ${format(new Date(opp.close_date), 'dd MMM', { locale: fr })}`}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {total > 0 && (
          <>
            <div className="h-px bg-gray-100" />
            <div className="px-4 py-2 text-center">
              <p className="text-xs text-gray-400">{total} alerte{total > 1 ? 's' : ''} au total</p>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
