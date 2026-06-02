import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop() ?? 'bin';
    const filename = `${crypto.randomUUID()}.${ext}`;

    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);

    const url = `/uploads/${filename}`;

    const doc = await prismadb.documents.create({
      data: {
        document_name: documentName || file.name,
        description: description || null,
        document_file_url: url,
        key: filename,
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
