import { getSupabaseClient, getSupabaseAdmin } from "@/app/lib/billing/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
    req:Request,
    {params}: {params: Promise<{projectId: string}>}
) {
    try{
        const {projectId} = await params;
        const {searchParams} = new URL(req.url);
        const range= searchParams.get('range') ?? '30';

        const supabase = await getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const admin = await getSupabaseAdmin();

        const { data: project } = await admin
           .from('projects')
           .select('organization_id')
           .eq('id', projectId)
           .single();
       
        if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

       const { data: membership } = await admin
         .from('members')
         .select('role')
         .eq('organization_id', project.organization_id)
         .eq('user_id', user.id)
         .single();

      if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

      const since = new Date();
      since.setDate(since.getDate() - parseInt(range));

      const {data: daily} = await admin
           .from('api_usage_logs')
           .select('created_at, status_code, environment, api_key_id')
           .eq('project_id', projectId)
           .gte('created_at', since.toISOString())
           .order('created_at', { ascending: true });

      const byDay: Record<string, {data: string; total: number; errors: number}>={};
      const byEnvironment: Record<string, number> = {};
      const byKey: Record<string,number>= {};

      for(const row of daily?? []){
        const day = row.created_at.slice(0,10);

        if(!byDay[day]) byDay[day] = {data: day, total:0, errors: 0};
        byDay[day].total++;
        if(row.status_code>= 400) byDay[day].errors++;

        byEnvironment[row.environment] = (byEnvironment[row.environment] ?? 0) + 1;

        if(row.api_key_id){
            byKey[row.api_key_id] = (byKey[row.api_key_id] ?? 0) + 1;
        }
      }

      const totalRequests = daily?.length ?? 0;
      const totalErrors = daily?.filter((r) => r.status_code >= 400).length ?? 0;
      return NextResponse.json({
      summary: {
        totalRequests,
        totalErrors,
        errorRate: totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(1) : '0',
      },
      dailyChart: Object.values(byDay),       
      byEnvironment,                           
      byKey,                                  
    });
  } catch (err) {
    console.error('Usage fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

    }
}