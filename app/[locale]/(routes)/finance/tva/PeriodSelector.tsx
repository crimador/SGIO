'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const MONTHS = [
  { value: '1',  label: 'Janvier'   }, { value: '2',  label: 'Février'   },
  { value: '3',  label: 'Mars'      }, { value: '4',  label: 'Avril'     },
  { value: '5',  label: 'Mai'       }, { value: '6',  label: 'Juin'      },
  { value: '7',  label: 'Juillet'   }, { value: '8',  label: 'Août'      },
  { value: '9',  label: 'Septembre' }, { value: '10', label: 'Octobre'   },
  { value: '11', label: 'Novembre'  }, { value: '12', label: 'Décembre'  },
];

const QUARTERS = [
  { value: '1', label: '1er trimestre (Jan–Mar)' },
  { value: '2', label: '2e trimestre  (Avr–Jui)' },
  { value: '3', label: '3e trimestre  (Jui–Sep)' },
  { value: '4', label: '4e trimestre  (Oct–Déc)' },
];

const currentYear  = new Date().getFullYear();
const currentMonth = (new Date().getMonth() + 1).toString();
const YEARS = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

export function PeriodSelector() {
  const router     = useRouter();
  const sp         = useSearchParams();

  const [periode,   setPeriode]   = useState(sp.get('periode')   ?? 'mensuel');
  const [annee,     setAnnee]     = useState(sp.get('annee')     ?? currentYear.toString());
  const [mois,      setMois]      = useState(sp.get('mois')      ?? currentMonth);
  const [trimestre, setTrimestre] = useState(sp.get('trimestre') ?? '1');

  const submit = () => {
    const params = new URLSearchParams({ periode, annee });
    if (periode === 'mensuel')      params.set('mois',      mois);
    else                            params.set('trimestre', trimestre);
    router.push(`/finance/tva?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border border-[#FF7E00]/20 bg-[#FF7E00]/[0.03] p-4">
      {/* Périodicité */}
      <div className="space-y-1">
        <Label className="text-xs">Périodicité</Label>
        <Select value={periode} onValueChange={setPeriode}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mensuel">Mensuel</SelectItem>
            <SelectItem value="trimestriel">Trimestriel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Année */}
      <div className="space-y-1">
        <Label className="text-xs">Année</Label>
        <Select value={annee} onValueChange={setAnnee}>
          <SelectTrigger className="w-[110px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Mois ou trimestre */}
      {periode === 'mensuel' ? (
        <div className="space-y-1">
          <Label className="text-xs">Mois</Label>
          <Select value={mois} onValueChange={setMois}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-1">
          <Label className="text-xs">Trimestre</Label>
          <Select value={trimestre} onValueChange={setTrimestre}>
            <SelectTrigger className="w-[240px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUARTERS.map((q) => <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      <button
        onClick={submit}
        className="flex h-9 items-center rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
      >
        Générer
      </button>
    </div>
  );
}
