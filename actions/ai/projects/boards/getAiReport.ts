'use server';

import axios from 'axios';
import type { Session } from 'next-auth';

import { prismadb } from '@/lib/prisma';
import resendHelper from '@/lib/resend';
import AiTasksReportEmail from '@/emails/AiTasksReport';

export async function getAiReport(session: Session, boardId: string) {
  const resend = await resendHelper();

  const user = await prismadb.users.findUnique({ where: { id: session.user.id } });
  if (!user) return { message: 'Utilisateur introuvable' };

  const board = await prismadb.boards.findUnique({
    where: { id: boardId },
    include: {
      sections: {
        include: {
          tasks: {
            include: { assigned_user: { select: { name: true } } },
            orderBy: { dueDateAt: 'asc' },
          },
        },
      },
    },
  });

  if (!board) return { message: 'Projet introuvable' };

  const totalTasks   = board.sections.flatMap((s) => s.tasks).length;
  const doneTasks    = board.sections.flatMap((s) => s.tasks).filter((t) => t.taskStatus === 'COMPLETE').length;
  const overdueTasks = board.sections.flatMap((s) => s.tasks).filter(
    (t) => t.taskStatus !== 'COMPLETE' && t.dueDateAt && t.dueDateAt < new Date()
  ).length;

  const boardJson = JSON.stringify(
    board.sections.map((s) => ({
      section: s.title,
      tasks: s.tasks.map((t) => ({
        title:       t.title,
        status:      t.taskStatus,
        priority:    t.priority,
        dueDate:     t.dueDateAt,
        assignedTo:  t.assigned_user?.name ?? 'Non assigné',
      })),
    })),
    null,
    2
  );

  const lang = user.userLanguage ?? 'fr';

  let prompt = '';

  switch (lang) {
    case 'fr':
    default:
      prompt = `Tu es un assistant de gestion de projet pour ${process.env.NEXT_PUBLIC_APP_NAME}.
\n\nProjet : "${board.title}"${board.description ? `\nDescription : ${board.description}` : ''}
\n\nRésumé : ${totalTasks} tâche(s) au total, ${doneTasks} terminée(s), ${overdueTasks} en retard.
\n\nDétail des sections et tâches :\n${boardJson}
\n\nRédige un rapport de projet professionnel en français : état d'avancement, tâches critiques, points de blocage éventuels et recommandations. Inclus un lien vers le projet : ${process.env.NEXT_PUBLIC_APP_URL}/projects/boards/${boardId}
\n\nFormat : MDX.`;
      break;
    case 'en':
      prompt = `You are a project management assistant for ${process.env.NEXT_PUBLIC_APP_NAME}.
\n\nProject: "${board.title}"
\n\nSummary: ${totalTasks} task(s) total, ${doneTasks} completed, ${overdueTasks} overdue.
\n\nSections and tasks detail:\n${boardJson}
\n\nWrite a professional project report in English: progress status, critical tasks, blockers, and recommendations. Include project link: ${process.env.NEXT_PUBLIC_APP_URL}/projects/boards/${boardId}
\n\nFormat: MDX.`;
      break;
    case 'de':
      prompt = `Du bist ein Projektmanagement-Assistent für ${process.env.NEXT_PUBLIC_APP_NAME}.
\n\nProjekt: "${board.title}"
\n\nZusammenfassung: ${totalTasks} Aufgabe(n) gesamt, ${doneTasks} abgeschlossen, ${overdueTasks} überfällig.
\n\nAbschnitte und Aufgaben:\n${boardJson}
\n\nSchreibe einen professionellen Projektbericht auf Deutsch. Link: ${process.env.NEXT_PUBLIC_APP_URL}/projects/boards/${boardId}
\n\nFormat: MDX.`;
      break;
  }

  const getAiResponse = await axios
    .post(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/openai/create-chat-completion`,
      { prompt, userId: session.user.id },
      { headers: { 'Content-Type': 'application/json' } }
    )
    .then((res) => res.data);

  if (getAiResponse.error) {
    throw new Error('Erreur OpenAI');
  }

  await resend.emails.send({
    from:    process.env.EMAIL_FROM!,
    to:      user.email!,
    subject: `Rapport IA — ${board.title} — ${process.env.NEXT_PUBLIC_APP_NAME}`,
    text:    getAiResponse.response.message.content,
    react:   AiTasksReportEmail({
      //@ts-ignore-next-line
      username:     session.user.name,
      avatar:       session.user.avatar,
      userLanguage: session.user.userLanguage,
      data:         getAiResponse.response.message.content,
    }),
  });

  return { board: board.title };
}
