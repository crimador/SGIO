import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const documentType = (formData.get('documentType') as string) || null;
    const documentName = (formData.get('documentName') as string) || null;
    const description = (formData.get('description') as string) || null;

    if (!file) {
      return new NextResponse('Aucun fichier fourni', { status: 400 });
    }

    // Téléversement vers Vercel Blob (stockage cloud).
    // Vercel Blob gère les noms accentués et ajoute un suffixe aléatoire
    // pour éviter les collisions de noms.
    const blob = await put(`documents/${file.name}`, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    const doc = await prismadb.documents.create({
      data: {
        document_name: documentName || file.name,
        description: description || null,
        document_file_url: blob.url,
        key: blob.pathname,
        size: file.size,
        document_file_mimeType: file.type || 'application/octet-stream',
        document_system_type: (documentType as any) || null,
        createdBy: session.user.id,
        created_by_user: session.user.id,
        assigned_user: session.user.id,
        localFile: blob.url,
      },
    });

    return NextResponse.json({ documentId: doc.id, url: blob.url });
  } catch (error) {
    const detail =
      error instanceof Error ? `${error.name}: ${error.message}` : JSON.stringify(error);
    console.log('[DOCUMENTS_UPLOAD_POST]', detail);
    return NextResponse.json({ error: 'Erreur serveur', detail }, { status: 500 });
  }
}
