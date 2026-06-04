import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';

export const dynamic = 'force-dynamic';

async function deleteStoredFile(url: string | null) {
  if (!url) return;
  try {
    await del(url);
  } catch {
    // fichier absent ou déjà supprimé — pas bloquant
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { documentId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  try {
    const body = await req.json();

    // Association compte CRM
    if (body.accountId && body.action) {
      const { accountId, action } = body as {
        accountId: string;
        action: 'connect' | 'disconnect';
      };
      const updated = await prismadb.documents.update({
        where: { id: params.documentId },
        data: { accounts: { [action]: [{ id: accountId }] } },
        include: { accounts: { select: { id: true, name: true } } },
      });
      return NextResponse.json(updated);
    }

    // Mise à jour des métadonnées (nom, type, description)
    const data: Record<string, string | null> = {};
    if (body.documentName !== undefined) data.document_name = body.documentName;
    if (body.documentType !== undefined)
      data.document_system_type = body.documentType || null;
    if (body.description !== undefined) data.description = body.description;

    const updated = await prismadb.documents.update({
      where: { id: params.documentId },
      data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.log('[DOCUMENT_PATCH]', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { documentId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  try {
    if (!params.documentId)
      return new NextResponse('Document ID requis', { status: 404 });

    const document = await prismadb.documents.findUnique({
      where: { id: params.documentId },
    });

    if (!document) {
      return new NextResponse('Document introuvable', { status: 404 });
    }

    await prismadb.documents.delete({ where: { id: params.documentId } });

    // Suppression du fichier sur Vercel Blob (via son URL)
    await deleteStoredFile(document.document_file_url);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log('[DOCUMENT_DELETE]', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}
