import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { crm_Opportunities } from '@prisma/client';
import {
  CalendarDays,
  ClipboardList,
  CoinsIcon,
  Combine,
  Landmark,
  List,
  Megaphone,
  SquareStack,
  TrendingUp,
  User,
} from 'lucide-react';
import moment from 'moment';
import { prismadb } from '@/lib/prisma';

interface OppsViewProps {
  data: {
    assigned_sales_stage: { name: string } | null;
    assigned_to_user: { name: string };
    assigned_account: { name: string } | null;
    assigned_type: { name: string } | null;
    assigned_campaings: { name: string } | null;
  } & crm_Opportunities;
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-[#FF7E00]/[0.05]">
      <Icon className="mt-px h-5 w-5 shrink-0" style={{ color: '#FF7E00' }} />
      <div className="space-y-1">
        <p className="text-sm font-medium leading-none" style={{ color: '#1E1D3D' }}>{label}</p>
        <p className="text-sm text-gray-500">{value}</p>
      </div>
    </div>
  );
}

export async function BasicView({ data }: OppsViewProps) {
  const users = await prismadb.users.findMany();
  if (!data) return <div>Opportunité introuvable</div>;

  const createdBy = users.find((u) => u.id === data.createdBy)?.name ?? '—';
  const updatedBy = users.find((u) => u.id === data.updatedBy)?.name ?? '—';

  return (
    <Card className="overflow-hidden">
      <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
      <CardHeader className="pb-3 pt-5">
        <p className="text-lg font-bold" style={{ color: '#1E1D3D' }}>{data.name}</p>
        {data.assigned_sales_stage && (
          <p className="mt-0.5 text-sm text-gray-400">{data.assigned_sales_stage.name}</p>
        )}
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-1">
        {/* Colonne gauche */}
        <div>
          <p
            className="mb-2 border-l-[3px] pl-3 text-xs font-semibold uppercase tracking-wide text-gray-400"
            style={{ borderColor: '#FF7E00' }}
          >
            Détails
          </p>
          <InfoRow
            icon={CoinsIcon}
            label="Budget (FCFA)"
            value={data.budget ? Number(data.budget).toLocaleString('fr-FR') : null}
          />
          <InfoRow
            icon={TrendingUp}
            label="Revenu attendu (FCFA)"
            value={data.expected_revenue ? Number(data.expected_revenue).toLocaleString('fr-FR') : null}
          />
          <InfoRow icon={SquareStack} label="Étape commerciale" value={data.assigned_sales_stage?.name} />
          <InfoRow icon={Combine} label="Prochaine étape" value={data.next_step} />
          <InfoRow icon={ClipboardList} label="Description" value={data.description} />
          <InfoRow icon={User} label="Responsable" value={data.assigned_to_user?.name} />
        </div>

        {/* Colonne droite */}
        <div>
          <p
            className="mb-2 border-l-[3px] pl-3 text-xs font-semibold uppercase tracking-wide text-gray-400"
            style={{ borderColor: '#FF7E00' }}
          >
            Suivi
          </p>
          <InfoRow icon={Landmark} label="Client associé" value={data.assigned_account?.name} />
          <InfoRow
            icon={CalendarDays}
            label="Date de clôture prévue"
            value={data.close_date ? moment(data.close_date).format('DD/MM/YYYY') : null}
          />
          <InfoRow
            icon={CalendarDays}
            label="Créé le"
            value={data.createdAt ? `${moment(data.createdAt).format('DD/MM/YYYY')} par ${createdBy}` : null}
          />
          <InfoRow
            icon={CalendarDays}
            label="Dernière mise à jour"
            value={data.updatedAt ? `${moment(data.updatedAt).format('DD/MM/YYYY')} par ${updatedBy}` : null}
          />
          <InfoRow icon={List} label="Type de vente" value={data.assigned_type?.name} />
          <InfoRow icon={Megaphone} label="Campagne" value={data.assigned_campaings?.name} />
        </div>
      </CardContent>
    </Card>
  );
}
