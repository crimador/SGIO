'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays, subDays } from 'date-fns';
import { countWorkingDays } from '@/lib/working-days';
import { fr } from 'date-fns/locale';
import axios from 'axios';
import { CheckCircle2, XCircle, Trash2, CalendarDays, Download, Palmtree, LogIn, AlertTriangle } from 'lucide-react';
import { calcLeaveBalance } from '@/lib/leave-balance';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import RightViewModal from '@/components/modals/right-view-modal';

import { NewRequestForm } from './NewRequestForm';

type Employee = { id: string; firstName: string; lastName: string; onBoarding?: string | null };

type Request = {
  id:              string;
  employeeID:      string;
  employee:        { firstName: string; lastName: string; position?: string | null; onBoarding?: string | null };
  type:            string;
  status:          'EN_ATTENTE' | 'APPROUVE' | 'REJETE';
  message:         string;
  startDate:       string;
  endDate:         string | null;
  numberOfDays:    number | null;
  requestedAmount: number | null;
  documentType:    string | null;
  legalDays:       number | null;
  returnedAt:      string | null;
  createdAt:       string;
};

type Props = { data: Request[]; employees: Employee[] };

const LEAVE_TYPES = ['Vacation', 'Leave', 'Sick', 'Maternity', 'Training'];

const TYPE_LABELS: Record<string, string> = {
  Vacation:  'Congé annuel',
  Leave:     'Congé exceptionnel',
  Sick:      'Arrêt maladie',
  Maternity: 'Congé maternité',
  Training:  'Formation',
  Raise:     'Augmentation',
  Documents: 'Documents',
  Other:     'Autre',
};

const StatusBadge = ({ status }: { status: Request['status'] }) => {
  if (status === 'EN_ATTENTE')
    return <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">En attente</span>;
  if (status === 'APPROUVE')
    return <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Approuvé</span>;
  return <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">Rejeté</span>;
};

const RequestsView = ({ data, employees }: Props) => {
  const router    = useRouter();
  const { toast } = useToast();
  const [isMounted, setIsMounted]         = useState(false);
  const [loadingId, setLoadingId]         = useState<string | null>(null);
  const [filterStatus, setFilterStatus]   = useState<string>('ALL');
  const [filterType,   setFilterType]     = useState<string>('ALL');

  // Dialog confirmation de retour
  const [returnDialog, setReturnDialog]   = useState<Request | null>(null);
  const [returnDate,   setReturnDate]     = useState('');

  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;

  const filtered = data.filter((r) => {
    const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchType   = filterType   === 'ALL' || r.type   === filterType;
    return matchStatus && matchType;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = format(today, 'yyyy-MM-dd');

  const pendingReturns = data.filter(
    (r) => r.status === 'APPROUVE'
      && LEAVE_TYPES.includes(r.type)
      && r.endDate
      && new Date(r.endDate) < today
      && !r.returnedAt
  ).length;

  const pending  = data.filter((r) => r.status === 'EN_ATTENTE').length;
  const approved = data.filter((r) => r.status === 'APPROUVE').length;

  // Calcule les jours de dépassement à partir de la date de retour saisie
  // Jours ouvrables non autorisés entre la fin du congé et la date de retour
  const getExtraDays = (req: Request, date: string): number => {
    if (!req.endDate || !date) return 0;
    const firstDayBack  = addDays(new Date(req.endDate), 1);
    const lastDayAbsent = subDays(new Date(date), 1);
    if (lastDayAbsent < firstDayBack) return 0;
    return countWorkingDays(firstDayBack, lastDayAbsent);
  };

  const openReturnDialog = (req: Request) => {
    setReturnDialog(req);
    setReturnDate(todayStr);
  };

  const submitReturn = async () => {
    if (!returnDialog || !returnDate) return;
    const extraDays = getExtraDays(returnDialog, returnDate);
    const newNumberOfDays = extraDays > 0
      ? (returnDialog.numberOfDays ?? 0) + extraDays
      : undefined;

    setLoadingId(returnDialog.id);
    try {
      await axios.patch(`/api/requests/${returnDialog.id}`, {
        returnedAt:   returnDate,
        numberOfDays: newNumberOfDays,
      });
      toast({
        title: 'Retour confirmé',
        description: extraDays > 0
          ? `${extraDays} jour${extraDays > 1 ? 's' : ''} de dépassement déduit${extraDays > 1 ? 's' : ''} du solde annuel.`
          : 'Retour dans les délais — aucune déduction supplémentaire.',
      });
      setReturnDialog(null);
      router.refresh();
    } catch {
      toast({ variant: 'destructive', title: 'Erreur lors de la confirmation' });
    } finally {
      setLoadingId(null);
    }
  };

  const changeStatus = async (req: Request, status: string) => {
    if (status === 'APPROUVE' && req.type === 'Raise' && req.requestedAmount) {
      const amount = new Intl.NumberFormat('fr-FR').format(req.requestedAmount);
      const ok = confirm(
        `Approuver cette demande d'augmentation ?\n\n+ ${amount} FCFA seront ajoutés au salaire actuel de ${req.employee.firstName} ${req.employee.lastName}.`
      );
      if (!ok) return;
    }
    setLoadingId(req.id);
    try {
      await axios.put(`/api/requests/${req.id}`, { status });
      toast({
        title: status === 'APPROUVE' ? 'Demande approuvée' : 'Demande rejetée',
        description:
          status === 'APPROUVE' && req.type === 'Raise' && req.requestedAmount
            ? `+ ${new Intl.NumberFormat('fr-FR').format(req.requestedAmount)} FCFA ajoutés au salaire`
            : undefined,
      });
      router.refresh();
    } catch {
      toast({ variant: 'destructive', title: 'Erreur lors de la mise à jour' });
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette demande ?')) return;
    setLoadingId(id);
    try {
      await axios.delete(`/api/requests/${id}`);
      toast({ title: 'Demande supprimée' });
      router.refresh();
    } catch {
      toast({ variant: 'destructive', title: 'Erreur lors de la suppression' });
    } finally {
      setLoadingId(null);
    }
  };

  // Jours de dépassement en temps réel dans la modale
  const dialogExtraDays = returnDialog ? getExtraDays(returnDialog, returnDate) : 0;

  return (
    <div className="space-y-4">
      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={`overflow-hidden ${pending > 0 ? 'border-orange-300' : ''}`}>
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardContent className="pb-4 pt-5 text-center">
            <p className="mb-1 text-xs text-gray-400">En attente</p>
            <p className={`text-3xl font-bold ${pending > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
              {pending}
            </p>
            <p className="mt-1 flex items-center justify-center gap-1 text-xs text-gray-400">
              <CalendarDays className="h-3 w-3" /> demandes à traiter
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardContent className="pb-4 pt-5 text-center">
            <p className="mb-1 text-xs text-gray-400">Approuvées</p>
            <p className="text-3xl font-bold text-green-600">{approved}</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-xs text-gray-400">
              <CheckCircle2 className="h-3 w-3" /> au total
            </p>
          </CardContent>
        </Card>
        <Card className={`overflow-hidden ${pendingReturns > 0 ? 'border-red-300' : ''}`}>
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardContent className="pb-4 pt-5 text-center">
            <p className="mb-1 text-xs text-gray-400">Retours non confirmés</p>
            <p className={`text-3xl font-bold ${pendingReturns > 0 ? 'text-red-600' : 'text-gray-400'}`}>
              {pendingReturns}
            </p>
            <p className="mt-1 flex items-center justify-center gap-1 text-xs text-gray-400">
              <AlertTriangle className="h-3 w-3" /> en attente de confirmation
            </p>
          </CardContent>
        </Card>
      </div>

      <>
      {/* ── Modale confirmation de retour ────────────────────────────────── */}
      <Dialog open={!!returnDialog} onOpenChange={(open) => { if (!open) setReturnDialog(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5 text-orange-500" />
              Confirmer le retour
            </DialogTitle>
          </DialogHeader>

          {returnDialog && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                Employé : <strong>{returnDialog.employee.firstName} {returnDialog.employee.lastName}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Congé prévu du{' '}
                <strong>{format(new Date(returnDialog.startDate), 'dd/MM/yyyy', { locale: fr })}</strong>
                {' '}au{' '}
                <strong>{format(new Date(returnDialog.endDate!), 'dd/MM/yyyy', { locale: fr })}</strong>
                {' '}({returnDialog.numberOfDays} j.)
              </p>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Date réelle de retour au travail</label>
                <Input
                  type="date"
                  value={returnDate}
                  min={returnDialog.startDate.slice(0, 10)}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>

              {/* Résumé selon la date choisie */}
              {returnDate && (
                dialogExtraDays === 0 ? (
                  <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2">
                    <p className="text-sm text-green-700 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      Retour dans les délais
                    </p>
                    <p className="text-xs text-green-600 mt-0.5">
                      Aucune déduction supplémentaire sur le solde de congés.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2 space-y-1">
                    <p className="text-sm text-orange-700 font-medium flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4" />
                      Dépassement de {dialogExtraDays} jour{dialogExtraDays > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-orange-600">
                      Ces jours seront déduits du solde de congés annuels.
                    </p>
                    <p className="text-xs text-orange-600">
                      Durée totale mise à jour :{' '}
                      <strong>{(returnDialog.numberOfDays ?? 0) + dialogExtraDays} jours</strong>
                      {' '}(au lieu de {returnDialog.numberOfDays})
                    </p>
                  </div>
                )
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <button
              className="flex h-9 items-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-gray-50"
              style={{ color: '#1E1D3D' }}
              onClick={() => setReturnDialog(null)}
            >
              Annuler
            </button>
            <button
              className="flex h-9 items-center rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
              style={dialogExtraDays > 0
                ? { background: 'linear-gradient(135deg, #f97316, #ea580c)' }
                : { background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
              disabled={!returnDate || loadingId === returnDialog?.id}
              onClick={submitReturn}
            >
              {loadingId === returnDialog?.id ? 'Enregistrement...' : 'Confirmer le retour'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Tableau principal ─────────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
        <CardHeader className="pb-3 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filtres */}
            <div className="flex items-center gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-36 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous les statuts</SelectItem>
                  <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                  <SelectItem value="APPROUVE">Approuvé</SelectItem>
                  <SelectItem value="REJETE">Rejeté</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-44 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous les types</SelectItem>
                  <SelectItem value="Vacation">Congé annuel</SelectItem>
                  <SelectItem value="Leave">Congé exceptionnel</SelectItem>
                  <SelectItem value="Sick">Arrêt maladie</SelectItem>
                  <SelectItem value="Maternity">Congé maternité</SelectItem>
                  <SelectItem value="Training">Formation</SelectItem>
                  <SelectItem value="Raise">Augmentation</SelectItem>
                  <SelectItem value="Documents">Documents</SelectItem>
                  <SelectItem value="Other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Résumé */}
            <div className="flex items-center gap-3 flex-wrap">
              {pending > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-medium text-amber-700">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {pending} en attente
                </span>
              )}
              {pendingReturns > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-300 bg-orange-100 px-2.5 py-1 text-sm font-medium text-orange-700">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {pendingReturns} retour{pendingReturns > 1 ? 's' : ''} non confirmé{pendingReturns > 1 ? 's' : ''}
                </span>
              )}
              <span className="inline-flex items-center rounded-full border border-green-300 px-2.5 py-1 text-sm font-medium text-green-700">
                {approved} approuvé{approved > 1 ? 's' : ''}
              </span>
            </div>

            {/* Bouton nouvelle demande */}
            <RightViewModal label="+ Nouvelle demande" title="Soumettre une demande" description="">
              <NewRequestForm employees={employees} />
            </RightViewModal>
          </div>
        </CardHeader>

        <CardContent>
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">Aucune demande trouvée</p>
          ) : (
            <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                  <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Employé</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Type</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Début</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Fin</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Durée / Montant</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Motif</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Statut</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Retour</TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((req) => (
                  <TableRow key={req.id} className="transition-colors hover:bg-[#FF7E00]/[0.04]">
                    <TableCell className="font-medium">
                      <div>{req.employee.firstName} {req.employee.lastName}</div>
                      {['Vacation', 'Leave'].includes(req.type) && (() => {
                        const empRequests = data.filter(
                          r => r.employeeID === req.employeeID && ['Vacation', 'Leave'].includes(r.type)
                        );
                        const bal = calcLeaveBalance(req.employee.onBoarding, empRequests);
                        if (!bal) return null;
                        const color = bal.remaining < 0 ? 'text-red-500' : bal.remaining <= 3 ? 'text-orange-500' : 'text-green-600';
                        return (
                          <span className={`text-xs ${color} flex items-center gap-0.5`}>
                            <Palmtree className="h-3 w-3" />
                            {bal.remaining} j. restants
                          </span>
                        );
                      })()}
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium text-gray-600">
                        {TYPE_LABELS[req.type] ?? req.type}
                      </span>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {LEAVE_TYPES.includes(req.type)
                        ? format(new Date(req.startDate), 'dd/MM/yyyy', { locale: fr })
                        : '—'}
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {LEAVE_TYPES.includes(req.type) && req.endDate
                        ? format(new Date(req.endDate), 'dd/MM/yyyy', { locale: fr })
                        : '—'}
                    </TableCell>

                    <TableCell className="text-sm">
                      {req.type === 'Raise'
                        ? req.requestedAmount
                          ? `${new Intl.NumberFormat('fr-FR').format(req.requestedAmount)} FCFA`
                          : '—'
                        : LEAVE_TYPES.includes(req.type) && req.numberOfDays
                          ? `${req.numberOfDays} j.`
                          : '—'}
                    </TableCell>

                    <TableCell className="max-w-[180px]">
                      <p className="text-sm truncate text-muted-foreground" title={req.message}>
                        {req.message}
                      </p>
                    </TableCell>

                    <TableCell><StatusBadge status={req.status} /></TableCell>

                    {/* Colonne retour */}
                    <TableCell>
                      {LEAVE_TYPES.includes(req.type) && req.status === 'APPROUVE' && req.endDate ? (
                        req.returnedAt ? (
                          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {format(new Date(req.returnedAt), 'dd/MM', { locale: fr })}
                          </span>
                        ) : new Date(req.endDate) < today ? (
                          <span className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Non confirmé
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">En cours</span>
                        )
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {req.status === 'EN_ATTENTE' && (
                          <>
                            <button
                              className="flex h-7 w-7 items-center justify-center rounded-md border transition-colors hover:bg-green-50 disabled:opacity-50"
                              disabled={loadingId === req.id}
                              onClick={() => changeStatus(req, 'APPROUVE')}
                              title="Approuver"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                            </button>
                            <button
                              className="flex h-7 w-7 items-center justify-center rounded-md border transition-colors hover:bg-red-50 disabled:opacity-50"
                              disabled={loadingId === req.id}
                              onClick={() => changeStatus(req, 'REJETE')}
                              title="Rejeter"
                            >
                              <XCircle className="h-3.5 w-3.5 text-red-500" />
                            </button>
                          </>
                        )}

                        {/* Bouton confirmer le retour */}
                        {LEAVE_TYPES.includes(req.type)
                          && req.status === 'APPROUVE'
                          && req.endDate
                          && new Date(req.endDate) < today
                          && !req.returnedAt && (
                          <button
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-orange-300 transition-colors hover:bg-orange-50 disabled:opacity-50"
                            disabled={loadingId === req.id}
                            onClick={() => openReturnDialog(req)}
                            title="Confirmer le retour"
                          >
                            <LogIn className="h-3.5 w-3.5 text-orange-600" />
                          </button>
                        )}

                        {/* Télécharger le document */}
                        {req.type === 'Documents' && req.status === 'APPROUVE' && (
                          <a href={`/api/requests/${req.id}/document`} download title="Télécharger">
                            <button className="flex h-7 w-7 items-center justify-center rounded-md border transition-colors hover:bg-[#FF7E00]/[0.06]">
                              <Download className="h-3.5 w-3.5 text-blue-600" />
                            </button>
                          </a>
                        )}

                        <button
                          className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-red-50 disabled:opacity-50"
                          disabled={loadingId === req.id}
                          onClick={() => handleDelete(req.id)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </button>
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
      </>
    </div>
  );
};

export default RequestsView;
