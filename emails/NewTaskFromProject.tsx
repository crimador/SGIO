import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface VercelInviteUserEmailProps {
  taskFromUser: string;
  username: string;
  userLanguage: string;
  taskData: any;
  boardData: any;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

export const NewTaskFromProject = ({
  taskFromUser,
  username,
  userLanguage,
  taskData,
  boardData,
}: VercelInviteUserEmailProps) => {
  const previewText =
    userLanguage === 'en'
      ? `New task from ${process.env.NEXT_PUBLIC_APP_NAME}`
      : userLanguage === 'de'
        ? `Neue Aufgabe — ${process.env.NEXT_PUBLIC_APP_NAME}`
        : `Nouvelle tâche assignée — ${process.env.NEXT_PUBLIC_APP_NAME}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-[40px] w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              {userLanguage === 'en'
                ? `New task from project — ${boardData.title}`
                : userLanguage === 'de'
                  ? `Neue Aufgabe aus dem Projekt — ${boardData.title}`
                  : `Nouvelle tâche — Projet : ${boardData.title}`}
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              {userLanguage === 'en'
                ? `Hello ${username},`
                : userLanguage === 'de'
                  ? `Guten Tag ${username},`
                  : `Bonjour ${username},`}
            </Text>
            <Text className="text-[14px] leading-[24px] text-black">
              <strong>{taskFromUser}</strong>
              {userLanguage === 'en'
                ? ` has created a task and assigned it to you.`
                : userLanguage === 'de'
                  ? ` hat eine Aufgabe erstellt und Sie dieser zugewiesen.`
                  : ` vous a assigné une nouvelle tâche.`}
            </Text>
            <Text className="text-[14px] leading-[24px] text-black">
              {userLanguage === 'en'
                ? `You can view the task details here:`
                : userLanguage === 'de'
                  ? `Details finden Sie hier:`
                  : `Consultez les détails de la tâche ici :`}

              <strong>{`${process.env.NEXT_PUBLIC_APP_URL}/projects/tasks/viewtask/${taskData.id}`}</strong>
            </Text>
            <Section className="mb-[32px] mt-[32px] text-center">
              <Button
                className="rounded-md bg-slate-800 px-4 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={`${process.env.NEXT_PUBLIC_APP_URL}/projects/tasks/viewtask/${taskData.id}`}
              >
                {userLanguage === 'en'
                  ? 'View task'
                  : userLanguage === 'de'
                    ? 'Aufgabe ansehen'
                    : 'Voir la tâche'}
              </Button>
            </Section>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[12px] leading-[24px] text-[#666666]">
              {userLanguage === 'en'
                ? `This message was sent to `
                : userLanguage === 'de'
                  ? `Diese Nachricht war für `
                  : `Ce message a été envoyé à `}
              <span className="text-black">{username}</span>.{' '}
              {userLanguage === 'en'
                ? 'If you were not expecting this, you can ignore this email.'
                : userLanguage === 'de'
                  ? 'Wenn Sie diese Nachricht nicht erwartet haben, können Sie sie ignorieren.'
                  : "Si vous ne vous attendiez pas à ce message, vous pouvez ignorer cet e-mail."}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default NewTaskFromProject;
