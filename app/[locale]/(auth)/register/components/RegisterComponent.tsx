'use client';

import Link from 'next/link';
import { ShieldOff } from 'lucide-react';

export function RegisterComponent() {
  return (
    <div className="text-center">

      {/* Entête */}
      <div className="mb-8">
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ color: '#1E1D3D' }}
        >
          Accès restreint
        </h2>
        <p className="mt-1.5 text-sm text-gray-500">
          Inscription désactivée
        </p>
        <div
          className="mx-auto mt-4 h-[3px] w-10 rounded-full"
          style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }}
        />
      </div>

      {/* Icône */}
      <div
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: '#1E1D3D' }}
      >
        <ShieldOff className="h-8 w-8" style={{ color: '#FAC731' }} />
      </div>

      {/* Message */}
      <p className="text-sm font-medium text-gray-700 mb-2">
        L&apos;accès à cet ERP est réservé aux membres de KEKELI GROUP.
      </p>
      <p className="text-sm text-gray-500 mb-8">
        Les comptes sont créés uniquement par l&apos;administrateur.
        <br />
        Contactez votre responsable pour obtenir vos identifiants.
      </p>

      {/* Bouton retour */}
      <Link
        href="/sign-in"
        className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white
                   transition-all duration-200 active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
      >
        Retour à la connexion
      </Link>

    </div>
  );
}
