import { getSupabaseAdmin } from "../supabase/server";

type UsageEvent={
    api_key_id: string;
    project_id: string;
    organization_id: string;
    environment: string;
    status_code: number;
    response_time_ms?: string;
    endpoint?: string;
}

export async function trackUsageAsync(params: UsageEvent) {
  try {
    const admin = await getSupabaseAdmin();
    await admin.from('usage_events').insert({...params});
  } catch(err) {
    console.error('Failed to track usage:', err);
  }
}