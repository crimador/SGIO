'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { User, Calendar, FileText, Briefcase, Plus, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const REQUEST_LABELS: Record<string, string> = {
  Vacation: 'Congé annuel', Leave: 'Congé exceptionnel', Sick: 'Arrêt maladie',
  Raise: 'Augmentation', Training: 'Formation', Documents: 'Documents', Other: 'Autre',
};

const REQUEST_STATUS: Record<string, { label: string; color: string }> = {
  EN_ATTENTE:  { label: 'En attente',  color: 'bg-yellow-100 text-yellow-700' },
  APPROUVE:    { label: 'Approuvé',    color: 'bg-green-100 text-green-700' },
  REJETE:      { label: 'Rejeté',      color: 'bg-red-100 text-red-600' },
};

const PAYSLIP_STATUS: Record<string, { label: string; color: string }> = {
  BROUILLON: { label: 'Brouillon', color: 'bg-gray-100 text-gray-600' },
  EMIS:      { label: 'Émis',      color: 'bg-blue-100 text-blue-700' },
  PAYE:      { label: 'Payé',      color: 'bg-green-100 text-green-700' },
};

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n));
}

type Props = {
  data: {
    employee: { id: string; firstName: string; lastName: string; position: string | null; onBoarding: Date | null };
    requests: any[];
    payslips: any[];
    boards: any[];
  };
};

export default function EmployeeDashboard({ data }: Props) {
  const { employee, requests, payslips, boards } = data;

  return (
    <div className="space-y-6">

      {/* Bienvenue */}
      <Card className="border-[#FF7E00]/20 bg-[#FF7E00]/5">
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF7E00]/10">
            <User className="h-6 w-6 text-[#FF7E00]" />
          </div>
          <div>
            <p className="text-lg font-bold">{employee.firstName} {employee.lastName}</p>
            <p className="text-sm text-gray-400">
              {employee.position ?? 'Employé'}
              {employee.onBoarding && ` · Depuis ${format(new Date(employee.onBoarding), 'MMMM yyyy', { locale: fr })}`}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        {/* Congés & demandes */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <p className="text-sm font-bold flex items-center justify-between" style={{ color: '#1E1D3D' }}>
              <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Mes demandes</span>
              <Link href="/hr/conges" className="text-xs text-[#FF7E00] hover:underline flex items-center gap-1">
                Voir tout <ArrowRight className="h-3 w-3" />
              </Link>
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {requests.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Aucune demande</p>
            ) : (
              requests.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{REQUEST_LABELS[r.type] ?? r.type}</p>
                    <p className="text-xs text-gray-400">
                      {r.startDate && format(new Date(r.startDate), 'dd MMM yyyy', { locale: fr })}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${REQUEST_STATUS[r.status]?.color ?? 'bg-gray-100 text-gray-600'}`}>
                    {REQUEST_STATUS[r.status]?.label ?? r.status}
                  </span>
                </div>
              ))
            )}
            <Link
              href="/hr/conges"
              className="mt-2 flex h-8 w-full items-center justify-center gap-1 rounded-md border text-sm font-medium transition-colors hover:bg-gray-50"
              style={{ color: '#1E1D3D' }}
            >
              <Plus className="mr-1 h-3 w-3" /> Nouvelle demande
            </Link>
          </CardContent>
        </Card>

        {/* Fiches de paie */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <p className="text-sm font-bold flex items-center justify-between" style={{ color: '#1E1D3D' }}>
              <span className="flex items-center gap-2"><FileText className="h-4 w-4" /> Mes bulletins de paie</span>
              <Link href="/hr/payslip" className="text-xs text-[#FF7E00] hover:underline flex items-center gap-1">
                Voir tout <ArrowRight className="h-3 w-3" />
              </Link>
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {payslips.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Aucun bulletin disponible</p>
            ) : (
              payslips.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{p.period}</p>
                    <p className="text-xs text-gray-400">{fmt(p.netSalary)} F net</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PAYSLIP_STATUS[p.status]?.color ?? 'bg-gray-100 text-gray-600'}`}>
                    {PAYSLIP_STATUS[p.status]?.label ?? p.status}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Projets */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <p className="text-sm font-bold flex items-center justify-between" style={{ color: '#1E1D3D' }}>
              <span className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> Mes projets</span>
              <Link href="/projects" className="text-xs text-[#FF7E00] hover:underline flex items-center gap-1">
                Voir tout <ArrowRight className="h-3 w-3" />
              </Link>
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {boards.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Aucun projet assigné</p>
            ) : (
              boards.map((b: any) => (
                <Link key={b.id} href={`/projects/boards/${b.id}`}>
                  <div className="flex items-center justify-between rounded-lg border px-3 py-2 hover:bg-gray-100/40 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{b.title}</p>
                      {b.description && <p className="text-xs text-gray-400 truncate">{b.description}</p>}
                    </div>
                    <ArrowRight className="h-3 w-3 text-gray-400 shrink-0" />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
