'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { differenceInMinutes } from 'date-fns';
import axios from 'axios';
import { PlusCircle, Trash2, CalendarDays, Clock, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import AlertModal from '@/components/modals/alert-modal';

type Employee = { id: string; firstName: string; lastName: string; email: string };
type Schedule = {
  id: string; date: string; timeIn: string; timeOut: string;
  employee: Employee;
};

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card className="overflow-hidden">
      <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
      <CardContent className="pb-4 pt-5 flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF7E00]/10">
          <Icon className="h-5 w-5" style={{ color: '#FF7E00' }} />
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
          <p className="text-xl font-bold" style={{ color: '#1E1D3D' }}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SchedulesView({
  initialData,
  employees,
  canEdit,
}: {
  initialData: Schedule[];
  employees: Employee[];
  canEdit: boolean;
}) {
  const router     = useRouter();
  const { toast }  = useToast();
  const [data, setData]       = useState(initialData);
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    employeeID: '',
    date:       today,
    timeIn:     '08:00',
    timeOut:    '17:00',
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleAdd = async () => {
    if (!form.employeeID) {
      toast({ variant: 'destructive', title: 'Employé requis' }); return;
    }
    setLoading(true);
    try {
      const dateStr = form.date;
      const res = await axios.post('/api/schedule', {
        employeeID: form.employeeID,
        date:       `${dateStr}T00:00:00`,
        timeIn:     `${dateStr}T${form.timeIn}:00`,
        timeOut:    `${dateStr}T${form.timeOut}:00`,
      });
      setData(prev => [res.data, ...prev]);
      setOpen(false);
      setForm({ employeeID: '', date: today, timeIn: '08:00', timeOut: '17:00' });
      toast({ title: 'Planning ajouté' });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible d'enregistrer." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await axios.delete(`/api/schedule/${deleteId}`);
      setData(prev => prev.filter(s => s.id !== deleteId));
      toast({ title: 'Entrée supprimée' });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer.' });
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

  const thisMonth = data.filter(s => {
    const d = new Date(s.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalMinutes = data.reduce((acc, s) => {
    const diff = differenceInMinutes(new Date(s.timeOut), new Date(s.timeIn));
    return acc + (diff > 0 ? diff : 0);
  }, 0);
  const totalH = Math.floor(totalMinutes / 60);

  return (
    <div className="space-y-6">

      <AlertModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={loading}
      />

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={CalendarDays} label="Plannings ce mois" value={String(thisMonth.length)} />
        <StatCard icon={Clock}        label="Heures planifiées (total)" value={`${totalH}h`} />
        <StatCard icon={Users}        label="Employés concernés" value={String(new Set(data.map(s => s.employee.id)).size)} />
      </div>

      {/* Header + bouton */}
      <div className="flex items-center justify-between">
        <p className="border-l-[3px] pl-3 text-xs font-semibold uppercase tracking-wide text-gray-400"
           style={{ borderColor: '#FF7E00' }}>
          Plannings ({data.length})
        </p>
        {canEdit && (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
              >
                <PlusCircle className="h-4 w-4" /> Nouveau planning
              </button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Nouveau planning</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="space-y-1">
                  <Label>Employé *</Label>
                  <Select value={form.employeeID} onValueChange={v => set('employeeID', v)}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner un employé" /></SelectTrigger>
                    <SelectContent>
                      {employees.map(e => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.firstName} {e.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Date *</Label>
                  <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Heure d'arrivée *</Label>
                    <input type="time" value={form.timeIn} onChange={e => set('timeIn', e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                  </div>
                  <div className="space-y-1">
                    <Label>Heure de départ *</Label>
                    <input type="time" value={form.timeOut} onChange={e => set('timeOut', e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                  </div>
                </div>
                <button
                  onClick={handleAdd} disabled={loading}
                  className="flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Tableau */}
      {data.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-sm text-gray-400">
          Aucun planning enregistré. Cliquez sur <strong>Nouveau planning</strong> pour commencer.
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden text-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3 text-left">Employé</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Arrivée</th>
                <th className="px-4 py-3 text-left">Départ</th>
                <th className="px-4 py-3 text-left">Durée</th>
                {canEdit && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map(s => {
                const mins = differenceInMinutes(new Date(s.timeOut), new Date(s.timeIn));
                const h = Math.floor(mins / 60), m = mins % 60;
                return (
                  <tr key={s.id} className="hover:bg-[#FF7E00]/[0.03] transition-colors">
                    <td className="px-4 py-3 font-medium" style={{ color: '#1E1D3D' }}>
                      {s.employee.firstName} {s.employee.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {format(new Date(s.date), 'dd MMMM yyyy', { locale: fr })}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {format(new Date(s.timeIn), 'HH:mm')}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {format(new Date(s.timeOut), 'HH:mm')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-[#1E1D3D]/10 text-[#1E1D3D]">
                        {h}h{m > 0 ? `${m}min` : ''}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setDeleteId(s.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
