import { prismadb } from '@/lib/prisma';
import Container from '../components/ui/Container';
import Chat from './components/Chat';

import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

const ProfilePage = async () => {
  const user = await getServerSession(authOptions);

  const openAiKeyUser = await prismadb.openAi_keys.findFirst({
    where: {
      user: user?.user?.id,
    },
  });

  const openAiKeySystem = await prismadb.systemServices.findFirst({
    where: {
      name: 'openAiKey',
    },
  });

  //console.log(openAiKeySystem, "openAiKeySystem");

  if (process.env.OPENAI_API_KEY && !openAiKeyUser && !openAiKeySystem)
    return (
      <Container
        title="Assistant IA"
        description="Posez vos questions à l'assistant"
      >
        <div>
          <h1 className="text-lg font-semibold">Clé API OpenAI introuvable</h1>
          <p className="mt-2 text-muted-foreground">
            Veuillez ajouter votre clé API OpenAI dans vos{' '}
            <Link href={'/profile'} className="text-blue-500 underline">
              paramètres de profil
            </Link>{' '}
            pour utiliser l&apos;assistant.
          </p>
        </div>
      </Container>
    );

  return (
    <Container
      title="Assistant IA"
      description="Posez vos questions à l'assistant"
    >
      <Suspense fallback={<div className="text-muted-foreground">Chargement…</div>}>
        <Chat />
      </Suspense>
    </Container>
  );
};

export default ProfilePage;
