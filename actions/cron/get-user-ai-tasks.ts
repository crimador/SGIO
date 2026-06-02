'use server';

import dayjs from 'dayjs';
import axios from 'axios';
import nodemailer from 'nodemailer';

import { prismadb } from '@/lib/prisma';
import { Session } from 'next-auth';

export async function getUserAiTasks(session: Session) {
  const today = dayjs().startOf('day');
  const nextWeek = dayjs().add(7, 'day').startOf('day');

  let prompt = '';

  const user = await prismadb.users.findUnique({
    where: { id: session.user.id },
  });

  if (!user) return { message: 'No user found' };

  const getTaskPastDue = await prismadb.tasks.findMany({
    where: {
      user: session.user.id,
      taskStatus: 'ACTIVE',
      dueDateAt: { lte: new Date() },
    },
  });

  const getTaskPastDueInSevenDays = await prismadb.tasks.findMany({
    where: {
      user: session.user.id,
      taskStatus: 'ACTIVE',
      dueDateAt: {
        gt: today.toDate(),
        lt: nextWeek.toDate(),
      },
    },
  });

  if (!getTaskPastDue || !getTaskPastDueInSevenDays) {
    return { message: 'No tasks found' };
  }

  const tasksAujourdhui = JSON.stringify(getTaskPastDue, null, 2);
  const tasksSemaine = JSON.stringify(getTaskPastDueInSevenDays, null, 2);

  switch (user.userLanguage) {
    case 'fr':
    default:
      prompt = `Tu es un assistant personnel de gestion de projet pour ${process.env.NEXT_PUBLIC_APP_NAME}.
\n\nL'utilisateur a ${getTaskPastDue.length} tâche(s) en retard et ${getTaskPastDueInSevenDays.length} tâche(s) à échéance dans les 7 prochains jours.
\n\nTâches en retard :\n${tasksAujourdhui}
\n\nTâches à venir (7 jours) :\n${tasksSemaine}
\n\nRédige un récapitulatif professionnel en français, en mentionnant les tâches prioritaires, leurs échéances et un conseil de gestion du temps. Termine par une note d'encouragement. Lien vers le tableau de bord : ${process.env.NEXT_PUBLIC_APP_URL}/projects/dashboard
\n\nFormat de réponse : texte simple, sans balises Markdown.`;
      break;
    case 'en':
      prompt = `You are a personal project management assistant for ${process.env.NEXT_PUBLIC_APP_NAME}.
\n\nThe user has ${getTaskPastDue.length} overdue task(s) and ${getTaskPastDueInSevenDays.length} task(s) due in the next 7 days.
\n\nOverdue tasks:\n${tasksAujourdhui}
\n\nUpcoming tasks (7 days):\n${tasksSemaine}
\n\nWrite a professional summary in English, highlighting priority tasks, their deadlines, and a time management tip. End with an encouraging note. Dashboard link: ${process.env.NEXT_PUBLIC_APP_URL}/projects/dashboard
\n\nResponse format: plain text.`;
      break;
    case 'de':
      prompt = `Du bist ein persönlicher Projektmanagement-Assistent für ${process.env.NEXT_PUBLIC_APP_NAME}.
\n\nDer Benutzer hat ${getTaskPastDue.length} überfällige Aufgabe(n) und ${getTaskPastDueInSevenDays.length} Aufgabe(n) in den nächsten 7 Tagen.
\n\nÜberfällige Aufgaben:\n${tasksAujourdhui}
\n\nKommende Aufgaben (7 Tage):\n${tasksSemaine}
\n\nSchreibe eine professionelle Zusammenfassung auf Deutsch. Dashboard-Link: ${process.env.NEXT_PUBLIC_APP_URL}/projects/dashboard
\n\nAntwortformat: einfacher Text.`;
      break;
  }

  if (!prompt) return { message: 'No prompt found' };

  const getAiResponse = await axios
    .post(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/openai/create-chat-completion`,
      { prompt, userId: session.user.id },
      { headers: { 'Content-Type': 'application/json' } }
    )
    .then((res) => res.data);

  if (getAiResponse.error) {
    console.log('[AI REPORT] Erreur OpenAI/Groq');
    return { message: 'AI error' };
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    console.log('[AI REPORT] Gmail non configuré');
    return { message: 'Email not configured' };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    });

    await transporter.sendMail({
      from: `${process.env.NEXT_PUBLIC_APP_NAME} <${gmailUser}>`,
      replyTo: gmailUser,
      to: user.email!,
      subject: `Rapport IA — Tableau de bord projets`,
      text: getAiResponse.response.message.content,
    });

    console.log('[AI REPORT] Email envoyé via Gmail à:', user.email);
  } catch (error) {
    console.log('[AI REPORT] Erreur envoi Gmail:', error);
  }

  return { user: user.email };
}
