import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  BadgePercent,
  Building2,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  Coins,
  Factory,
  FileText,
  Landmark,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import moment from 'moment';
import { prismadb } from '@/lib/prisma';
import Link from 'next/link';
import { LightningBoltIcon } from '@radix-ui/react-icons';

interface BasicViewProps {
  data: any;
}

const REGIME_FISCAL_LABELS: Record<string, string> = {
  reel_tva: 'Réel avec TVA',
  reel_sans_tva: 'Réel sans TVA',
  tpu: 'TPU',
};

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

export async function BasicView({ data }: BasicViewProps) {
  const users = await prismadb.users.findMany();
  if (!data) return <div>Client introuvable</div>;

  const assignedUser = data.assigned_to_user?.name ?? '—';
  const createdByUser = users.find((u) => u.id === data.createdBy)?.name ?? '—';
  const updatedByUser = users.find((u) => u.id === data.updatedBy)?.name ?? '—';
  const regimeFiscalLabel = data.regimeFiscal
    ? (REGIME_FISCAL_LABELS[data.regimeFiscal] ?? data.regimeFiscal)
    : null;

  return (
    <div className="space-y-5 pb-3">
      {/* Carte principale */}
      <Card className="overflow-hidden">
        <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
        <CardHeader className="pb-3 pt-5">
          <div className="flex w-full justify-between">
            <div>
              <p className="text-lg font-bold" style={{ color: '#1E1D3D' }}>{data.name}</p>
              <div className="mt-1 flex items-center gap-3 text-sm text-gray-400">
                {data.status && (
                  <span className="inline-flex items-center gap-1">
                    <LightningBoltIcon className="h-3 w-3" />
                    {data.status}
                  </span>
                )}
                {data.industry_type?.name && (
                  <span>{data.industry_type.name}</span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid w-full grid-cols-2 gap-2">
            {/* Colonne gauche — Informations de contact */}
            <div>
              <p
                className="mb-2 border-l-[3px] pl-3 text-xs font-semibold uppercase tracking-wide text-gray-400"
                style={{ borderColor: '#FF7E00' }}
              >
                Contact
              </p>
              <InfoRow icon={Phone} label="Téléphone" value={data.office_phone} />
              <InfoRow
                icon={Mail}
                label="E-mail"
                value={
                  data.email ? (
                    <Link href={`mailto:${data.email}`} className="hover:underline" style={{ color: '#FF7E00' }}>
                      {data.email}
                    </Link>
                  ) : null
                }
              />
              <InfoRow icon={User} label="Responsable du dossier" value={assignedUser} />
              <InfoRow
                icon={Coins}
                label="Chiffre d'affaires annuel"
                value={
                  data.annual_revenue
                    ? `${Number(data.annual_revenue).toLocaleString('fr-FR')} FCFA`
                    : null
                }
              />
              <InfoRow icon={FileText} label="Notes internes" value={data.description} />
            </div>

            {/* Colonne droite — Traçabilité */}
            <div>
              <p
                className="mb-2 border-l-[3px] pl-3 text-xs font-semibold uppercase tracking-wide text-gray-400"
                style={{ borderColor: '#FF7E00' }}
              >
                Historique
              </p>
              <InfoRow
                icon={CalendarDays}
                label="Créé le"
                value={
                  data.createdAt
                    ? `${moment(data.createdAt).format('DD/MM/YYYY')} par ${createdByUser}`
                    : null
                }
              />
              <InfoRow
                icon={CalendarDays}
                label="Dernière modification"
                value={
                  data.updatedAt
                    ? `${moment(data.updatedAt).format('DD/MM/YYYY')} par ${updatedByUser}`
                    : null
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid w-full grid-cols-2 gap-3">
        {/* Carte informations légales */}
        <Card className="overflow-hidden">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardHeader className="pb-3 pt-5">
            <p className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#1E1D3D' }}>
              <Landmark className="h-4 w-4" style={{ color: '#FF7E00' }} />
              Informations légales (Togo)
            </p>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoRow icon={ClipboardList} label="NIF" value={data.nif} />
            <InfoRow icon={Building2} label="RCCM" value={data.rccm} />
            <InfoRow icon={BadgePercent} label="Régime fiscal" value={regimeFiscalLabel} />
            <InfoRow icon={Landmark} label="Centre des impôts" value={data.centreImpots} />
            <InfoRow
              icon={CalendarCheck}
              label="Date de clôture d'exercice"
              value={
                data.dateCloture
                  ? moment(data.dateCloture).format('DD/MM/YYYY')
                  : null
              }
            />
          </CardContent>
        </Card>

        {/* Carte adresse */}
        <Card className="overflow-hidden">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardHeader className="pb-3 pt-5">
            <p className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#1E1D3D' }}>
              <MapPin className="h-4 w-4" style={{ color: '#FF7E00' }} />
              Adresse
            </p>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoRow icon={MapPin} label="Rue / Quartier" value={data.billing_street} />
            <InfoRow icon={MapPin} label="Ville" value={data.billing_city} />
            <InfoRow icon={Factory} label="Pays" value={data.billing_country} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
