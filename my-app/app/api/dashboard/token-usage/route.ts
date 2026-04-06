import { getSupabaseClient,getSupabaseAdmin } from "@/app/lib/billing/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request){
    try{
        const {searchParams} = new URL(req.url);
        const projectId = searchParams.get('projectId');
        const organizationId = searchParams.get('organizationId');

        if (!projectId || !organizationId) {
      return NextResponse.json(
        { error: 'projectId and organizationId are required' },
        { status: 400 }
      );
    }
     const supabase = await getSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const admin = await getSupabaseAdmin();

    const { data: membership } = await admin
      .from('members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();
 
    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    const {data: usageRows} = await admin
        .from('token_usage')
        .select('input_tokens, output_tokens, total_tokens, model, created_at')
        .eq('project_id', projectId)
        .gte('created_at', startOfMonth.toISOString())
        .order('created_at', {ascending: true});

    const { data: subscription } = await admin
      .from('subscriptions')
      .select('plan_id, status, subscription_plans(monthly_token_limit, name)')
      .eq('organization_id', organizationId)
      .single();

    const planLimit = (subscription?.subscription_plans as any)?.monthly_token_limit ?? 100000;
    const planName = (subscription?.subscription_plans as any)?.name ?? 'Free';

    const totalInput = usageRows?.reduce((s, r) => s + (r.input_tokens ?? 0), 0) ?? 0;
    const totalOutput = usageRows?.reduce((s , r) => s + (r.output_tokens ?? 0) , 0) ?? 0;
    const totalTokens = totalInput + totalOutput;

    const dailyMap: Record<string, { input: number; output: number; total: number }> = {};
    for (const row of usageRows ?? []) {
      const day = new Date(row.created_at).toISOString().slice(0, 10);
      if (!dailyMap[day]) dailyMap[day] = { input: 0, output: 0, total: 0 };
      dailyMap[day].input += row.input_tokens ?? 0;
      dailyMap[day].output += row.output_tokens ?? 0;
      dailyMap[day].total += row.total_tokens ?? 0;
    }

    const daily = Object.entries(dailyMap).map(([date, values]) => ({
        date,
        ...values,
    }));

    const {count: totalRequests} = await admin 
        .from('token_usage')
        .select('*', {count: 'exact', head: true})
        .eq('project_id', projectId)
        .gte('created_at', startOfMonth.toISOString());

    return NextResponse.json({
        plan: planName,
        limit: planLimit,
        used: totalTokens,
        remaining: Math.max(0, planLimit - totalTokens),
        percentage:Math.min(100, Math.round((totalTokens / planLimit) * 100)),
        breakdown: {
            input_tokens: totalInput,
            output_tokens: totalOutput,
        },
        total_requests: totalRequests ?? 0,
        daily,

    })

    } catch(err){
        console.error('Token usage fetch error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}