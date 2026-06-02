import { NextResponse } from 'next/server';
import { prismadb } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateRandomPassword } from '@/lib/utils';
import { hash } from 'bcryptjs';
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import InviteUserEmail from '@/emails/InviteUser';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  try {
    const body = await req.json();
    const { name, email, language, userRole } = body;

    if (!name || !email || !language) {
      return NextResponse.json({ error: 'Nom, email et langue requis.' }, { status: 200 });
    }

    const checkexisting = await prismadb.users.findFirst({ where: { email } });
    if (checkexisting) {
      return NextResponse.json(
        { error: 'Cet utilisateur existe déjà. Réinitialisez son mot de passe.' },
        { status: 200 }
      );
    }

    const password = generateRandomPassword();

    const user = await prismadb.users.create({
      data: {
        name,
        username: '',
        avatar: '',
        account_name: '',
        is_account_admin: false,
        is_admin: false,
        email,
        userStatus: 'ACTIVE',
        userLanguage: language,
        userRole: userRole ?? 'COMMERCIAL',
        mustChangePassword: true,
        password: await hash(password, 12),
      },
    });

    if (!user) return new NextResponse('User not created', { status: 500 });

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;
    const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'SGIO';

    if (gmailUser && gmailPass) {
      try {
        const html = await render(
          InviteUserEmail({
            invitedByUsername: session.user?.name ?? 'Admin',
            username: user.name ?? name,
            invitedUserPassword: password,
            userRole,
          })
        );

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: gmailUser, pass: gmailPass },
        });

        await transporter.sendMail({
          from: `${appName} <${gmailUser}>`,
          to: user.email,
          subject: `Votre accès à ${appName}`,
          html,
        });
      } catch (emailErr) {
        console.error('Erreur envoi email invitation:', emailErr);
      }
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.log('[INVITE_USER_POST]', error);
    return new NextResponse('Initial error', { status: 500 });
  }
}
