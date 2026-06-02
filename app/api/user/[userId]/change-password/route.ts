import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });
  if (session.user.id !== params.userId) return new NextResponse('Forbidden', { status: 403 });

  const { password } = await req.json();
  if (!password || password.length < 8) {
    return new NextResponse('Mot de passe trop court (8 caractères minimum)', { status: 400 });
  }

  await prismadb.users.update({
    where: { id: params.userId },
    data: {
      password: await hash(password, 12),
      mustChangePassword: false,
    },
  });

  return NextResponse.json({ ok: true });
}
