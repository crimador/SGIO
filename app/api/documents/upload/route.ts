import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { utapi } from '@/lib/server/uploadthings';

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
    const uploaded = await utapi.uploadFiles(file);

    if (uploaded.error || !uploaded.data) {
      console.log('[DOCUMENTS_UPLOAD_POST] UploadThing error', uploaded.error);
      return new NextResponse('Erreur lors du téléversement', { status: 500 });
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
    console.log('[DOCUMENTS_UPLOAD_POST]', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}
