import { NextResponse } from 'next/server';
import { prismadb } from '@/lib/prisma';

import { openAiHelper } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export const maxDuration = 300;

export async function POST(req: Request) {
  const body = await req.json();
  const { prompt, userId } = body;

  const openai = await openAiHelper(userId);

  if (!openai) {
    return new NextResponse('No openai key found', { status: 500 });
  }

  if (!prompt) {
    return new NextResponse('No prompt', { status: 400 });
  }

  try {
    const gptModel = await prismadb.gpt_models.findMany({
      where: {
        status: 'ACTIVE',
      },
    });

    const isGroqKey =
      (process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY) ||
      gptModel[0]?.model?.startsWith('llama') ||
      gptModel[0]?.model?.startsWith('mixtral') ||
      gptModel[0]?.model?.startsWith('gemma');

    const model = isGroqKey ? 'llama-3.3-70b-versatile' : gptModel[0]?.model ?? 'gpt-3.5-turbo';

    const response = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      model,
      temperature: 0,
    });

    return NextResponse.json(
      { response: response.choices[0] },
      { status: 200 }
    );
  } catch (error) {
    console.log('[OPENAI_CHAT_POST]', error);
    return new NextResponse('Initial error', { status: 500 });
  }
}
