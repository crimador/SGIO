import { NextResponse } from 'next/server';
import { prismadb } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import React from 'react';
import NewTaskFromProject from '@/emails/NewTaskFromProject';

export const dynamic = 'force-dynamic';

//Create new task in project route
/*
TODO: there is second route for creating task in board, but it is the same as this one. Consider merging them (/api/projects/tasks/create-task/[boardId]). 
*/
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const { title, user, board, priority, content, notionUrl, dueDateAt } = body;

  if (!session) {
    return new NextResponse('Unauthenticated', { status: 401 });
  }

  if (!title || !user || !board || !priority || !content) {
    return new NextResponse('Missing one of the task data ', { status: 400 });
  }

  try {
    //Get first section from board where position is smallest
    const sectionId = await prismadb.sections.findFirst({
      where: {
        board: board,
      },
      orderBy: {
        position: 'asc',
      },
    });

    if (!sectionId) {
      return new NextResponse('No section found', { status: 400 });
    }

    const tasksCount = await prismadb.tasks.count({
      where: {
        section: sectionId.id,
      },
    });

    let contentUpdated = content;

    if (notionUrl) {
      contentUpdated = content + '\n\n' + notionUrl;
    }

    const task = await prismadb.tasks.create({
      data: {
        priority: priority,
        title: title,
        content: contentUpdated,
        dueDateAt: dueDateAt,
        section: sectionId.id,
        createdBy: session.user.id,
        updatedBy: session.user.id,
        position: tasksCount > 0 ? tasksCount : 0,
        user: user,
        taskStatus: 'ACTIVE',
      },
    });

    //Make update to Board - updatedAt field to trigger re-render and reorder
    await prismadb.boards.update({
      where: {
        id: board,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    //Notification à l'utilisateur assigné (si différent du créateur)
    if (user !== session.user.id) {
      try {
        const [notifyRecipient, boardData] = await Promise.all([
          prismadb.users.findUnique({ where: { id: user } }),
          prismadb.boards.findUnique({ where: { id: board } }),
        ]);

        const gmailUser = process.env.GMAIL_USER;
        const gmailPass = process.env.GMAIL_APP_PASSWORD;

        if (gmailUser && gmailPass && notifyRecipient?.email) {
          const lang = notifyRecipient.userLanguage ?? 'fr';
          const subject =
            lang === 'en'
              ? `Nouvelle tâche — ${title}`
              : lang === 'de'
                ? `Neue Aufgabe — ${title}`
                : `Nouvelle tâche assignée — ${title}`;

          const html = await render(
            React.createElement(NewTaskFromProject, {
              taskFromUser: session.user.name!,
              username: notifyRecipient.name!,
              userLanguage: lang,
              taskData: task,
              boardData: boardData,
            })
          );

          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: gmailUser, pass: gmailPass },
          });

          await transporter.sendMail({
            from: `${process.env.NEXT_PUBLIC_APP_NAME} <${gmailUser}>`,
            replyTo: gmailUser,
            to: notifyRecipient.email,
            subject,
            html,
          });

          console.log('[NEW_TASK] Email envoyé à:', notifyRecipient.email);
        }
      } catch (error) {
        console.log('[NEW_TASK] Erreur envoi email:', error);
      }
    }
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.log('[NEW_BOARD_POST]', error);
    return new NextResponse('Initial error', { status: 500 });
  }
}
