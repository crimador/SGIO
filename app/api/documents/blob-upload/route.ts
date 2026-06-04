import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Génère un jeton d'upload pour que le navigateur envoie le fichier
// DIRECTEMENT vers Vercel Blob (sans passer par ce serveur).
// Cela contourne la limite de 4,5 Mo des fonctions Vercel et accélère l'upload.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN?.trim(),
      onBeforeGenerateToken: async () => {
        const session = await getServerSession(authOptions);
        if (!session) throw new Error('Non authentifié');
        return {
          addRandomSuffix: true,
          maximumSizeInBytes: 64 * 1024 * 1024, // 64 Mo
        };
      },
      onUploadCompleted: async () => {
        // L'enregistrement en base se fait côté client après l'upload (plus fiable)
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Erreur';
    console.log('[BLOB_UPLOAD_TOKEN]', detail);
    return NextResponse.json({ error: detail }, { status: 400 });
  }
}
