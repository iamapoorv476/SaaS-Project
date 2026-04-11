import bcrypt from 'bcryptjs';
import { redis } from '@/app/lib/redis';
import { trackUsageAsync } from '@/app/lib/billing/usage/track';
import { getSupabaseAdmin } from '@/app/lib/billing/supabase/server';

type CachedKeyData = {
  id: string;
  project_id: string;
  organization_id:string;
  scopes: string[];
  environment:string;
  status: string;
};
type AuthSuccess = {
   keyData: CachedKeyData;
   remaining: number;
   resetAt: number;
   track: (statusCode: number, endpoint?: string) => void;
}

async function validateApiKey(rawKey: string): Promise<CachedKeyData | null>{
  if(!rawKey || !rawKey.startsWith('sk')){
    return null;
  }

  const cacheKey = `apikey:${rawKey}`;
  try{
    const cached = await redis.get(cacheKey);
    if(cached){
      return (typeof cached === 'string' ? JSON.parse(cached) : cached) as CachedKeyData;
    }
  } catch {
    console.warn('Redis cache miss/failure, falling back to DB');
  }

  const prefix = rawKey.substring(0,14);

  const admin = await getSupabaseAdmin();
  const {data: keyRecord} = await admin
        .from('api_keys')
        .select('id, project_id, organization_id, key_hash, scopes, environment, status, expires_at')
        .eq('prefix', prefix)
        .eq('status', 'active')
        .single();
  
   if (!keyRecord) return null;

   const isValid = await bcrypt.compare(rawKey, keyRecord.key_hash);
   if(!isValid) return null;

   if(keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()){

    await admin
        .from('api_keys')
        .update({status: 'revoked'})
        .eq('id' ,keyRecord.id);
    return null;
   }

   const cachePayload: CachedKeyData = {
    id: keyRecord.id,
    project_id: keyRecord.project_id,
    organization_id: keyRecord.organization_id,
    scopes: keyRecord.scopes,
    environment: keyRecord.environment,
    status: keyRecord.status,
   };

   try{
    await redis.setex(cacheKey, 300 , JSON.stringify(cachePayload));
   } catch{
    console.warn('Failed to cache API key');
   }

   updateLastUsedAsync(keyRecord.id);

   return cachePayload;
}

async function updateLastUsedAsync(keyId: string){
  try {
    const admin = await getSupabaseAdmin();
    await admin
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', keyId);
  } catch(err) {
    console.error('Failed to update last_used_at:', err);
  }
}

async function checkRateLimit(keyId: string): Promise<{allowed:boolean; remaining: number; resetAt: number}>{
  const windowSeconds = 60; 
  const maxRequests = 100;        
  const rateLimitKey = `ratelimit:${keyId}:${Math.floor(Date.now() / 1000 / windowSeconds)}`;

  try{
    const current = await redis.incr(rateLimitKey);

    if(current==1){
      await redis.expire(rateLimitKey, windowSeconds);
    }

    const resetAt = (Math.floor(Date.now() / 1000 / windowSeconds) + 1) * windowSeconds;

    return{
      allowed: current <= maxRequests,
      remaining: Math.max(0, maxRequests - current),
      resetAt,
    }
  } catch{
    console.warn('Rate limit check failed, failing open');
    return { allowed: true, remaining: -1, resetAt: 0 };
  }

}

export async function withApiKeyAuth(
  req: Request,
  requiredScope?: string
): Promise< AuthSuccess | Response> {

  const startTime = Date.now();

  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return Response.json(
      { error: 'Missing Authorization header. Expected: Bearer sk_...' },
      { status: 401 }
    );
  }

  const rawKey = authHeader.slice(7);
  const keyData = await validateApiKey(rawKey);

  if (!keyData) {
    return Response.json(
      { error: 'Invalid or expired API key' },
      { status: 401 }
    );
  }

  if (requiredScope && !keyData.scopes.includes(requiredScope)) {
    return Response.json(
      { error: `This key does not have the required scope: ${requiredScope}` },
      { status: 403 }
    );
  }

  const{allowed, remaining, resetAt} = await checkRateLimit(keyData.id);

  if(!allowed){
    return new Response(
      JSON.stringify({error:'Rate limit exceeded. Try again shortly.'}),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(resetAt),
          'Retry-After': String(resetAt - Math.floor(Date.now() / 1000)),
        },
      }

    )
  }

  const track = (statusCode: number, endpoint?: string)=>{
    trackUsageAsync({
      api_key_id:keyData.id,
      project_id: keyData.project_id,
      organization_id: keyData.organization_id,
      environment: keyData.environment,
      status_code: statusCode,
      response_time_ms: Date.now() - startTime,
      endpoint: endpoint ?? new URL(req.url).pathname,
    })
  }


  return { keyData,remaining,resetAt,track };
}
