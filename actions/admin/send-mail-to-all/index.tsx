'use server';

import { getServerSession } from 'next-auth';
import { render } from '@react-email/render';
import nodemailer from 'nodemailer';

import { SendMailToAll } from './schema';
import type { InputType, ReturnType } from './types';

import { prismadb } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { createSafeAction } from '@/lib/create-safe-action';
import MessageToAllUsers from '@/emails/admin/MessageToAllUser';

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return { error: 'Vous devez être connecté.' };
  }

  if (session.user.userRole !== 'DG') {
    return { error: 'Accès réservé au Dirigeant.' };
  }

  const { title, message } = data;

  if (!title || !message) {
    return { error: 'Titre et message requis.' };
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'ERP';

  if (!gmailUser || !gmailPass) {
    return { error: 'Configuration email manquante.' };
  }

  try {
    const users = await prismadb.users.findMany({
      where: { userStatus: 'ACTIVE' },
      select: { email: true, name: true },
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    });

    for (const user of users) {
      if (!user.email) continue;
      const html = await render(
        MessageToAllUsers({ title, message, username: user.name ?? '' })
      );
      await transporter.sendMail({
        from: `${appName} <${gmailUser}>`,
        to: user.email,
        subject: title,
        html,
      });
    }
  } catch (error) {
    console.log(error);
    return { error: 'Échec de l\'envoi des emails.' };
  }

  return { data: { title, message } };
};

export const sendMailToAll = createSafeAction(SendMailToAll, handler);
