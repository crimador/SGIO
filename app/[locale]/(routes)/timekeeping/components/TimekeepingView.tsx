'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, differenceInMinutes } from 'date-fns';
import axios from 'axios';
import { CheckCircle2, Trash2, Clock, AlertCircle, Users } from 'lucide-react';

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

import { NewTimekeepingForm } from './NewTimekeepingForm';

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
};

type TimekeepingEntry = {
  id: string;
  employeeID: string;
  employee: { firstName: string; lastName: string; email: string };
  timeIn: string;
  timeOut: string | null;
  verified: boolean;
  createdAt: string;
};

type Props = {
  data: TimekeepingEntry[];
  employees: Employee[];
  translations: {
    title: string;
    employee: string;
    timeIn: string;
    timeOut: string;
    verified: string;
    createTimekeeping: string;
    noTimekeepingFound: string;
  };
};

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const getDuration = (timeIn: string, timeOut: string | null) => {
  if (!timeOut) return '—';
  const diff = differenceInMinutes(new Date(timeOut), new Date(timeIn));
  if (diff <= 0) return '—';
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `${h}h${m.toString().padStart(2, '0')}`;
};

const TimekeepingView = ({ data, employees, translations }: Props) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;

  const filtered = data.filter((e) => {
    const d = new Date(e.timeIn);
    return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
  });

  const totalMinutes = filtered.reduce((acc, e) => {
    if (!e.timeOut) return acc;
    const diff = differenceInMinutes(new Date(e.timeOut), new Date(e.timeIn));
    return acc + (diff > 0 ? diff : 0);
  }, 0);
  const totalH = Math.floor(totalMinutes / 60);
  const totalM = totalMinutes % 60;
  const unverified = filtered.filter((e) => !e.verified).length;

  const handleVerify = async (entry: TimekeepingEntry) => {
    setLoadingId(entry.id);
    try {
      await axios.put('/api/timekeeping', {
        id: entry.id,
        employeeID: entry.employeeID,
        timeIn: entry.timeIn,
        timeOut: entry.timeOut,
        verified: true,
      });
      toast({ title: 'Pointage validé' });
      router.refresh();
    } catch {
      toast({ variant: 'destructive', title: 'Erreur lors de la validation' });
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette entrée de pointage ?')) return;
    setLoadingId(id);
    try {
      await axios.delete(`/api/timekeeping/${id}`);
      toast({ title: 'Entrée supprimée' });
      router.refresh();
    } catch {
      toast({ variant: 'destructive', title: 'Erreur lors de la suppression' });
    } finally {
      setLoadingId(null);
    }
  };

  const uniqueEmployees = new Set(filtered.map((e) => e.employeeID)).size;

  return (
    <div className="space-y-4">
      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <p className="text-xs text-gray-400 mb-1">Heures ce mois</p>
            <p className="text-3xl font-bold text-blue-600">{totalH}h{totalM.toString().padStart(2, '0')}</p>
            <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" /> {filtered.length} entrées
            </p>
          </CardContent>
        </Card>
        <Card className={unverified > 0 ? 'border-orange-300 bg-orange-50' : ''}>
          <CardContent className="pt-5 pb-4 text-center">
            <p className="text-xs text-gray-400 mb-1">Non validés</p>
            <p className={`text-3xl font-bold mt-0 ${unverified > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {unverified}
            </p>
            <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
              <AlertCircle className="h-3 w-3" /> en attente de validation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <p className="text-xs text-gray-400 mb-1">Employés actifs</p>
            <p className="text-3xl font-bold">{uniqueEmployees}</p>
            <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
              <Users className="h-3 w-3" /> ce mois
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Tableau ───────────────────────────────────────────────────────── */}
      <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Filtre mois / année */}
          <div className="flex items-center gap-2">
            <select
              className="rounded-md border px-3 py-1.5 text-sm bg-background"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
            <select
              className="rounded-md border px-3 py-1.5 text-sm bg-background"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Résumé */}
          <div className="flex gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-sm font-medium" style={{ color: '#1E1D3D' }}>
              <Clock className="h-3.5 w-3.5" />
              {totalH}h{totalM.toString().padStart(2, '0')} ce mois
            </span>
            {unverified > 0 && (
              <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-sm font-medium text-red-700">
                {unverified} non validé{unverified > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Bouton ajout */}
          <RightViewModal label="+ Ajouter" title={translations.createTimekeeping} description="">
            <NewTimekeepingForm employees={employees} translations={translations} />
          </RightViewModal>
        </div>
        <div className="mt-3 h-px bg-gray-100" />
      </CardHeader>

      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-gray-400 text-center py-10">
            {translations.noTimekeepingFound}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{translations.employee}</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>{translations.timeIn}</TableHead>
                <TableHead>{translations.timeOut}</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>{translations.verified}</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">
                    {entry.employee.firstName} {entry.employee.lastName}
                  </TableCell>
                  <TableCell>
                    {format(new Date(entry.timeIn), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(entry.timeIn), 'HH:mm')}
                  </TableCell>
                  <TableCell>
                    {entry.timeOut ? format(new Date(entry.timeOut), 'HH:mm') : '—'}
                  </TableCell>
                  <TableCell>{getDuration(entry.timeIn, entry.timeOut)}</TableCell>
                  <TableCell>
                    {entry.verified ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Validé
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-sm bg-gray-100 px-1 text-xs font-normal">
                        En attente
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {!entry.verified && (
                        <button
                          disabled={loadingId === entry.id}
                          onClick={() => handleVerify(entry)}
                          className="flex h-8 items-center gap-1.5 rounded-md border px-2 text-sm font-medium transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 lg:px-3"
                          style={{ color: '#1E1D3D' }}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Valider
                        </button>
                      )}
                      <button
                        disabled={loadingId === entry.id}
                        onClick={() => handleDelete(entry.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  </div>
  );
};

export default TimekeepingView;
