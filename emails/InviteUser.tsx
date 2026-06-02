import {
  Body, Button, Container, Head, Heading, Hr,
  Html, Link, Preview, Section, Tailwind, Text,
} from '@react-email/components';
import * as React from 'react';

interface InviteUserEmailProps {
  username: string;
  invitedByUsername: string;
  invitedUserPassword: string;
  userRole?: string;
}

const ROLE_LABELS: Record<string, string> = {
  DG: 'Dirigeant', COMPTABLE: 'Comptable',
  COMMERCIAL: 'Commercial', RH: 'Responsable RH', EMPLOYEE: 'Employé',
};

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'ERP';

export const InviteUserEmail = ({
  username,
  invitedByUsername,
  invitedUserPassword,
  userRole,
}: InviteUserEmailProps) => (
  <Html>
    <Head />
    <Preview>Vos identifiants de connexion — {appName}</Preview>
    <Tailwind>
      <Body className="mx-auto my-auto bg-white font-sans">
        <Container className="mx-auto my-[40px] w-[480px] rounded-lg border border-solid border-slate-200 p-[32px]">

          <Heading className="text-center text-[22px] font-bold text-slate-800 my-[24px]">
            Bienvenue sur {appName}
          </Heading>

          <Text className="text-[15px] leading-[26px] text-slate-700">
            Bonjour <strong>{username}</strong>,
          </Text>

          <Text className="text-[15px] leading-[26px] text-slate-700">
            <strong>{invitedByUsername}</strong> vous a créé un accès à la plateforme{' '}
            <strong>{appName}</strong>.
            {userRole && ` Votre rôle : `}
            {userRole && <strong>{ROLE_LABELS[userRole] ?? userRole}</strong>}.
          </Text>

          <Section className="rounded-lg bg-slate-50 border border-slate-200 p-[20px] my-[24px]">
            <Text className="text-[13px] text-slate-500 m-0">Email de connexion</Text>
            <Text className="text-[16px] font-bold text-slate-800 mt-[4px] mb-[16px]">
              (votre email)
            </Text>
            <Text className="text-[13px] text-slate-500 m-0">Mot de passe provisoire</Text>
            <Text className="text-[20px] font-bold tracking-widest text-slate-800 mt-[4px] mb-0">
              {invitedUserPassword}
            </Text>
          </Section>

          <Text className="text-[14px] leading-[22px] text-slate-600">
            ⚠️ Pour des raisons de sécurité, vous serez invité à <strong>changer ce mot de passe</strong>{' '}
            dès votre première connexion.
          </Text>

          <Section className="text-center my-[32px]">
            <Button
              className="rounded-md bg-slate-800 px-6 py-3 text-[14px] font-semibold text-white no-underline"
              href={baseUrl}
            >
              Accéder à {appName}
            </Button>
          </Section>

          <Hr className="border-slate-200 my-[24px]" />

          <Text className="text-[12px] text-slate-400 text-center">
            Si vous n&apos;attendiez pas cet email, vous pouvez l&apos;ignorer.
            Pour toute question, contactez votre administrateur.
          </Text>
          <Text className="text-[12px] text-slate-400 text-center">
            <Link href={baseUrl} className="text-slate-400">{baseUrl}</Link>
          </Text>

        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default InviteUserEmail;
