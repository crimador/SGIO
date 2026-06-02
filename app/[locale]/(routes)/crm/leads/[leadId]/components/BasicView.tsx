import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  CalendarDays,
  CoinsIcon,
  File,
  Globe2,
  Landmark,
  Medal,
  Megaphone,
  Phone,
  User,
} from 'lucide-react';
import moment from 'moment';
import { prismadb } from '@/lib/prisma';
import Link from 'next/link';
import { EnvelopeClosedIcon, LightningBoltIcon } from '@radix-ui/react-icons';

interface OppsViewProps {
  data: any;
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
  if (!data) return <div>Prospect introuvable</div>;

  const responsable = users.find((u) => u.id === data.assigned_to)?.name ?? '—';
  const createdBy   = users.find((u) => u.id === data.createdBy)?.name ?? '—';
  const updatedBy   = users.find((u) => u.id === data.updatedBy)?.name ?? '—';

  return (
    <div className="space-y-5 pb-3">
      <Card className="overflow-hidden">
        <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
        <CardHeader className="pb-3 pt-5">
          <p className="text-lg font-bold" style={{ color: '#1E1D3D' }}>
            {data.firstName} {data.lastName}
          </p>
          {data.company && (
            <p className="mt-0.5 text-sm text-gray-400">{data.company}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid w-full grid-cols-2 gap-5">
            {/* Colonne gauche */}
            <div>
              <p
                className="mb-2 border-l-[3px] pl-3 text-xs font-semibold uppercase tracking-wide text-gray-400"
                style={{ borderColor: '#FF7E00' }}
              >
                Informations
              </p>
              <InfoRow icon={User} label="Nom complet" value={`${data.firstName} ${data.lastName}`} />
              <InfoRow icon={Landmark} label="Entreprise" value={data.company} />
              <InfoRow icon={Medal} label="Poste" value={data.jobTitle} />
              <InfoRow icon={File} label="Description" value={data.description} />
              <InfoRow
                icon={EnvelopeClosedIcon as React.ElementType}
                label="E-mail"
                value={
                  data.email ? (
                    <Link href={`mailto:${data.email}`} className="hover:underline" style={{ color: '#FF7E00' }}>
                      {data.email}
                    </Link>
                  ) : null
                }
              />
              <InfoRow icon={Globe2} label="Site web" value={data.website} />
              <InfoRow icon={Phone} label="Téléphone" value={data.phone} />
            </div>

            {/* Colonne droite */}
            <div>
              <p
                className="mb-2 border-l-[3px] pl-3 text-xs font-semibold uppercase tracking-wide text-gray-400"
                style={{ borderColor: '#FF7E00' }}
              >
                Suivi
              </p>
              <InfoRow icon={User} label="Responsable" value={responsable} />
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
              <InfoRow icon={LightningBoltIcon as React.ElementType} label="Statut" value={data.status} />
              <InfoRow icon={CoinsIcon} label="Source" value={data.lead_source} />
              <InfoRow icon={CoinsIcon} label="Référé par" value={data.refered_by} />
              <InfoRow icon={Megaphone} label="Campagne" value={data.campaign} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
