import { withApiKeyAuth } from '@/app/middleware/auth';
import { checkTokenQuota, trackTokenUsage } from '@/app/lib/ai/quota';
import { embedText } from '@/app/lib/ai/embeddings';
import { getSupabaseAdmin } from '@/app/lib/billing/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const MODEL = 'claude-haiku-4-5-20251001';

async function retrieveContext(
  query: string,
  projectId: string
): Promise<{ context: string; sources: { id: string; content: string; similarity: number }[] }> {
  try {
    const queryEmbedding = await embedText(query);

    const admin = await getSupabaseAdmin();
    const { data: chunks, error } = await admin.rpc('match_document_chunks', {
      query_embedding: queryEmbedding,
      match_project_id: projectId,
      match_count: 5,
    });

    if (error || !chunks || chunks.length === 0) {
      return { context: '', sources: [] };
    }

    const context = chunks
      .map((c: { content: string }, i: number) => `[Source ${i + 1}]\n${c.content}`)
      .join('\n\n---\n\n');

    const sources = chunks.map((c: { id: string; content: string; similarity: number }) => ({
      id: c.id,
      content: c.content.slice(0, 150) + '...',
      similarity: Math.round(c.similarity * 100) / 100,
    }));

    return { context, sources };
  } catch (err) {
    console.error('RAG retrieval failed:', err);
    return { context: '', sources: [] };
  }
}

export async function POST(req: Request) {
  const auth = await withApiKeyAuth(req, 'ai:chat');
  if (auth instanceof Response) return auth;
  const { keyData, track } = auth;

  let messages: { role: 'user' | 'assistant'; content: string }[];
  let systemPrompt: string | undefined;
  let useRag = true; 

  try {
    const body = await req.json();
    messages = body.messages;
    systemPrompt = body.system;
    if (body.rag === false) useRag = false;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      track(400, '/api/v1/chat');
      return Response.json({ error: 'messages array is required' }, { status: 400 });
    }
  } catch {
    track(400, '/api/v1/chat');
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const quota = await checkTokenQuota(keyData.project_id, keyData.organization_id);
  if (!quota.allowed) {
    track(429, '/api/v1/chat');
    return Response.json(
      {
        error: 'Monthly token quota exceeded. Upgrade your plan.',
        quota: { used: quota.used, limit: quota.limit },
      },
      { status: 429 }
    );
  }

  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
  let ragContext = '';
  let sources: { id: string; content: string; similarity: number }[] = [];

  if (useRag && lastUserMessage) {
    const retrieved = await retrieveContext(lastUserMessage.content, keyData.project_id);
    ragContext = retrieved.context;
    sources = retrieved.sources;
  }

  const finalSystemPrompt = ragContext
    ? `${systemPrompt ?? 'You are a helpful assistant.'}

You have access to the following relevant context from the user's documents. Use it to answer accurately. If the answer is not in the context, say so clearly.

<context>
${ragContext}
</context>`
    : (systemPrompt ?? 'You are a helpful assistant. Be concise and accurate.');

  try {
    const stream = await anthropic.messages.stream({
      model: MODEL,
      max_tokens: 1024,
      system: finalSystemPrompt,
      messages,
    });

   const readable = new ReadableStream({
  async start(controller) {
  const encoder = new TextEncoder();
  let inputTokens = 0;
  let outputTokens = 0;

  try {
    for await (const chunk of stream) {
      if (
        chunk.type === "content_block_delta" &&
        chunk.delta?.type === "text_delta"
      ) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`
          )
        );
      }

      if (chunk.type === "message_delta" && chunk.usage) {
        inputTokens = chunk.usage.input_tokens ?? 0;
        outputTokens = chunk.usage.output_tokens ?? 0;
      }
    } // <-- for loop ends here

    await trackTokenUsage({
      projectId: keyData.project_id,
      organizationId: keyData.organization_id,
      apiKeyId: keyData.id,
      inputTokens,
      outputTokens,
      model: MODEL,
      endpoint: "/api/v1/chat",
    });

    controller.enqueue(
      encoder.encode(
        `data: ${JSON.stringify({
          usage: {
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            total_tokens: inputTokens + outputTokens,
          },
          rag: {
            context_used: ragContext.length > 0,
            sources_count: sources.length,
            sources,
          },
        })}\n\n`
      )
    );

    controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
    controller.close();

  } catch (err) {
    console.error("Streaming error:", err);
    controller.error(err);
  }
},

  cancel() {
    stream.abort();
  },
});
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Token-Used': String(quota.used),
        'X-Token-Limit': String(quota.limit),
      },
    });
  } catch (err) {
    console.error('Claude API error:', err);
    track(500, '/api/v1/chat');
    return Response.json({ error: 'LLM request failed.' }, { status: 500 });
  }
}