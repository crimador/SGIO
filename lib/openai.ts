import OpenAI from 'openai';
import { prismadb } from './prisma';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

export async function openAiHelper(userId: string) {
  const openAiKey = await prismadb.systemServices.findFirst({
    where: { name: 'openAiKey' },
  });

  const userOpenAiKey = await prismadb.openAi_keys.findFirst({
    where: { user: userId },
  });

  let apiKey = openAiKey?.serviceKey || userOpenAiKey?.api_key;

  if (!apiKey) {
    apiKey = process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY || null;
    if (!apiKey) {
      console.log('No API key found in the environment');
      return null;
    }
  }

  const isGroq = apiKey.startsWith('gsk_') || (!openAiKey?.serviceKey && !userOpenAiKey?.api_key && !!process.env.GROQ_API_KEY);

  return new OpenAI({
    apiKey,
    ...(isGroq ? { baseURL: GROQ_BASE_URL } : {}),
  });
}
