import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { prismadb } from '@/lib/prisma';
import SetGptModel from '../forms/SetGptModel';

import OnTestButton from './OnTestButton';
import type { gpt_models } from '@prisma/client';

const GptCard = async () => {
  const gptModels: gpt_models[] = await prismadb.gpt_models.findMany();

  return (
    <Card className="min-w-[350px] max-w-[450px] overflow-hidden">
      <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
      <CardHeader className="pb-3 pt-5">
        <p className="text-sm font-semibold" style={{ color: '#1E1D3D' }}>Modèle GPT (Assistant IA)</p>
        <p className="mt-0.5 text-xs text-gray-400">
          Modèle actif :{' '}
          {gptModels
            .filter((model: gpt_models) => model.status === 'ACTIVE')
            .map((model: gpt_models) => model.model)}
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        <SetGptModel models={gptModels} />
        <OnTestButton />
      </CardContent>
    </Card>
  );
};

export default GptCard;
