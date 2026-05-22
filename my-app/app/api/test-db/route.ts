import { getSupabaseAdmin } from '@/app/lib/billing/supabase/server';

export async function GET() {
  try {
    const admin = await getSupabaseAdmin();

    // Get real IDs from actual tables
    const { data: project } = await admin
      .from('projects')
      .select('id, organization_id')
      .limit(1)
      .single();

    const { data: apiKey } = await admin
      .from('api_keys')
      .select('id')
      .eq('status', 'active')
      .limit(1)
      .single();

    if (!project || !apiKey) {
      return Response.json({ step: 'no_data', project, apiKey });
    }

    const { error: insertError } = await admin
      .from('token_usage')
      .insert({
        organization_id: project.organization_id,
        api_key_id: apiKey.id,
        project_id: project.id,
        input_tokens: 10,
        output_tokens: 20,
        model: 'test',
        endpoint: '/test',
      });

    if (insertError) {
      return Response.json({ 
        step: 'insert_failed', 
        error: insertError.message,
        code: insertError.code,
        project_id: project.id,
        org_id: project.organization_id
      });
    }

    return Response.json({ step: 'success', project_id: project.id });

  } catch (err: any) {
    return Response.json({ step: 'exception', error: err.message });
  }
}