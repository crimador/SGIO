import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { utapi, toSafeFile } from '@/lib/server/uploadthings';

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

    // Téléversement vers UploadThing (stockage cloud) au lieu du disque local
    // Le nom est nettoyé en ASCII (UploadThing rejette les accents/puces dans les en-têtes)
    const safeFile = toSafeFile(file);
    const uploaded = await utapi.uploadFiles(safeFile);

    if (uploaded.error || !uploaded.data) {
      const detail = JSON.stringify(uploaded.error ?? 'no data');
      console.log('[DOCUMENTS_UPLOAD_POST] UploadThing error:', detail);
      return NextResponse.json(
        { error: 'Erreur lors du téléversement', detail },
        { status: 500 }
      );
    }

    const { url, key } = uploaded.data;

    const doc = await prismadb.documents.create({
      data: {
        document_name: documentName || file.name,
        description: description || null,
        document_file_url: url,
        key,
        size: file.size,
        document_file_mimeType: file.type || 'application/octet-stream',
        document_system_type: (documentType as any) || null,
        createdBy: session.user.id,
        created_by_user: session.user.id,
        assigned_user: session.user.id,
        localFile: url,
      },
    });

    return NextResponse.json({ documentId: doc.id, url });
  } catch (error) {
    const detail =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : JSON.stringify(error);
    console.log('[DOCUMENTS_UPLOAD_POST]', detail);
    return NextResponse.json({ error: 'Erreur serveur', detail }, { status: 500 });
  }
}
