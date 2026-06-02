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
  if (!data) return <div>Employé introuvable</div>;
  return (
    <div className="space-y-5 pb-3">
      <Card>
        <CardHeader className="pb-3">
          <p className="text-base font-bold" style={{ color: '#1E1D3D' }}>
            {data.firstName} {data.lastName}
          </p>
          <p className="text-sm text-gray-400">ID:{data.id}</p>
        </CardHeader>
        <CardContent>
          <div className="grid w-full grid-cols-3">
            <div>
              <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                <CoinsIcon className="mt-px h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Poste</p>
                  <p className="text-sm text-gray-400">
                    {data.position ? data.position : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                <CoinsIcon className="mt-px h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Salaire</p>
                  <p className="text-sm text-gray-400">
                    {data.salary ? data.salary : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                <CoinsIcon className="mt-px h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Embauche</p>
                  <p className="text-sm text-gray-400">
                    {moment(data.onBoarding).format('MMM DD YYYY')}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                <User className="mt-px h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">IBAN</p>
                  <p className="text-sm text-gray-400">
                    {data.IBAN ? data.IBAN : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                <CalendarDays className="mt-px h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Créé le</p>
                  <p className="text-sm text-gray-400">
                    {moment(data.createdAt).format('MMM DD YYYY')}
                  </p>
                </div>
              </div>
              <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                <CalendarDays className="mt-px h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Assurance</p>
                  <p className="text-sm text-gray-400">
                    {data.insurance ? data.insurance : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="">
              <CardContent className="gap-1">
                <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">E-mail</p>
                    {data?.email ? (
                      <Link
                        href={`mailto:${data.email}`}
                        className="flex items-center gap-5 text-sm text-gray-400"
                      >
                        {data.email}
                        <EnvelopeClosedIcon />
                      </Link>
                    ) : null}
                  </div>
                </div>
                <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Téléphone</p>
                    <p className="text-sm text-gray-400">
                      {data.phone}
                    </p>
                  </div>
                </div>
                <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Adresse</p>
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
