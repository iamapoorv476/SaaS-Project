import { getSupabaseClient,getSupabaseAdmin } from "@/app/lib/billing/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    {params}: {params : Promise<{projectId: string; keyId: string}>}
) {
    try{
        const{ projectId, keyId} = await params;

        const supabase = await getSupabaseClient();
        const {data: {user}} = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const admin = await getSupabaseAdmin();
        const{data: project} = await admin
              .from('projects')
              .select('organization_id')
              .eq('id', projectId)
              .single();
        
        if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const {data: membership} = await supabase
              .from('members')
              .select('role')
              .eq('organization_id', project.organization_id)
              .eq('user_id', user.id)
              .single();

        if (!membership || !['owner', 'admin'].includes(membership.role)) {
         return NextResponse.json({ error: 'Only admins can revoke keys' }, { status: 403 });
      }

      const {error} = await admin
            .from('api_keys')
            .update({status: 'revoked', updated_at: new Date().toISOString()})
            .eq('id', keyId)
            .eq('project_id', projectId);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      await admin.from('audit_logs').insert({
        organization_id: project.organization_id,
        actor_id: user.id,
        action:'api_key.revoked',
        entity_type: 'api_key',
        entity_id: keyId,
      });

       return NextResponse.json({ success: true });

    }
    catch (err) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}