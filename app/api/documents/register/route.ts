import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Enregistre en base un document déjà téléversé sur Vercel Blob.
// Appelée par le client juste après que l'upload direct soit terminé.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  try {
    const {
      url,
      pathname,
      size,
      mimeType,
      documentType,
      documentName,
      description,
      originalName,
    } = await req.json();

    if (!url) return new NextResponse('URL du fichier manquante', { status: 400 });

    const doc = await prismadb.documents.create({
      data: {
        document_name: documentName || originalName || pathname,
        description: description || null,
        document_file_url: url,
        key: pathname || null,
        size: size || null,
        document_file_mimeType: mimeType || 'application/octet-stream',
        document_system_type: documentType || null,
        createdBy: session.user.id,
        created_by_user: session.user.id,
        assigned_user: session.user.id,
        localFile: url,
      },
    });

    return NextResponse.json({ documentId: doc.id, url });
  } catch (error) {
    const detail =
      error instanceof Error ? `${error.name}: ${error.message}` : JSON.stringify(error);
    console.log('[DOCUMENTS_REGISTER]', detail);
    return NextResponse.json({ error: 'Erreur serveur', detail }, { status: 500 });
  }
}
