import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { put } from '@vercel/blob';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) return new NextResponse('Aucun fichier fourni', { status: 400 });

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type))
    return new NextResponse('Format non supporté (jpg, png, webp, gif)', { status: 400 });

  if (file.size > 4 * 1024 * 1024)
    return new NextResponse('Fichier trop volumineux (max 4 Mo)', { status: 400 });

  try {
    // Téléversement vers Vercel Blob (stockage cloud)
    const blob = await put(`avatars/${file.name}`, file, {
      access: 'public',
      addRandomSuffix: true,
    });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    const detail =
      error instanceof Error ? `${error.name}: ${error.message}` : JSON.stringify(error);
    console.log('[UPLOAD_AVATAR]', detail);
    return new NextResponse('Erreur lors du téléversement', { status: 500 });
  }
}
