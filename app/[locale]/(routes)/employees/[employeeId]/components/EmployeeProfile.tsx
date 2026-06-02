'use client';

import { useMemo, useRef, useState } from 'react';
import { format, differenceInMonths, differenceInYears } from 'date-fns';
import { fr } from 'date-fns/locale';
import { calcOvertimeForPeriod, DAILY_THRESHOLD } from '@/lib/overtime';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  User, Mail, Phone, MapPin, CreditCard, Shield,
  DollarSign, Clock, FileText, TrendingUp,
  CheckCircle2, XCircle, Download, Calendar,
  Briefcase, ArrowUpRight, Palmtree, Camera,
} from 'lucide-react';
import { calcLeaveBalance } from '@/lib/leave-balance';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type Employee = {
  id: string; firstName: string; lastName: string; email: string;
  phone: string; position?: string | null; salary: number;
  onBoarding?: Date | string | null; dateOfBirth?: Date | string | null;
  IBAN?: string | null; taxid?: string | null; address?: string | null;
  insurance?: string | null; photo?: string | null; role: string; createdAt: string;
};

type Payslip = {
  id: string; period: string; baseSalary: number; bonuses: number;
  deductions: number; netSalary: number; status: string; notes?: string | null;
};

type Request = {
  id: string; type: string; status: string; message: string;
  startDate: string; endDate?: string | null; numberOfDays?: number | null;
  requestedAmount?: number | null; documentType?: string | null;
  legalDays?: number | null; leaveSubType?: string | null; createdAt: string;
};

type Timekeeping = {
  id: string; timeIn: string; timeOut?: string | null; verified: boolean;
};

type Props = {
  employee:    Employee;
  payslips:    Payslip[];
  requests:    Request[];
  timekeeping: Timekeeping[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTHS_FR: Record<string, string> = {
  '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr',
  '05': 'Mai', '06': 'Juin','07': 'Juil','08': 'Août',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc',
};

const TYPE_LABELS: Record<string, string> = {
  Vacation: 'Congé annuel', Leave: 'Congé exceptionnel', Sick: 'Arrêt maladie',
  Maternity: 'Congé maternité', Training: 'Formation',
  Raise: 'Augmentation', Documents: 'Documents', Other: 'Autre',
};

const LEAVE_TYPES = ['Vacation', 'Leave', 'Sick', 'Maternity', 'Training'];

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n));
}

function fmtDate(d: string | Date | null | undefined) {
  if (!d) return '—';
  try { return format(new Date(d), 'dd MMM yyyy', { locale: fr }); } catch { return String(d); }
}

function formatPeriod(period: string) {
  const [year, month] = period.split('-');
  return `${MONTHS_FR[month] ?? month} ${year}`;
}

function getDuration(timeIn: string, timeOut?: string | null) {
  if (!timeOut) return null;
  const h = (new Date(timeOut).getTime() - new Date(timeIn).getTime()) / 3_600_000;
  return h > 0 ? h : null;
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'EN_ATTENTE') return <span className="inline-flex items-center rounded-sm bg-gray-100 px-2 py-0.5 text-xs font-normal">En attente</span>;
  if (status === 'APPROUVE')   return <span className="inline-flex items-center rounded-sm bg-green-500 px-2 py-0.5 text-xs font-medium text-white">Approuvé</span>;
  if (status === 'REJETE')     return <span className="inline-flex items-center rounded-sm bg-red-500 px-2 py-0.5 text-xs font-medium text-white">Rejeté</span>;
  if (status === 'PAYE')       return <span className="inline-flex items-center rounded-sm bg-green-500 px-2 py-0.5 text-xs font-medium text-white">Payé</span>;
  if (status === 'EMIS')       return <span className="inline-flex items-center rounded-sm bg-blue-500 px-2 py-0.5 text-xs font-medium text-white">Émis</span>;
  return <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium" style={{ color: '#1E1D3D' }}>{status}</span>;
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium break-all">{value}</p>
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function EmployeeProfile({ employee, payslips, requests, timekeeping }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [photoUrl, setPhotoUrl] = useState(employee.photo ?? '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initials = `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase();

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await axios.post(`/api/employee/${employee.id}/photo`, fd);
      setPhotoUrl(res.data.url + '?t=' + Date.now());
      toast({ title: 'Photo mise à jour' });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur lors de la mise à jour de la photo' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const now = new Date();
  const [tkMonth, setTkMonth] = useState(format(now, 'yyyy-MM'));

  const anciennete = employee.onBoarding
    ? differenceInMonths(new Date(), new Date(employee.onBoarding))
    : null;
  const ancienneteLabel = anciennete !== null
    ? anciennete < 12
      ? `${anciennete} mois`
      : `${Math.floor(anciennete / 12)} an${Math.floor(anciennete / 12) > 1 ? 's' : ''} ${anciennete % 12 > 0 ? `${anciennete % 12} mois` : ''}`
    : null;

  const RETIREMENT_AGE = 60;
  const age = employee.dateOfBirth
    ? differenceInYears(new Date(), new Date(employee.dateOfBirth))
    : null;
  const yearsToRetirement = age !== null ? RETIREMENT_AGE - age : null;
  const retirementAlert = yearsToRetirement !== null && yearsToRetirement <= 3 && yearsToRetirement >= 0;

  const leaveBalance = calcLeaveBalance(employee.onBoarding, requests);

  const raisesApprouves = useMemo(() =>
    requests
      .filter(r => r.type === 'Raise' && r.status === 'APPROUVE' && r.requestedAmount)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [requests]
  );

  const timekeepingByMonth = useMemo(() => {
    const map: Record<string, { heures: number; jours: number }> = {};
    timekeeping.forEach(t => {
      const key = format(new Date(t.timeIn), 'yyyy-MM');
      const h   = getDuration(t.timeIn, t.timeOut) ?? 0;
      if (!map[key]) map[key] = { heures: 0, jours: 0 };
      map[key].heures += h;
      map[key].jours  += 1;
    });
    return Object.entries(map)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 12)
      .map(([period, data]) => {
        const [year, month] = period.split('-');
        return { label: `${MONTHS_FR[month] ?? month} ${year}`, ...data };
      });
  }, [timekeeping]);

  const totalHeuresMois = timekeeping
    .filter(t => format(new Date(t.timeIn), 'yyyy-MM') === format(new Date(), 'yyyy-MM'))
    .reduce((s, t) => s + (getDuration(t.timeIn, t.timeOut) ?? 0), 0);

  return (
    <div className="space-y-6">

      {/* ── En-tête employé ──────────────────────────────────────────────── */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-20 w-20 text-2xl">
                <AvatarImage src={photoUrl} />
                <AvatarFallback className="bg-[#FF7E00]/10 text-[#FF7E00] font-bold text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <button
                type="button"
                className="flex h-7 items-center gap-1 rounded-md border px-2 text-xs font-medium transition-colors hover:bg-gray-50 disabled:opacity-50"
                style={{ color: '#1E1D3D' }}
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-3 w-3 mr-1" />
                {uploading ? 'Envoi...' : 'Photo'}
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold">{employee.firstName} {employee.lastName}</h2>
              <p className="text-gray-400">{employee.position ?? 'Poste non défini'}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium" style={{ color: '#1E1D3D' }}>
                  <DollarSign className="h-3 w-3" />
                  {fmt(employee.salary)} FCFA / mois
                </span>
                {ancienneteLabel && (
                  <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium" style={{ color: '#1E1D3D' }}>
                    <Calendar className="h-3 w-3" />
                    {ancienneteLabel} d'ancienneté
                  </span>
                )}
                {age !== null && (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${retirementAlert ? 'border-red-300 bg-red-50 text-red-600' : ''}`} style={retirementAlert ? {} : { color: '#1E1D3D' }}>
                    <User className="h-3 w-3" />
                    {age} ans
                    {retirementAlert && yearsToRetirement !== null && (
                      <span className="ml-1">
                        — retraite dans {yearsToRetirement === 0 ? 'moins d\'1 an' : `${yearsToRetirement} an${yearsToRetirement > 1 ? 's' : ''}`}
                      </span>
                    )}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium" style={{ color: '#1E1D3D' }}>
                  <Clock className="h-3 w-3" />
                  {Math.round(totalHeuresMois)} h ce mois
                </span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <a href={`/api/employee/${employee.id}/badge`} download title="Télécharger le badge PDF">
                <button type="button" className="flex h-8 items-center gap-1 rounded-md border px-3 text-xs font-medium transition-colors hover:bg-gray-50" style={{ color: '#1E1D3D' }}>
                  <CreditCard className="h-4 w-4 mr-1" />
                  Badge
                </button>
              </a>
              <button type="button" className="flex h-8 items-center gap-1 rounded-md border px-3 text-xs font-medium transition-colors hover:bg-gray-50" style={{ color: '#1E1D3D' }} onClick={() => router.push('/hr?tab=employees')}>
                ← Retour
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Onglets ──────────────────────────────────────────────────────── */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="info" className="flex items-center gap-1 text-xs">
            <User className="h-3.5 w-3.5" />Informations
          </TabsTrigger>
          <TabsTrigger value="payslips" className="flex items-center gap-1 text-xs">
            <DollarSign className="h-3.5 w-3.5" />Bulletins ({payslips.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-1 text-xs">
            <FileText className="h-3.5 w-3.5" />Demandes ({requests.length})
          </TabsTrigger>
          <TabsTrigger value="timekeeping" className="flex items-center gap-1 text-xs">
            <Clock className="h-3.5 w-3.5" />Pointage
          </TabsTrigger>
          <TabsTrigger value="salary" className="flex items-center gap-1 text-xs">
            <TrendingUp className="h-3.5 w-3.5" />Salaire
          </TabsTrigger>
        </TabsList>

        {/* ── Tab: Informations ───────────────────────────────────────────── */}
        <TabsContent value="info">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <p className="flex items-center gap-2 text-sm font-bold" style={{ color: '#1E1D3D' }}>
                  <User className="h-4 w-4" /> Informations personnelles
                </p>
              </CardHeader>
              <CardContent>
                <InfoRow icon={Mail}    label="Email"    value={employee.email} />
                <InfoRow icon={Phone}   label="Téléphone" value={employee.phone} />
                <InfoRow icon={MapPin}  label="Adresse"  value={employee.address} />
                <InfoRow icon={Shield}  label="Assurance" value={employee.insurance} />
                <InfoRow icon={FileText} label="N° identification" value={employee.taxid} />
                {employee.dateOfBirth && (
                  <InfoRow
                    icon={User}
                    label="Date de naissance"
                    value={`${fmtDate(employee.dateOfBirth)}${age !== null ? ` (${age} ans)` : ''}`}
                  />
                )}
                {age !== null && yearsToRetirement !== null && yearsToRetirement >= 0 && (
                  <InfoRow
                    icon={Palmtree}
                    label="Retraite CNSS (60 ans)"
                    value={
                      yearsToRetirement === 0
                        ? 'Cette année !'
                        : `Dans ${yearsToRetirement} an${yearsToRetirement > 1 ? 's' : ''}`
                    }
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <p className="flex items-center gap-2 text-sm font-bold" style={{ color: '#1E1D3D' }}>
                  <Briefcase className="h-4 w-4" /> Informations professionnelles
                </p>
              </CardHeader>
              <CardContent>
                <InfoRow icon={Briefcase} label="Poste / Fonction" value={employee.position} />
                <InfoRow icon={DollarSign} label="Salaire net mensuel" value={`${fmt(employee.salary)} FCFA`} />
                <InfoRow icon={Calendar} label="Date d'embauche" value={fmtDate(employee.onBoarding)} />
                <InfoRow icon={Calendar} label="Ancienneté" value={ancienneteLabel ?? undefined} />
                <InfoRow icon={CreditCard} label="IBAN" value={employee.IBAN} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab: Bulletins de paie ──────────────────────────────────────── */}
        <TabsContent value="payslips">
          <Card>
            <CardHeader className="pb-2">
              <p className="text-sm font-bold" style={{ color: '#1E1D3D' }}>Bulletins de paie</p>
            </CardHeader>
            <CardContent>
              {payslips.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">Aucun bulletin de paie</p>
              ) : (
                <div className="space-y-2">
                  {payslips.map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{formatPeriod(p.period)}</p>
                        <p className="text-xs text-gray-400">
                          Base : {fmt(p.baseSalary)} F
                          {p.bonuses > 0 && ` · +${fmt(p.bonuses)} F primes`}
                          {p.deductions > 0 && ` · -${fmt(p.deductions)} F retenues`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold">{fmt(p.netSalary)} FCFA</span>
                        <StatusBadge status={p.status} />
                        {p.status !== 'BROUILLON' && (
                          <a href={`/api/payslip/${p.id}/pdf`} download>
                            <button type="button" className="flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-gray-100">
                              <Download className="h-4 w-4" />
                            </button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: Demandes ───────────────────────────────────────────────── */}
        <TabsContent value="requests">
          {leaveBalance && (
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-3 gap-3">
                <Card className="text-center">
                  <CardContent className="pt-4 pb-3">
                    <p className="text-xs text-gray-400">Jours acquis</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">{leaveBalance.accrued}</p>
                    <p className="text-xs text-gray-400">{leaveBalance.months} mois × 2,5</p>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-4 pb-3">
                    <p className="text-xs text-gray-400">Jours déduits</p>
                    <p className="text-3xl font-bold text-orange-500 mt-1">{leaveBalance.used}</p>
                    <p className="text-xs text-gray-400">sur solde annuel</p>
                  </CardContent>
                </Card>
                <Card className={`text-center ${leaveBalance.remaining < 0 ? 'border-red-300 bg-red-50' : leaveBalance.remaining <= 3 ? 'border-orange-300 bg-orange-50' : 'border-green-300 bg-green-50'}`}>
                  <CardContent className="pt-4 pb-3">
                    <p className="text-xs text-gray-400">Solde restant</p>
                    <p className={`text-3xl font-bold mt-1 ${leaveBalance.remaining < 0 ? 'text-red-600' : leaveBalance.remaining <= 3 ? 'text-orange-600' : 'text-green-600'}`}>
                      {leaveBalance.remaining}
                    </p>
                    <p className="text-xs text-gray-400">jours disponibles</p>
                  </CardContent>
                </Card>
              </div>
              {(leaveBalance.vacationDays > 0 || leaveBalance.excessLeaveDays > 0) && (
                <div className="rounded-md border bg-muted/20 px-3 py-2 flex flex-wrap gap-4 text-xs text-gray-400">
                  {leaveBalance.vacationDays > 0 && (
                    <span>Congés annuels pris : <strong>{leaveBalance.vacationDays} j.</strong></span>
                  )}
                  {leaveBalance.excessLeaveDays > 0 && (
                    <span className="text-orange-600">
                      Congés exceptionnels imputés sur solde : <strong>{leaveBalance.excessLeaveDays} j.</strong>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          <Card>
            <CardHeader className="pb-2">
              <p className="text-sm font-bold" style={{ color: '#1E1D3D' }}>Historique des demandes</p>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">Aucune demande</p>
              ) : (
                <div className="space-y-2">
                  {requests.map((req) => (
                    <div key={req.id} className="flex items-start justify-between rounded-lg border px-4 py-3 gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium" style={{ color: '#1E1D3D' }}>{TYPE_LABELS[req.type] ?? req.type}</span>
                          <span className="text-xs text-gray-400">{fmtDate(req.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1 truncate">{req.message}</p>
                        {req.type === 'Raise' && req.requestedAmount && (
                          <p className="text-xs font-medium text-emerald-600 mt-0.5">
                            + {fmt(req.requestedAmount)} FCFA demandés
                          </p>
                        )}
                        {req.numberOfDays && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {fmtDate(req.startDate)} → {fmtDate(req.endDate)} ({req.numberOfDays} j.)
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={req.status} />
                        {req.type === 'Documents' && req.status === 'APPROUVE' && (
                          <a href={`/api/requests/${req.id}/document`} download>
                            <button type="button" className="flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-gray-100">
                              <Download className="h-4 w-4" />
                            </button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: Pointage ───────────────────────────────────────────────── */}
        <TabsContent value="timekeeping">
          {(() => {
            const overtime = calcOvertimeForPeriod(timekeeping, tkMonth);
            const hasOvertime = overtime.overtimeHours > 0;

            return (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium">Période :</label>
                  <input
                    type="month"
                    value={tkMonth}
                    onChange={(e) => setTkMonth(e.target.value)}
                    className="rounded-md border px-3 py-1.5 text-sm bg-background"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Card>
                    <CardContent className="pt-4 pb-3 text-center">
                      <p className="text-xs text-gray-400">Total travaillé</p>
                      <p className="text-2xl font-bold mt-1">{overtime.totalWorked.toFixed(1)} h</p>
                      <p className="text-xs text-gray-400">{overtime.days.length} jours</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 pb-3 text-center">
                      <p className="text-xs text-gray-400">Heures normales</p>
                      <p className="text-2xl font-bold mt-1 text-blue-600">{overtime.regularHours.toFixed(1)} h</p>
                      <p className="text-xs text-gray-400">≤ 8 h/jour</p>
                    </CardContent>
                  </Card>
                  <Card className={hasOvertime ? 'border-orange-300 bg-orange-50' : ''}>
                    <CardContent className="pt-4 pb-3 text-center">
                      <p className="text-xs text-gray-400">Heures sup.</p>
                      <p className={`text-2xl font-bold mt-1 ${hasOvertime ? 'text-orange-600' : 'text-gray-400'}`}>
                        {overtime.overtimeHours.toFixed(1)} h
                      </p>
                      <p className="text-xs text-gray-400">&gt; {DAILY_THRESHOLD} h/jour</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <p className="text-sm font-bold" style={{ color: '#1E1D3D' }}>Détail journalier</p>
                  </CardHeader>
                  <CardContent>
                    {overtime.days.length === 0 ? (
                      <p className="py-8 text-center text-sm text-gray-400">Aucun pointage ce mois-ci</p>
                    ) : (
                      <div className="space-y-1">
                        {timekeeping
                          .filter(t => new Date(t.timeIn).toISOString().startsWith(tkMonth))
                          .map((t) => {
                            const h = getDuration(t.timeIn, t.timeOut);
                            const isOvertime = h !== null && h > 8;
                            const supH = h !== null ? Math.max(0, h - 8) : 0;
                            return (
                              <div key={t.id} className={`flex items-center justify-between py-2 border-b last:border-0 ${isOvertime ? 'bg-orange-50/50' : ''}`}>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-medium w-28">{fmtDate(t.timeIn)}</span>
                                  <span className="text-xs text-gray-400">
                                    {format(new Date(t.timeIn), 'HH:mm')}
                                    {t.timeOut ? ` → ${format(new Date(t.timeOut), 'HH:mm')}` : ' → en cours'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  {h !== null && (
                                    <div className="text-right">
                                      <span className="text-sm font-medium">{h.toFixed(1)} h</span>
                                      {isOvertime && (
                                        <span className="text-xs text-orange-600 ml-2">
                                          (+{supH.toFixed(1)} sup.)
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {t.verified
                                    ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    : <XCircle className="h-4 w-4 text-gray-400" />}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {timekeepingByMonth.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <p className="text-sm font-bold" style={{ color: '#1E1D3D' }}>Résumé mensuel</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {timekeepingByMonth.map((m) => (
                          <div key={m.label} className="flex items-center justify-between py-1.5 border-b last:border-0 text-sm">
                            <span className="text-gray-400 w-20">{m.label}</span>
                            <span>{Math.round(m.heures)} h · {m.jours} j.</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })()}
        </TabsContent>

        {/* ── Tab: Historique salaire ─────────────────────────────────────── */}
        <TabsContent value="salary">
          <div className="space-y-4">
            <Card className="border-[#FF7E00]/30 bg-[#FF7E00]/5">
              <CardContent className="pt-6 pb-4">
                <p className="text-sm text-gray-400">Salaire actuel</p>
                <p className="text-4xl font-bold text-[#FF7E00] mt-1">{fmt(employee.salary)} FCFA</p>
                <p className="text-xs text-gray-400 mt-1">Net mensuel</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <p className="flex items-center gap-2 text-sm font-bold" style={{ color: '#1E1D3D' }}>
                  <TrendingUp className="h-4 w-4" />
                  Historique des augmentations
                </p>
              </CardHeader>
              <CardContent>
                {raisesApprouves.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-400">
                    Aucune augmentation enregistrée
                  </p>
                ) : (
                  <div className="relative pl-6">
                    <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border" />

                    {raisesApprouves.map((r, i) => (
                      <div key={r.id} className="relative mb-4 last:mb-0">
                        <div className="absolute -left-4 top-1.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
                        <div className="rounded-lg border px-4 py-3 bg-background">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-400">{fmtDate(r.createdAt)}</p>
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              <ArrowUpRight className="h-3 w-3" />
                              + {fmt(r.requestedAmount!)} FCFA
                            </span>
                          </div>
                          {r.message && (
                            <p className="text-sm text-gray-400 mt-1">{r.message}</p>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="relative">
                      <div className="absolute -left-4 top-1.5 h-3 w-3 rounded-full bg-blue-500 border-2 border-background" />
                      <div className="rounded-lg border px-4 py-3 bg-muted/30">
                        <p className="text-xs text-gray-400">
                          {employee.onBoarding ? fmtDate(employee.onBoarding) : 'Date d\'embauche'}
                        </p>
                        <p className="text-sm font-medium">Embauche</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
