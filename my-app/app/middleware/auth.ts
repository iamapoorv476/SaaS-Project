
import bcrypt from 'bcryptjs';
import { redis } from '@/app/lib/redis';
import { getSupabaseAdmin } from '@/app/lib/billing/supabase/server';

type CachedKeyData = {
  id: string;
  project_id: string;
  organization_id: string;
  scopes: string[];
  environment: string;
  status: string;
};

async function validateApiKey(rawKey: string): Promise<CachedKeyData | null> {
  
  if (!rawKey || !rawKey.startsWith('sk_')) {
    return null;
  }

  const cacheKey = `apikey:${rawKey}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as CachedKeyData;
    }
  } catch {
    console.warn('Redis cache miss/failure, falling back to DB');
  }

  const prefix = rawKey.substring(0, 14);

  const admin = await getSupabaseAdmin();

  const { data: keyRecord } = await admin
    .from('api_keys')
    .select('id, project_id, organization_id, key_hash, scopes, environment, status, expires_at')
    .eq('prefix', prefix)      
    .eq('status', 'active')
    .single();

  if (!keyRecord) return null;

  const isValid = await bcrypt.compare(rawKey, keyRecord.key_hash);
  if (!isValid) return null;
 
  if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
   
    await admin
      .from('api_keys')
      .update({ status: 'revoked' })
      .eq('id', keyRecord.id);
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

  try {
    await redis.setex(cacheKey, 300, JSON.stringify(cachePayload));
  } catch {
    console.warn('Failed to cache API key');
  }

  updateLastUsedAsync(keyRecord.id);

  return cachePayload;
}

function updateLastUsedAsync(keyId: string) {
  getSupabaseAdmin()
    .then((admin) =>
      admin
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', keyId)
    )
    .catch((err) => console.error('Failed to update last_used_at:', err));
}

export async function withApiKeyAuth(
  req: Request,
  requiredScope?: string
): Promise<{ keyData: CachedKeyData } | Response> {
  
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

  return { keyData };
}