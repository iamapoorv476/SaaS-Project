import { redis } from "../redis";
import { getSupabaseAdmin } from "../billing/supabase/server";

const DEFAULT_FREE_LIMIT = 100_000;

async function getOrgTokenLimit(organizationId: string): Promise<number> {
    try{
        const admin = await getSupabaseAdmin();

        const {data} = await admin
              .from('subscriptions')
              .select('plan_id, status, subscription_plans(monthly_token_limit)')
              .eq('organization_id',organizationId)
              .eq('status', 'active')
              .single();

        if (!data) return DEFAULT_FREE_LIMIT;

        const plan = data.subscription_plans as { monthly_token_limit: number } | null;
        return plan?.monthly_token_limit ?? DEFAULT_FREE_LIMIT;
    } catch{
        return DEFAULT_FREE_LIMIT;
    }
}

export async function checkTokenQuota(
    projectId: string,
    organizationId:string
): Promise<{allowed:boolean; used: number; limit: number}>{
    const monthKey= new Date().toISOString().slice(0,7);
    const quotaKey= `tokenquota:${projectId}:${monthKey}`;

    const limit = await getOrgTokenLimit(organizationId);

    try{
         const used = await redis.get(quotaKey);
    const usedTokens = used ? parseInt(used as string) : 0;
    return {
      allowed: usedTokens < limit,
      used: usedTokens,
      limit,
    };
    } catch {
        try{
            const admin = await getSupabaseAdmin();
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            const { data } = await admin
        .from('token_usage')
        .select('total_tokens')
        .eq('project_id', projectId)
        .gte('created_at', startOfMonth.toISOString());
 
      const usedTokens = data?.reduce((sum, row) => sum + (row.total_tokens ?? 0), 0) ?? 0;
      return { allowed: usedTokens < limit, used: usedTokens, limit };
 
        }
        catch {
      return { allowed: true, used: 0, limit };
    }
    }
}
export async function trackTokenUsage(params: {
  projectId: string;
  organizationId: string;
  apiKeyId: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
  endpoint: string;
}): Promise<void> {
  const monthKey = new Date().toISOString().slice(0, 7);
  const quotaKey = `tokenquota:${params.projectId}:${monthKey}`;
  const totalTokens = params.inputTokens + params.outputTokens;

  // Redis update
  try {
    await redis.incrby(quotaKey, totalTokens);
    await redis.expire(quotaKey, 60 * 60 * 24 * 35);
  } catch {
    console.warn('Redis token increment failed');
  }

  // Supabase insert (fire-and-forget but SAFE)
  try {
    const admin = await getSupabaseAdmin();

    await admin.from('token_usage').insert({
      organization_id: params.organizationId,
      api_key_id: params.apiKeyId,
      project_id: params.projectId,
      input_tokens: params.inputTokens,
      output_tokens: params.outputTokens,
      total_tokens: totalTokens,
      model: params.model,
      endpoint: params.endpoint,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to persist token usage:', err);
  }
}