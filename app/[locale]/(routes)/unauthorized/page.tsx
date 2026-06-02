import Link from 'next/link';
import { ShieldOff } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <ShieldOff className="h-16 w-16 text-gray-400 opacity-40" />
      <h1 className="text-2xl font-bold">Accès refusé</h1>
      <p className="text-gray-400 max-w-sm">
        Vous n&apos;avez pas les droits nécessaires pour accéder à cette section.
        Contactez votre administrateur si vous pensez qu&apos;il s&apos;agit d&apos;une erreur.
      </p>
      <Link
        href="/"
        className="flex h-9 items-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-gray-50"
        style={{ color: '#1E1D3D' }}
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
