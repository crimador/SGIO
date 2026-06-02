import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { CalendarDays, CoinsIcon, User } from 'lucide-react';

import Link from 'next/link';
import { EnvelopeClosedIcon } from '@radix-ui/react-icons';
import moment from 'moment';

interface EmpViewProps {
  data: any;
}

export async function BasicView({ data }: EmpViewProps) {
  if (!data) return <div>Employé introuvable.</div>;
  return (
    <div className="space-y-5 pb-3">
      <Card className="overflow-hidden">
        <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
        <CardHeader className="pb-3 pt-5">
          <p className="text-base font-bold" style={{ color: '#1E1D3D' }}>
            {data.firstName} {data.lastName}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">ID : {data.id}</p>
        </CardHeader>
        <CardContent>
          <div className="grid w-full grid-cols-3">
            <div>
              <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-[#FF7E00]/[0.04]">
                <CoinsIcon className="mt-px h-5 w-5 text-gray-400" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none" style={{ color: '#1E1D3D' }}>Poste</p>
                  <p className="text-sm text-gray-400">
                    {data.position ? data.position : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-[#FF7E00]/[0.04]">
                <CoinsIcon className="mt-px h-5 w-5 text-gray-400" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none" style={{ color: '#1E1D3D' }}>Salaire</p>
                  <p className="text-sm text-gray-400">
                    {data.salary ? data.salary : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-[#FF7E00]/[0.04]">
                <CoinsIcon className="mt-px h-5 w-5 text-gray-400" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none" style={{ color: '#1E1D3D' }}>Date d&apos;embauche</p>
                  <p className="text-sm text-gray-400">
                    {moment(data.onBoarding).format('MMM DD YYYY')}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-[#FF7E00]/[0.04]">
                <User className="mt-px h-5 w-5 text-gray-400" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none" style={{ color: '#1E1D3D' }}>IBAN</p>
                  <p className="text-sm text-gray-400">
                    {data.IBAN ? data.IBAN : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-[#FF7E00]/[0.04]">
                <CalendarDays className="mt-px h-5 w-5 text-gray-400" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none" style={{ color: '#1E1D3D' }}>Créé le</p>
                  <p className="text-sm text-gray-400">
                    {moment(data.createdAt).format('MMM DD YYYY')}
                  </p>
                </div>
              </div>
              <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-[#FF7E00]/[0.04]">
                <CalendarDays className="mt-px h-5 w-5 text-gray-400" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none" style={{ color: '#1E1D3D' }}>Assurance</p>
                  <p className="text-sm text-gray-400">
                    {data.insurance ? data.insurance : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <CardContent className="gap-1">
                <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-[#FF7E00]/[0.04]">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none" style={{ color: '#1E1D3D' }}>E-mail</p>
                    {data?.email ? (
                      <Link
                        href={`mailto:${data.email}`}
                        className="flex items-center gap-5 text-sm text-gray-400 hover:underline"
                      >
                        {data.email}
                        <EnvelopeClosedIcon />
                      </Link>
                    ) : null}
                  </div>
                </div>
                <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-[#FF7E00]/[0.04]">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none" style={{ color: '#1E1D3D' }}>Téléphone</p>
                    <p className="text-sm text-gray-400">
                      {data.phone}
                    </p>
                  </div>
                </div>
                <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-[#FF7E00]/[0.04]">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none" style={{ color: '#1E1D3D' }}>Adresse</p>
                    <p className="text-sm text-gray-400">
                      {data.address}
                    </p>
                  </div>
                </div>
              </CardContent>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
