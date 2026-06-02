'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, AlertTriangle } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import RightViewModal from '@/components/modals/right-view-modal';

import { getColumns } from '../table-components/columns';
import { CongesDataTable } from '../table-components/data-table';
import { NewRequestForm } from '../../components/NewRequestForm';

type Employee = { id: string; firstName: string; lastName: string; onBoarding?: string | null };

type RequestData = {
  id: string;
  employeeID: string;
  employee: { firstName: string; lastName: string; position?: string | null; onBoarding?: string | null };
  type: string;
  status: 'EN_ATTENTE' | 'APPROUVE' | 'REJETE';
  message: string;
  startDate: string;
  endDate?: string | null;
  numberOfDays?: number | null;
  requestedAmount?: number | null;
  documentType?: string | null;
  legalDays?: number | null;
  returnedAt?: string | null;
  createdAt?: string;
};

const LEAVE_TYPES = ['Vacation', 'Leave', 'Sick', 'Maternity', 'Training'];

const CongesView = ({ data, employees, canApprove }: { data: RequestData[]; employees: Employee[]; canApprove: boolean }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pending = data.filter((r) => r.status === 'EN_ATTENTE').length;
  const approved = data.filter((r) => r.status === 'APPROUVE').length;
  const pendingReturns = data.filter(
    (r) =>
      r.status === 'APPROUVE' &&
      LEAVE_TYPES.includes(r.type) &&
      r.endDate &&
      new Date(r.endDate) < today &&
      !r.returnedAt
  ).length;

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
              <AlertTriangle className="h-3 w-3" /> à confirmer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Tableau ─────────────────────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
        <CardHeader className="pb-3 pt-5">
          <div className="flex items-center justify-between">
            <p className="text-base font-bold" style={{ color: '#1E1D3D' }}>
              Congés &amp; Demandes
            </p>
            <RightViewModal label="+ Nouvelle demande" title="Soumettre une demande" description="">
              <NewRequestForm employees={employees} />
            </RightViewModal>
          </div>
        </CardHeader>
        <CardContent>
          {!data || data.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">Aucune demande trouvée</p>
          ) : (
            <CongesDataTable data={data} columns={getColumns(canApprove)} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CongesView;
