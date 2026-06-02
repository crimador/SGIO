'use client';

import { useEffect, useState } from 'react';
import { Banknote, FileText, Send } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import RightViewModal from '@/components/modals/right-view-modal';

import { columns } from '../table-components/columns';
import { PayslipDataTable } from '../table-components/data-table';
import { NewPayslipForm } from '../../components/NewPayslipForm';

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  salary: number;
  position?: string | null;
};

type PayslipData = {
  id: string;
  employeeID: string;
  employee: { firstName: string; lastName: string; position?: string | null };
  period: string;
  baseSalary: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
  status: 'BROUILLON' | 'EMIS' | 'PAYE';
  notes?: string | null;
};

const PayslipView = ({ data, employees }: { data: PayslipData[]; employees: Employee[] }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;

  const now = new Date();
  const thisYear = now.getFullYear();

  const totalNet = data
    .filter((p) => p.status === 'PAYE' && p.period.startsWith(String(thisYear)))
    .reduce((sum, p) => sum + p.netSalary, 0);

  const brouillon = data.filter((p) => p.status === 'BROUILLON').length;
  const emis = data.filter((p) => p.status === 'EMIS').length;

  return (
    <div className="space-y-4">
      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="overflow-hidden">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardContent className="pb-4 pt-5 text-center">
            <p className="mb-1 text-xs text-gray-400">Net payé ({thisYear})</p>
            <p className="text-2xl font-bold text-green-600">
              {totalNet.toLocaleString('fr-FR')} FCFA
            </p>
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

      {/* ── Tableau ─────────────────────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
        <CardHeader className="pb-3 pt-5">
          <div className="flex items-center justify-between">
            <p className="text-base font-bold" style={{ color: '#1E1D3D' }}>
              Bulletins de paie
            </p>
            <RightViewModal label="+ Nouveau bulletin" title="Créer un bulletin de paie" description="">
              <NewPayslipForm employees={employees} />
            </RightViewModal>
          </div>
        </CardHeader>
        <CardContent>
          {!data || data.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">Aucun bulletin de paie</p>
          ) : (
            <PayslipDataTable data={data} columns={columns} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PayslipView;
