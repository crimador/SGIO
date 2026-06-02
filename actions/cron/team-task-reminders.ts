'use server';

import { prismadb } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export const sendTeamTaskReminders = async () => {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const appName   = process.env.NEXT_PUBLIC_APP_NAME ?? 'SaasHQ';
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  if (!gmailUser || !gmailPass) return;

  const now      = new Date();
  const in48h    = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  // Tâches en retard OU dont l'échéance est dans moins de 48h
  const tasks = await prismadb.teamTask.findMany({
    where: {
      done: false,
      deadline: { lte: in48h },
    },
    include: {
      team: {
        include: {
          members: { select: { email: true, firstName: true } },
          responsible: { select: { email: true, firstName: true } },
        },
      },
      assignedTo: { select: { email: true, firstName: true } },
    },
  });

  if (tasks.length === 0) return;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass },
  });

  for (const task of tasks) {
    const isOverdue = task.deadline < now;
    const subject   = isOverdue
      ? `⚠️ Tâche en retard — ${task.team.name}`
      : `🔔 Rappel échéance — ${task.team.name}`;

    const deadlineStr = task.deadline.toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:${isOverdue ? '#dc2626' : '#1a1a1a'}">
          ${isOverdue ? '⚠️ Tâche en retard' : '🔔 Rappel'} — <strong>${task.team.name}</strong>
        </h2>
        <div style="background:#f5f5f5;border-left:4px solid ${isOverdue ? '#dc2626' : '#1a1a1a'};padding:12px 16px;margin:16px 0;border-radius:4px">
          <p style="margin:0;font-weight:bold">${task.task}</p>
          ${task.description ? `<p style="margin:8px 0 0;color:#555">${task.description}</p>` : ''}
          <p style="margin:8px 0 0;color:#888;font-size:13px">Échéance : ${deadlineStr}</p>
        </div>
        <p style="margin-top:24px">
          <a href="${appUrl}/fr/projects/teams/${task.teamID}"
             style="background:#1a1a1a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">
            Voir l'équipe
          </a>
        </p>
        <p style="color:#888;font-size:12px;margin-top:32px">${appName}</p>
      </div>
    `;

    // Destinataires : membre assigné OU tous les membres + responsable
    const recipients = new Set<string>();
    if (task.assignedTo?.email) {
      recipients.add(task.assignedTo.email);
    } else {
      task.team.members.forEach((m) => { if (m.email) recipients.add(m.email); });
    }
    if (task.team.responsible?.email) recipients.add(task.team.responsible.email);

    await Promise.all(
      [...recipients].map((to) =>
        transporter.sendMail({ from: `${appName} <${gmailUser}>`, to, subject, html }).catch(console.error)
      )
    );
  }
};
