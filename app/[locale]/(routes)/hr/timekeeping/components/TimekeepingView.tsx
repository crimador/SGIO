'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { differenceInMinutes } from 'date-fns';
import { Clock, AlertCircle, Users } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import RightViewModal from '@/components/modals/right-view-modal';

import { columns } from '../table-components/columns';
import { NewTimekeepingForm } from './NewTimekeepingForm';
import { EmployeeDataTable as TimekeepingDataTable } from '../table-components/data-table';

type Entry = {
  id: string;
  timeIn: string;
  timeOut: string | null;
  verified: boolean;
  employeeID?: string;
  employee: { firstName: string; lastName: string; email: string };
};

const TimekeepingView = ({ data, crmData }: { data: Entry[]; crmData: any }) => {
  const t = useTranslations('TimekeepingPage');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;

  const { users } = crmData;

  const now = new Date();
  const thisMonth = data.filter((e) => {
    const d = new Date(e.timeIn);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  const totalMinutes = thisMonth.reduce((acc, e) => {
    if (!e.timeOut) return acc;
    const diff = differenceInMinutes(new Date(e.timeOut), new Date(e.timeIn));
    return acc + (diff > 0 ? diff : 0);
  }, 0);
  const totalH = Math.floor(totalMinutes / 60);
  const totalM = totalMinutes % 60;

  const unverified = data.filter((e) => !e.verified).length;
  const uniqueEmployees = new Set(thisMonth.map((e) => e.employee.email)).size;

  return (
    <div className="space-y-4">
      {/* ── KPI Cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="overflow-hidden">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardContent className="pb-4 pt-5 text-center">
            <p className="mb-1 text-xs text-gray-400">Heures ce mois</p>
            <p className="text-3xl font-bold text-blue-600">
              {totalH}h{String(totalM).padStart(2, '0')}
            </p>
            <p className="mt-1 flex items-center justify-center gap-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" /> {thisMonth.length} entrées
            </p>
          </CardContent>
        </Card>
        <Card className={`overflow-hidden ${unverified > 0 ? 'border-orange-300' : ''}`}>
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardContent className="pb-4 pt-5 text-center">
            <p className="mb-1 text-xs text-gray-400">Non validés</p>
            <p className={`text-3xl font-bold ${unverified > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {unverified}
            </p>
            <p className="mt-1 flex items-center justify-center gap-1 text-xs text-gray-400">
              <AlertCircle className="h-3 w-3" /> en attente de validation
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardContent className="pb-4 pt-5 text-center">
            <p className="mb-1 text-xs text-gray-400">Employés actifs</p>
            <p className="text-3xl font-bold" style={{ color: '#1E1D3D' }}>{uniqueEmployees}</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-xs text-gray-400">
              <Users className="h-3 w-3" /> ce mois
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Tableau ─────────────────────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
        <CardHeader className="pb-3 pt-5">
          <div className="flex items-center justify-between">
            <p className="text-base font-bold" style={{ color: '#1E1D3D' }}>{t('title')}</p>
            <RightViewModal label={'+'} title={t('createTimekeeping')} description="">
              <NewTimekeepingForm
                users={users}
                translations={{
                  employee: t('employee'),
                  timeIn: t('timeIn'),
                  timeOut: t('timeOut'),
                  verified: t('verified'),
                  createTimekeeping: t('createTimekeeping'),
                }}
              />
            </RightViewModal>
          </div>
        </CardHeader>

        <CardContent>
          {!data || data.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">{t('noTimekeepingFound')}</p>
          ) : (
            <TimekeepingDataTable data={data} columns={columns} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimekeepingView;
