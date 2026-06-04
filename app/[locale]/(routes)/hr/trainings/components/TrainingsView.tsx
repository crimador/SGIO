'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import axios from 'axios';
import { PlusCircle, Trash2, GraduationCap, BookOpen, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import AlertModal from '@/components/modals/alert-modal';

const TRAINING_TYPES = [
  'Comptabilité & Fiscalité',
  'Gestion de projet',
  'Marketing & Communication',
  'Informatique & Numérique',
  'Ressources humaines',
  'Développement personnel',
  'Sécurité au travail',
  'Autre',
];

type Employee = { id: string; firstName: string; lastName: string; email: string };
type Training = {
  id: string; type: string; date: string; endDate?: string | null; time: string;
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

export default function TrainingsView({
  initialData,
  employees,
  canEdit,
}: {
  initialData: Training[];
  employees: Employee[];
  canEdit: boolean;
}) {
  const { toast }  = useToast();
  const [data, setData]         = useState(initialData);
  const [open, setOpen]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    employeeID: '', type: '', date: today, endDate: '', time: '09:00',
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const thisYear = new Date().getFullYear();
  const countThisYear = data.filter(t => new Date(t.date).getFullYear() === thisYear).length;
  const uniqueEmployees = new Set(data.map(t => t.employee.id)).size;

  const typeStats = data.reduce<Record<string, number>>((acc, t) => {
    acc[t.type] = (acc[t.type] ?? 0) + 1;
    return acc;
  }, {});
  const topType = Object.entries(typeStats).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  const handleAdd = async () => {
    if (!form.employeeID || !form.type) {
      toast({ variant: 'destructive', title: 'Employé et type requis' }); return;
    }
    setLoading(true);
    try {
      if (form.endDate && form.endDate < form.date) {
        toast({ variant: 'destructive', title: 'La date de fin doit être après la date de début' });
        setLoading(false);
        return;
      }
      const res = await axios.post('/api/training', {
        employeeID: form.employeeID,
        type:       form.type,
        date:       `${form.date}T00:00:00`,
        endDate:    form.endDate ? `${form.endDate}T00:00:00` : null,
        time:       `${form.date}T${form.time}:00`,
      });
      setData(prev => [res.data, ...prev]);
      setOpen(false);
      setForm({ employeeID: '', type: '', date: today, endDate: '', time: '09:00' });
      toast({ title: 'Formation enregistrée' });
    } catch (error: any) {
      const status = error?.response?.status;
      const serverMsg = error?.response?.data?.error || error?.response?.data;
      const description =
        status === 403
          ? 'Action réservée aux rôles Directeur (DG) et Responsable RH.'
          : serverMsg || "Impossible d'enregistrer.";
      toast({ variant: 'destructive', title: 'Erreur', description });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await axios.delete(`/api/training/${deleteId}`);
      setData(prev => prev.filter(t => t.id !== deleteId));
      toast({ title: 'Formation supprimée' });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur' });
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

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
        <StatCard icon={GraduationCap} label={`Formations ${thisYear}`} value={String(countThisYear)} />
        <StatCard icon={Users}         label="Employés formés"          value={String(uniqueEmployees)} />
        <StatCard icon={BookOpen}      label="Type le + fréquent"       value={topType} />
      </div>

      {/* Header + bouton */}
      <div className="flex items-center justify-between">
        <p className="border-l-[3px] pl-3 text-xs font-semibold uppercase tracking-wide text-gray-400"
           style={{ borderColor: '#FF7E00' }}>
          Formations ({data.length})
        </p>
        {canEdit && (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
              >
                <PlusCircle className="h-4 w-4" /> Nouvelle formation
              </button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Nouvelle formation</SheetTitle>
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
                  <Label>Type de formation *</Label>
                  <Select value={form.type} onValueChange={v => set('type', v)}>
                    <SelectTrigger><SelectValue placeholder="Choisir un type" /></SelectTrigger>
                    <SelectContent>
                      {TRAINING_TYPES.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Ou saisissez un type personnalisé..."
                    value={TRAINING_TYPES.includes(form.type) ? '' : form.type}
                    onChange={e => set('type', e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Date de début *</Label>
                    <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                  </div>
                  <div className="space-y-1">
                    <Label>Date de fin</Label>
                    <input type="date" value={form.endDate} min={form.date} onChange={e => set('endDate', e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Heure</Label>
                  <input type="time" value={form.time} onChange={e => set('time', e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
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
          Aucune formation enregistrée. Cliquez sur <strong>Nouvelle formation</strong> pour commencer.
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden text-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3 text-left">Employé</th>
                <th className="px-4 py-3 text-left">Type de formation</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Heure</th>
                {canEdit && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map(t => (
                <tr key={t.id} className="hover:bg-[#FF7E00]/[0.03] transition-colors">
                  <td className="px-4 py-3 font-medium" style={{ color: '#1E1D3D' }}>
                    {t.employee.firstName} {t.employee.lastName}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[#FF7E00]/10 text-[#FF7E00]">
                      {t.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {format(new Date(t.date), 'dd MMM yyyy', { locale: fr })}
                    {t.endDate && (
                      <> → {format(new Date(t.endDate), 'dd MMM yyyy', { locale: fr })}</>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {format(new Date(t.time), 'HH:mm')}
                  </td>
                  {canEdit && (
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDeleteId(t.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
