import { prismadb } from '@/lib/prisma';
import { FacturationExportCard, DepensesExportCard, TresorerieExportCard } from './ExportCards';

export default async function ExportPage() {
  const accounts = await prismadb.treasuryAccount.findMany({
    where:   { isActive: true },
    select:  { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1E1D3D' }}>Export des données</h1>
        <div className="mt-1 h-[3px] w-10 rounded-full" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
        <p className="mt-2 text-sm text-gray-400">
          Téléchargez vos données au format CSV (compatible Excel, LibreOffice Calc).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <FacturationExportCard />
        <DepensesExportCard />
        <TresorerieExportCard accounts={accounts} />
      </div>

      <div className="rounded-xl border border-[#FF7E00]/20 bg-[#FF7E00]/[0.03] p-4 text-sm text-gray-500">
        <strong style={{ color: '#1E1D3D' }}>Format CSV :</strong> séparateur point-virgule (;), encodage UTF-8 avec BOM.
        Ouvrez directement dans Excel ou LibreOffice Calc — les accents et les montants s&apos;affichent correctement.
      </div>
    </div>
  );
}
