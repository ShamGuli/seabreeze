import { streamText, createUIMessageStreamResponse } from 'ai';
import { google } from '@ai-sdk/google';
import { getSystemPrompt } from '@/data/seabreeze-knowledge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Convert parts-based messages (from useChat v6) to content-based format
  const normalizedMessages = messages.map((msg: any) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content ?? msg.parts
      ?.filter((p: any) => p.type === 'text')
      .map((p: any) => p.text)
      .join('') ?? '',
  }));

  const result = streamText({
    model: google('gemini-2.5-flash-lite'),
    system: getSystemPrompt(),
    messages: normalizedMessages,
    maxOutputTokens: 1024,
    temperature: 0.3,
  });

  return createUIMessageStreamResponse({
    stream: result.toUIMessageStream(),
  });
}
