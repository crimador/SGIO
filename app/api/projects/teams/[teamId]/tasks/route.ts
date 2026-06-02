import { NextResponse } from 'next/server';
import { prismadb } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import nodemailer from 'nodemailer';

export async function POST(req: Request, { params }: { params: { teamId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json('Non autorisé', { status: 401 });

  const { task, description, deadline, assignedToId } = await req.json();
  if (!task || !deadline) {
    return NextResponse.json('Titre et deadline requis', { status: 400 });
  }

  const team = await prismadb.teams.findUnique({
    where: { id: params.teamId },
    include: { members: { select: { id: true, email: true, firstName: true } } },
  });

  const teamTask = await prismadb.teamTask.create({
    data: {
      teamID: params.teamId,
      task,
      description: description || null,
      deadline: new Date(deadline),
      ...(assignedToId ? { assignedToId } : {}),
    },
    include: {
      assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'KEKELI GROUP';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  if (team && gmailUser && gmailPass) {
    const deadlineFormatted = new Date(deadline).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmailUser, pass: gmailPass },
      });

      if (assignedToId) {
        // Mail dédié au membre assigné
        const assignee = team.members.find((m) => m.id === assignedToId);
        if (assignee) {
          await transporter.sendMail({
            from: `${appName} <${gmailUser}>`,
            to: assignee.email,
            subject: `Une tâche vous a été assignée — ${team.name}`,
            html: `
              <div style="font-family:sans-serif;max-width:560px;margin:auto">
                <h2 style="color:#1a1a1a">Tâche assignée — <strong>${team.name}</strong></h2>
                <p>Bonjour ${assignee.firstName},</p>
                <p>Le responsable de l'équipe vous a assigné une nouvelle tâche :</p>
                <div style="background:#f5f5f5;border-left:4px solid #1a1a1a;padding:12px 16px;margin:16px 0;border-radius:4px">
                  <p style="margin:0;font-weight:bold;font-size:16px">${task}</p>
                  ${description ? `<p style="margin:8px 0 0;color:#555">${description}</p>` : ''}
                  <p style="margin:8px 0 0;color:#888;font-size:13px">Échéance : ${deadlineFormatted}</p>
                </div>
                <p style="margin-top:24px">
                  <a href="${appUrl}/fr/projects/teams/${params.teamId}"
                     style="background:#1a1a1a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">
                    Voir l'équipe
                  </a>
                </p>
                <p style="color:#888;font-size:12px;margin-top:32px">${appName}</p>
              </div>
            `,
          });
        }

        // Mail d'info aux autres membres
        const others = team.members.filter((m) => m.id !== assignedToId);
        const assigneeName = teamTask.assignedTo
          ? `${teamTask.assignedTo.firstName} ${teamTask.assignedTo.lastName}`
          : 'un membre';
        await Promise.all(
          others.map((member) =>
            transporter.sendMail({
              from: `${appName} <${gmailUser}>`,
              to: member.email,
              subject: `Nouvelle tâche dans l'équipe "${team.name}"`,
              html: `
                <div style="font-family:sans-serif;max-width:560px;margin:auto">
                  <h2 style="color:#1a1a1a">Nouvelle tâche — <strong>${team.name}</strong></h2>
                  <p>Bonjour ${member.firstName},</p>
                  <p>Une nouvelle tâche a été créée et assignée à <strong>${assigneeName}</strong> :</p>
                  <div style="background:#f5f5f5;border-left:4px solid #1a1a1a;padding:12px 16px;margin:16px 0;border-radius:4px">
                    <p style="margin:0;font-weight:bold;font-size:16px">${task}</p>
                    ${description ? `<p style="margin:8px 0 0;color:#555">${description}</p>` : ''}
                    <p style="margin:8px 0 0;color:#888;font-size:13px">Échéance : ${deadlineFormatted}</p>
                  </div>
                  <p style="margin-top:24px">
                    <a href="${appUrl}/fr/projects/teams/${params.teamId}"
                       style="background:#1a1a1a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">
                      Voir l'équipe
                    </a>
                  </p>
                  <p style="color:#888;font-size:12px;margin-top:32px">${appName}</p>
                </div>
              `,
            })
          )
        );
      } else {
        // Pas d'assigné — notification collective
        await Promise.all(
          team.members.map((member) =>
            transporter.sendMail({
              from: `${appName} <${gmailUser}>`,
              to: member.email,
              subject: `Nouvelle tâche dans l'équipe "${team.name}"`,
              html: `
                <div style="font-family:sans-serif;max-width:560px;margin:auto">
                  <h2 style="color:#1a1a1a">Nouvelle tâche — <strong>${team.name}</strong></h2>
                  <p>Bonjour ${member.firstName},</p>
                  <p>Une nouvelle tâche vient d'être ajoutée à votre équipe :</p>
                  <div style="background:#f5f5f5;border-left:4px solid #1a1a1a;padding:12px 16px;margin:16px 0;border-radius:4px">
                    <p style="margin:0;font-weight:bold;font-size:16px">${task}</p>
                    ${description ? `<p style="margin:8px 0 0;color:#555">${description}</p>` : ''}
                    <p style="margin:8px 0 0;color:#888;font-size:13px">Échéance : ${deadlineFormatted}</p>
                  </div>
                  <p style="margin-top:24px">
                    <a href="${appUrl}/fr/projects/teams/${params.teamId}"
                       style="background:#1a1a1a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">
                      Voir l'équipe
                    </a>
                  </p>
                  <p style="color:#888;font-size:12px;margin-top:32px">${appName}</p>
                </div>
              `,
            })
          )
        );
      }
    } catch (err) {
      console.error('Erreur envoi mails tâche équipe:', err);
    }
  }

  return NextResponse.json(teamTask);
}
