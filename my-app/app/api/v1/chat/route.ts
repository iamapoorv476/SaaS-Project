import { withApiKeyAuth } from "@/app/middleware/auth";
import { redis } from "@/app/lib/redis";
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
});

const MONTHLY_TOKEN_LIMIT= 100_000;

async function checkTokenQuota(projectId: string): Promise<{
    allowed:boolean;
    used:number;
    limit:number;
}> {
    const monthKey= new Date().toISOString().slice(0,7);
    const quotaKey= `tokenquota:${projectId}:${monthKey}`;
    try{
        const used = await redis.get(quotaKey);
        const usedTokens = used ? parseInt(used as string) : 0;
        return {allowed: usedTokens < MONTHLY_TOKEN_LIMIT, used: usedTokens, limit: MONTHLY_TOKEN_LIMIT};
    } catch{
        return {allowed: true, used: 0, limit: MONTHLY_TOKEN_LIMIT};
    }
}

async function incrementTokenUsage(projectId:string, tokens:number): Promise<void>{
    const monthKey = new Date().toISOString().slice(0,7);
    const quotaKey=`tokenquota:${projectId}:${monthKey}`;
    try{
        await redis.incrby(quotaKey,tokens);
        await redis.expire(quotaKey, 60 * 60 * 24 * 35);
    } catch{
        console.warn('Failed to increment token usage');
    }
}

export async function POST(req: Request){
    const auth = await withApiKeyAuth(req, 'ai:chat');
    if(auth instanceof Response) return auth;
    const {keyData, track} =auth;

    let messages: {role: 'user' | 'assistant'; content: string}[];
    let systemPrompt: string | undefined;

    try{
        const body= await req.json();
        messages= body.messages;
        systemPrompt= body.system;
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
          track(400, '/api/v1/chat');
          return Response.json({ error: 'messages array is required' }, { status: 400 });
        }
    } catch {
        track(400, '/api/v1/chat');
        return Response.json({error: 'Invalid JSON body'}, {status: 400});
    }

    const quota = await checkTokenQuota(keyData.project_id);
    if (!quota.allowed) {
      track(429, '/api/v1/chat');
      return Response.json(
        { error: 'Monthly token quota exceeded.', quota: { used: quota.used, limit: quota.limit } },
        { status: 429 }
    );
  }
  try{
    const stream =await anthropic.messages.stream({
        model:'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt ?? 'You are a helpful assistant. Be concise and accurate.',
        messages,
    });

    const readable= new ReadableStream({
        async start(controller){
            const encoder = new TextEncoder();
            for await (const chunk of stream){
                if(chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta'){
                    controller.enqueue(encoder.encode(` data: ${JSON.stringify({text: chunk.delta.text})}\n\n`));

                }
            }
            const finalMessage = await stream.finalMessage();
            const totalTokens = finalMessage.usage.input_tokens + finalMessage.usage.output_tokens;
            await incrementTokenUsage(keyData.project_id, totalTokens);
            controller.enqueue(encoder.encode(` data: ${JSON.stringify({usage:finalMessage.usage})}\n\n`));
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
            track(200, '/api/v1/chat');
       
        },
        cancel() {stream.abort();},
    });

    return new Response(readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        }

    })
  } catch(err){
    console.error('Claude API error:', err);
    track(500, '/api/v1/chat');
    return Response.json({ error: 'LLM request failed.' }, { status: 500 });
  }

}