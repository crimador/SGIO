import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { utapi, toAsciiFileName } from '@/lib/server/uploadthings';

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

    // Téléversement vers UploadThing (stockage cloud) au lieu du disque local.
    // On reconstruit le fichier depuis un Buffer avec un nom 100% ASCII
    // (UploadThing rejette les accents/puces dans les en-têtes HTTP).
    const safeName = toAsciiFileName(file.name);
    const arrayBuffer = await file.arrayBuffer();
    const safeFile = new File([arrayBuffer], safeName, {
      type: file.type || 'application/octet-stream',
    });

    console.log(`[DOCUMENTS_UPLOAD_POST] original="${file.name}" safe="${safeName}"`);

    let url: string;
    let key: string;
    try {
      const uploaded = await utapi.uploadFiles(safeFile);
      if (uploaded.error || !uploaded.data) {
        const detail = `safe="${safeName}" error=${JSON.stringify(uploaded.error ?? 'no data')}`;
        return NextResponse.json(
          { error: 'Erreur lors du téléversement', detail },
          { status: 500 }
        );
      }
      url = uploaded.data.url;
      key = uploaded.data.key;
    } catch (upErr: any) {
      // On extrait un maximum de détails de l'erreur UploadThing
      const parts: string[] = [];
      if (upErr?.message) parts.push(`message=${upErr.message}`);
      if (upErr?.code) parts.push(`code=${upErr.code}`);
      if (upErr?.data) parts.push(`data=${JSON.stringify(upErr.data)}`);
      if (upErr?.cause) {
        const c = upErr.cause;
        parts.push(`cause=${typeof c === 'object' ? JSON.stringify(c, Object.getOwnPropertyNames(c)) : String(c)}`);
      }
      const all = JSON.stringify(upErr, Object.getOwnPropertyNames(upErr ?? {}));
      const detail = `UPLOAD THREW · ${parts.join(' · ')} · raw=${all}`;
      console.log('[DOCUMENTS_UPLOAD_POST]', detail);
      return NextResponse.json({ error: 'Erreur upload', detail }, { status: 500 });
    }

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
    const msg =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : JSON.stringify(error);
    console.log('[DOCUMENTS_UPLOAD_POST]', msg);
    return NextResponse.json({ error: 'Erreur serveur', detail: msg }, { status: 500 });
  }
}
