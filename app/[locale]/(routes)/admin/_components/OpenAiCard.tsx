import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { z } from 'zod';

import { prismadb } from '@/lib/prisma';

import { revalidatePath } from 'next/cache';
import { Input } from '@/components/ui/input';
import CopyKeyComponent from './copy-key';

const OpenAiCard = async () => {
  const setOpenAiKey = async (formData: FormData) => {
    'use server';
    const schema = z.object({
      id: z.string(),
      serviceKey: z.string(),
    });
    const parsed = schema.parse({
      id: formData.get('id'),
      serviceKey: formData.get('serviceKey'),
    });

    if (!parsed.id) {
      await prismadb.systemServices.create({
        data: {
          name: 'openAiKey',
          serviceKey: parsed.serviceKey,
        },
      });
      revalidatePath('/admin');
    } else {
      await prismadb.systemServices.update({
        where: {
          id: parsed.id,
        },
        data: {
          serviceKey: parsed.serviceKey,
        },
      });
      revalidatePath('/admin');
    }
  };

  const openAi_key = await prismadb.systemServices.findFirst({
    where: {
      name: 'openAiKey',
    },
  });

  return (
    <Card className="min-w-[350px] max-w-[450px] overflow-hidden">
      <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
      <CardHeader className="pb-3 pt-5">
        <p className="text-sm font-semibold" style={{ color: '#1E1D3D' }}>OpenAI — Clé API</p>
        <div className="mt-1 space-y-1 text-xs text-gray-400">
          <p>Clé depuis .env :</p>
          <p>
            {process.env.OPENAI_API_KEY ? (
              <CopyKeyComponent
                envValue={process.env.OPENAI_API_KEY}
                message="OpenAI - API Key"
              />
            ) : (
              'Non configurée'
            )}
          </p>
          <p>Clé depuis la base de données :</p>
          {openAi_key?.serviceKey ? (
            <CopyKeyComponent
              keyValue={openAi_key.serviceKey}
              message="OpenAI - API Key"
            />
          ) : (
            'Non configurée'
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <form action={setOpenAiKey}>
          <div>
            <input type="hidden" name="id" value={openAi_key?.id} />
            <Input type="text" name="serviceKey" placeholder="Votre clé API OpenAI" />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="reset"
              className="flex h-9 items-center rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-gray-50"
              style={{ color: '#1E1D3D' }}
            >
              Réinitialiser
            </button>
            <button
              type="submit"
              className="flex h-9 items-center rounded-lg px-3 text-sm font-semibold text-white transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
            >
              Enregistrer
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default OpenAiCard;
