import { withApiKeyAuth } from "@/app/middleware/auth";
import { checkTokenQuota, trackTokenUsage } from "@/app/lib/ai/quota";
//import { redis } from "@/app/lib/redis";
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
});

const MODEL = 'claude-haiku-4-5-20251001';



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

    const quota = await checkTokenQuota(keyData.project_id, keyData.organization_id);
    if (!quota.allowed) {
      track(429, '/api/v1/chat');
      return Response.json(
        { error: 'Monthly token quota exceeded.', quota: { used: quota.used, limit: quota.limit } },
        { status: 429,
          headers:{
            'X-Token-Used': String(quota.used),
            'X-Token-Limit': String(quota.limit),
          }
         }
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
            const inputTokens = finalMessage.usage.input_tokens;
            const outputTokens = finalMessage.usage.output_tokens;
            await trackTokenUsage({
             projectId: keyData.project_id,
            organizationId: keyData.organization_id,
            apiKeyId: keyData.id,
            inputTokens,
            outputTokens,
            model: MODEL,
            endpoint: '/api/v1/chat',
        });
            // const totalTokens = finalMessage.usage.input_tokens + finalMessage.usage.output_tokens;
            
         controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              usage: {
                input_tokens: inputTokens,
                output_tokens: outputTokens,
                total_tokens: inputTokens + outputTokens,
                remaining_tokens: quota.limit - quota.used - inputTokens - outputTokens,
              },
            })}\n\n`
          )
        );
 
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
 
        track(200, '/api/v1/chat');
      },
 
      cancel() {
        stream.abort();
      },
    });

    return new Response(readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Token-Used': String(quota.used),
            'X-Token-Limit': String(quota.limit),
        }

    })
  } catch(err){
    console.error('Claude API error:', err);
    track(500, '/api/v1/chat');
    return Response.json({ error: 'LLM request failed.' }, { status: 500 });
  }

}