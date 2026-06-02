import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  CalendarDays,
  CoinsIcon,
  Facebook,
  Instagram,
  LayoutGrid,
  Linkedin,
  Twitter,
  User,
  Youtube,
} from 'lucide-react';
import moment from 'moment';
import { prismadb } from '@/lib/prisma';
import Link from 'next/link';
import { EnvelopeClosedIcon } from '@radix-ui/react-icons';

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
  if (!data) return <div>Contact introuvable</div>;

  const responsable = users.find((u) => u.id === data.assigned_to)?.name ?? '—';
  const createdBy   = users.find((u) => u.id === data.createdBy)?.name ?? '—';
  const updatedBy   = users.find((u) => u.id === data.updatedBy)?.name ?? '—';

  return (
    <div className="space-y-5 pb-3">
      {/* Carte principale */}
      <Card className="overflow-hidden">
        <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
        <CardHeader className="pb-3 pt-5">
          <p className="text-lg font-bold" style={{ color: '#1E1D3D' }}>
            {data.first_name} {data.last_name}
          </p>
          {data.position && (
            <p className="mt-0.5 text-sm text-gray-400">{data.position}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid w-full grid-cols-2">
            {/* Colonne gauche */}
            <div>
              <p
                className="mb-2 border-l-[3px] pl-3 text-xs font-semibold uppercase tracking-wide text-gray-400"
                style={{ borderColor: '#FF7E00' }}
              >
                Informations
              </p>
              <InfoRow icon={CoinsIcon} label="Société" value={data.assigned_accounts?.name} />
              <InfoRow icon={CoinsIcon} label="Fonction" value={data.position} />
              <InfoRow
                icon={CoinsIcon}
                label="Date de naissance"
                value={data.birthday ? moment(data.birthday).format('DD/MM/YYYY') : null}
              />
              <InfoRow icon={CoinsIcon} label="Description" value={data.description} />
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
                value={data.created_on ? `${moment(data.created_on).format('DD/MM/YYYY')} par ${createdBy}` : null}
              />
              <InfoRow
                icon={CalendarDays}
                label="Dernière mise à jour"
                value={data.updatedAt ? `${moment(data.updatedAt).format('DD/MM/YYYY')} par ${updatedBy}` : null}
              />
              <InfoRow icon={CoinsIcon} label="Statut" value={data.status ? 'Actif' : 'Inactif'} />
              <InfoRow icon={CoinsIcon} label="Type" value={data.type} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid w-full grid-cols-2 gap-3">
        {/* Coordonnées */}
        <Card className="overflow-hidden">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardHeader className="pb-3 pt-5">
            <p className="text-sm font-semibold" style={{ color: '#1E1D3D' }}>Coordonnées</p>
          </CardHeader>
          <CardContent className="gap-1">
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
            <InfoRow
              icon={EnvelopeClosedIcon as React.ElementType}
              label="E-mail personnel"
              value={
                data.personal_email ? (
                  <Link href={`mailto:${data.personal_email}`} className="hover:underline" style={{ color: '#FF7E00' }}>
                    {data.personal_email}
                  </Link>
                ) : null
              }
            />
            <InfoRow icon={CoinsIcon} label="Tél. bureau" value={data.office_phone} />
            <InfoRow icon={CoinsIcon} label="Tél. mobile" value={data.mobile_phone} />
            <InfoRow icon={CoinsIcon} label="Site web" value={data.website} />
          </CardContent>
        </Card>

        {/* Réseaux sociaux */}
        <Card className="overflow-hidden">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <CardHeader className="pb-3 pt-5">
            <p className="text-sm font-semibold" style={{ color: '#1E1D3D' }}>Réseaux sociaux</p>
          </CardHeader>
          <CardContent className="gap-1">
            <InfoRow icon={Twitter} label="Twitter" value={data.social_twitter} />
            <InfoRow icon={Facebook} label="Facebook" value={data.social_facebook} />
            <InfoRow icon={Linkedin} label="LinkedIn" value={data.social_linkedin} />
            <InfoRow icon={LayoutGrid} label="Skype" value={data.social_skype} />
            <InfoRow icon={Instagram} label="Instagram" value={data.social_instagram} />
            <InfoRow icon={Youtube} label="YouTube" value={data.social_youtube} />
            <InfoRow icon={LayoutGrid} label="TikTok" value={data.social_tiktok} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
