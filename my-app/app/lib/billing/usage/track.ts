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

export function trackUsageAsync(event: UsageEvent){
    getSupabaseAdmin()
      .then((admin)=>
       admin.from('api_usage_logs').insert({
        ...event,
        created_at:new Date().toISOString(),
       })
    )
    .catch((err)=> console.error('Failed to track usage:', err));
}