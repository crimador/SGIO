'use client';

import Link from 'next/link';
import {
  Target, Landmark, Users, TrendingUp,
  FileText, UserCheck, Briefcase, CheckSquare, Search,
} from 'lucide-react';

type Props = {
  results: any;
  search: string | null;
};

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n));
}

function Section({
  icon: Icon, title, count, children,
}: {
  icon: any; title: string; count: number; children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">{title}</h2>
        <span className="inline-flex items-center rounded-sm bg-gray-100 px-1.5 py-0.5 text-xs font-normal">{count}</span>
      </div>
      <div className="space-y-1">{children}</div>
      <div className="mt-4 h-px bg-gray-100" />
    </div>
  );
}

function ResultRow({ href, primary, secondary, right }: {
  href: string; primary: string; secondary?: string; right?: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <div className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-100/50 transition-colors border border-transparent hover:border-gray-200">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{primary}</p>
          {secondary && <p className="text-xs text-gray-400 truncate">{secondary}</p>}
        </div>
        {right && <div className="shrink-0 ml-3">{right}</div>}
      </div>
    </Link>
  );
}

const STATUS_LABELS: Record<string, string> = {
  BROUILLON: 'Brouillon', EMISE: 'Émise', PAYEE: 'Payée', ANNULEE: 'Annulée',
  ACTIVE: 'Active', CONVERTED: 'Converti', INACTIVE: 'Inactif',
};

export default function ResultPage({ results, search }: Props) {
  const data = results?.data ?? {};

  const opportunities:    any[] = data.opportunities    ?? [];
  const accounts:         any[] = data.accounts         ?? [];
  const contacts:         any[] = data.contacts         ?? [];
  const leads:            any[] = data.leads            ?? [];
  const billingDocuments: any[] = data.billingDocuments ?? [];
  const employees:        any[] = data.employees        ?? [];
  const tasks:            any[] = data.tasks            ?? [];
  const projects:         any[] = data.projects         ?? [];

  const total = opportunities.length + accounts.length + contacts.length +
    leads.length + billingDocuments.length + employees.length +
    tasks.length + projects.length;

  if (!search) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Search className="h-12 w-12 mb-4 opacity-30" />
        <p className="text-lg font-medium">Entrez un terme de recherche</p>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Search className="h-12 w-12 mb-4 opacity-30" />
        <p className="text-lg font-medium">Aucun résultat pour « {search} »</p>
        <p className="text-sm mt-1">Essayez un autre terme ou vérifiez l&apos;orthographe.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <p className="text-sm text-gray-400">
        {total} résultat{total > 1 ? 's' : ''} pour <span className="font-medium text-gray-900">« {search} »</span>
      </p>

      <Section icon={Target} title="Opportunités CRM" count={opportunities.length}>
        {opportunities.map((o: any) => (
          <ResultRow
            key={o.id}
            href={`/crm/opportunities/${o.id}`}
            primary={o.name}
            secondary={o.budget ? `Budget : ${fmt(o.budget)} F` : undefined}
            right={o.status && <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium" style={{ color: '#1E1D3D' }}>{STATUS_LABELS[o.status] ?? o.status}</span>}
          />
        ))}
      </Section>

      <Section icon={Landmark} title="Comptes CRM" count={accounts.length}>
        {accounts.map((a: any) => (
          <ResultRow
            key={a.id}
            href={`/crm/accounts/${a.id}`}
            primary={a.name}
            secondary={a.email ?? undefined}
            right={a.type && <span className="inline-flex items-center rounded-sm bg-gray-100 px-1 text-xs font-normal">{a.type}</span>}
          />
        ))}
      </Section>

      <Section icon={Users} title="Contacts CRM" count={contacts.length}>
        {contacts.map((c: any) => (
          <ResultRow
            key={c.id}
            href={`/crm/contacts/${c.id}`}
            primary={`${c.first_name ?? ''} ${c.last_name ?? ''}`.trim()}
            secondary={c.email ?? undefined}
          />
        ))}
      </Section>

      <Section icon={TrendingUp} title="Prospects (Leads)" count={leads.length}>
        {leads.map((l: any) => (
          <ResultRow
            key={l.id}
            href={`/crm/leads/${l.id}`}
            primary={`${l.firstName ?? ''} ${l.lastName ?? ''}`.trim()}
            secondary={[l.company, l.email].filter(Boolean).join(' · ')}
            right={l.status && <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium" style={{ color: '#1E1D3D' }}>{STATUS_LABELS[l.status] ?? l.status}</span>}
          />
        ))}
      </Section>

      <Section icon={FileText} title="Documents de facturation" count={billingDocuments.length}>
        {billingDocuments.map((d: any) => {
          const client = d.crmAccount?.name ?? d.occasionalClient?.name ?? '—';
          return (
            <ResultRow
              key={d.id}
              href={`/finance/invoices/${d.id}`}
              primary={d.number}
              secondary={client}
              right={
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{fmt(d.totalTTC)} F</span>
                  <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium" style={{ color: '#1E1D3D' }}>{STATUS_LABELS[d.status] ?? d.status}</span>
                </div>
              }
            />
          );
        })}
      </Section>

      <Section icon={UserCheck} title="Employés" count={employees.length}>
        {employees.map((e: any) => (
          <ResultRow
            key={e.id}
            href={`/hr/employees/${e.id}`}
            primary={`${e.firstName} ${e.lastName}`}
            secondary={[e.position, e.email].filter(Boolean).join(' · ')}
          />
        ))}
      </Section>

      <Section icon={CheckSquare} title="Tâches" count={tasks.length}>
        {tasks.map((t: any) => (
          <ResultRow
            key={t.id}
            href={`/projects`}
            primary={t.title}
            right={t.taskStatus && <span className="inline-flex items-center rounded-sm bg-gray-100 px-1 text-xs font-normal">{t.taskStatus}</span>}
          />
        ))}
      </Section>

      <Section icon={Briefcase} title="Projets" count={projects.length}>
        {projects.map((p: any) => (
          <ResultRow
            key={p.id}
            href={`/projects/${p.id}`}
            primary={p.title}
          />
        ))}
      </Section>
    </div>
  );
}
