import { Suspense } from 'react';
import { getTvaReport, type TvaPeriodType } from '@/actions/finance/get-tva-report';
import { PeriodSelector } from './PeriodSelector';
import { TvaReportDisplay } from './TvaReportDisplay';

type SearchParams = { periode?: string; annee?: string; mois?: string; trimestre?: string };

export default async function TvaPage({ searchParams }: { searchParams: SearchParams }) {
  const now     = new Date();
  const periode = searchParams.periode === 'trimestriel' ? 'TRIMESTRIEL' : 'MENSUEL';
  const year    = parseInt(searchParams.annee    ?? now.getFullYear().toString(),  10);
  const month   = parseInt(searchParams.mois     ?? (now.getMonth() + 1).toString(), 10);
  const quarter = parseInt(searchParams.trimestre ?? '1', 10);

  const report = await getTvaReport(
    periode === 'MENSUEL'
      ? { type: 'MENSUEL' as TvaPeriodType, year, month }
      : { type: 'TRIMESTRIEL' as TvaPeriodType, year, quarter }
  );

  const pdfParams = new URLSearchParams({
    periode: periode.toLowerCase(),
    annee:   year.toString(),
    ...(periode === 'MENSUEL'       ? { mois:      month.toString()   } : {}),
    ...(periode === 'TRIMESTRIEL'   ? { trimestre: quarter.toString() } : {}),
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1E1D3D' }}>Rapport TVA</h1>
        <div className="mt-1 h-[3px] w-10 rounded-full" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
        <p className="mt-2 text-sm text-gray-400">
          Synthèse de la TVA collectée pour votre déclaration DGI Togo
        </p>
      </div>

      <Suspense fallback={null}>
        <PeriodSelector />
      </Suspense>

      <TvaReportDisplay
        report={report}
        pdfUrl={`/api/finance/tva/pdf?${pdfParams.toString()}`}
      />
    </div>
  );
}
