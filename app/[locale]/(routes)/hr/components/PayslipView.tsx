'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { CheckCircle2, Send, Trash2, Banknote, Download, FileText } from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import RightViewModal from '@/components/modals/right-view-modal';

import { NewPayslipForm } from './NewPayslipForm';

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  salary: number;
  position?: string | null;
};

type Payslip = {
  id: string;
  employeeID: string;
  employee: { firstName: string; lastName: string; position?: string | null };
  period:     string;
  baseSalary: number;
  bonuses:    number;
  deductions: number;
  netSalary:  number;
  status: 'BROUILLON' | 'EMIS' | 'PAYE';
  notes?: string | null;
};

type Props = {
  data: Payslip[];
  employees: Employee[];
};

const MONTHS_FR: Record<string, string> = {
  '01': 'Janvier', '02': 'Février', '03': 'Mars', '04': 'Avril',
  '05': 'Mai', '06': 'Juin', '07': 'Juillet', '08': 'Août',
  '09': 'Septembre', '10': 'Octobre', '11': 'Novembre', '12': 'Décembre',
};

const formatPeriod = (period: string) => {
  const [year, month] = period.split('-');
  return `${MONTHS_FR[month] ?? month} ${year}`;
};

const StatusBadge = ({ status }: { status: Payslip['status'] }) => {
  if (status === 'BROUILLON')
    return <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">Brouillon</span>;
  if (status === 'EMIS')
    return <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Émis</span>;
  return <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Payé</span>;
};

const PayslipView = ({ data, employees }: Props) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const now = new Date();
  const [filterYear, setFilterYear] = useState(now.getFullYear());

  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;

  const filtered = data.filter((p) => p.period.startsWith(String(filterYear)));

  const totalNet = filtered
    .filter((p) => p.status === 'PAYE')
    .reduce((sum, p) => sum + p.netSalary, 0);

  const brouillon = filtered.filter((p) => p.status === 'BROUILLON').length;
  const emis = filtered.filter((p) => p.status === 'EMIS').length;

  const changeStatus = async (id: string, status: string) => {
    setLoadingId(id);
    try {
      await axios.put(`/api/payslip/${id}`, { status });
      toast({ title: `Statut mis à jour : ${status}` });
      router.refresh();
    } catch {
      toast({ variant: 'destructive', title: 'Erreur lors de la mise à jour' });
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce bulletin de paie ?')) return;
    setLoadingId(id);
    try {
      await axios.delete(`/api/payslip/${id}`);
      toast({ title: 'Bulletin supprimé' });
      router.refresh();
    } catch {
      toast({ variant: 'destructive', title: 'Erreur lors de la suppression' });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="overflow-hidden">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardContent className="pb-4 pt-5 text-center">
            <p className="mb-1 text-xs text-gray-400">Net payé ({filterYear})</p>
            <p className="text-2xl font-bold text-green-600">{totalNet.toLocaleString('fr-FR')} FCFA</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-xs text-gray-400">
              <Banknote className="h-3 w-3" /> bulletins payés
            </p>
          </CardContent>
        </Card>
        <Card className={`overflow-hidden ${brouillon > 0 ? 'border-yellow-300' : ''}`}>
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardContent className="pb-4 pt-5 text-center">
            <p className="mb-1 text-xs text-gray-400">En préparation</p>
            <p className={`text-3xl font-bold ${brouillon > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
              {brouillon}
            </p>
            <p className="mt-1 flex items-center justify-center gap-1 text-xs text-gray-400">
              <FileText className="h-3 w-3" /> brouillons
            </p>
          </CardContent>
        </Card>
        <Card className={`overflow-hidden ${emis > 0 ? 'border-blue-300' : ''}`}>
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardContent className="pb-4 pt-5 text-center">
            <p className="mb-1 text-xs text-gray-400">Bulletins émis</p>
            <p className={`text-3xl font-bold ${emis > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
              {emis}
            </p>
            <p className="mt-1 flex items-center justify-center gap-1 text-xs text-gray-400">
              <Send className="h-3 w-3" /> en attente de paiement
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
        <CardHeader className="pb-3 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Année :</span>
              <select
                className="rounded-md border px-3 py-1.5 text-sm"
                style={{ color: '#1E1D3D' }}
                value={filterYear}
                onChange={(e) => setFilterYear(Number(e.target.value))}
              >
                {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-md border px-3 py-1.5">
              <Banknote className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium" style={{ color: '#1E1D3D' }}>
                {totalNet.toLocaleString('fr-FR')} FCFA payés en {filterYear}
              </span>
            </div>

            <RightViewModal label="+ Nouveau bulletin" title="Créer un bulletin de paie" description="">
              <NewPayslipForm employees={employees} />
            </RightViewModal>
          </div>
        </CardHeader>

        <CardContent>
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">
              Aucun bulletin de paie pour {filterYear}
            </p>
          ) : (
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                    <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Employé</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Période</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Base brute</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Primes</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Retenues</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Net à payer</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Statut</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id} className="transition-colors hover:bg-[#FF7E00]/[0.04]">
                      <TableCell className="font-medium" style={{ color: '#1E1D3D' }}>
                        <div>{p.employee.firstName} {p.employee.lastName}</div>
                        {p.employee.position && (
                          <div className="text-xs text-gray-400">{p.employee.position}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{formatPeriod(p.period)}</TableCell>
                      <TableCell className="text-right text-sm">
                        {p.baseSalary.toLocaleString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right text-sm text-green-600">
                        {p.bonuses > 0 ? `+${p.bonuses.toLocaleString('fr-FR')}` : '—'}
                      </TableCell>
                      <TableCell className="text-right text-sm text-red-500">
                        {p.deductions > 0 ? `-${p.deductions.toLocaleString('fr-FR')}` : '—'}
                      </TableCell>
                      <TableCell className="text-right text-sm font-bold" style={{ color: '#FF7E00' }}>
                        {p.netSalary.toLocaleString('fr-FR')} FCFA
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={p.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {p.status === 'BROUILLON' && (
                            <button
                              className="flex h-7 w-7 items-center justify-center rounded-md border transition-colors hover:bg-[#FF7E00]/[0.06] disabled:opacity-50"
                              disabled={loadingId === p.id}
                              onClick={() => changeStatus(p.id, 'EMIS')}
                              title="Émettre le bulletin"
                            >
                              <Send className="h-3.5 w-3.5" style={{ color: '#FF7E00' }} />
                            </button>
                          )}
                          {p.status === 'EMIS' && (
                            <button
                              className="flex h-7 w-7 items-center justify-center rounded-md border transition-colors hover:bg-green-50 disabled:opacity-50"
                              disabled={loadingId === p.id}
                              onClick={() => changeStatus(p.id, 'PAYE')}
                              title="Marquer comme payé"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                            </button>
                          )}
                          <a href={`/api/payslip/${p.id}/pdf`} download title="Télécharger PDF">
                            <button className="flex h-7 w-7 items-center justify-center rounded-md border transition-colors hover:bg-[#FF7E00]/[0.06]">
                              <Download className="h-3.5 w-3.5 text-gray-500" />
                            </button>
                          </a>
                          {p.status !== 'PAYE' && (
                            <button
                              className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-red-50 disabled:opacity-50"
                              disabled={loadingId === p.id}
                              onClick={() => handleDelete(p.id)}
                              title="Supprimer"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PayslipView;
