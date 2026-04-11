import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import { getSupabaseClient, getSupabaseAdmin } from '@/app/lib/billing/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  {params}: {params: Promise<{projectId: string}>}
)  {
  try{
    const {projectId} = await params;
    const body = await req.json();
    const {name, environment = 'development', scopes = ['read: data'], expiresAt} = body;

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }
    const supabase = await getSupabaseClient();

    const {data: {user} ,error: authError} = await supabase.auth.getUser();
    if(authError || !user){
      return NextResponse.json({error:"Authentication is required"}, {status: 401});
    }

    const admin = await getSupabaseAdmin();

    const {data: project} = await admin
           .from("projects")
           .select('organization_id , status')
           .eq('id', projectId)
           .single();

    if(!project || project.status === 'deleted'){
      return NextResponse.json(
        {error: 'Project not found'} ,{status:404});
      
    }
    const {data: membership} = await admin
          .from("members")
          .select('role')
          .eq('organization_id', project.organization_id)
          .eq('user_id', user.id)
          .single();
      
    if(!membership){
      return NextResponse.json(
        {error:'Not an member of this organization'} ,{status:403}
      );
    }
    if(!['owner', 'admin'].includes(membership.role)){
      return NextResponse.json(
        {error:'Only admin and owner can create API key'} ,{status:403}
      )
    }

    const envMap = {
  development: 'dev',
  staging: 'stg',
  production: 'live'
};

const envPrefix = envMap[environment as keyof typeof envMap];

if (!envPrefix) {
  return NextResponse.json(
    { error: 'Invalid environment. Must be development, staging, or production' },
    { status: 400 }
  );
}
    const rawKey = `sk_${envPrefix}_${nanoid(32)}`
    const prefix = rawKey.substring(0, 14);
    const lastFour = rawKey.slice(-4);
    const hash = await bcrypt.hash(rawKey, 12);

    const {data: apiKey , error} = await admin
          .from('api_keys')
          .insert({
            project_id: projectId,
            organization_id: project.organization_id,
            created_by: user.id,
            name: name.trim(),
            key_hash:hash,
            prefix,
            last_four: lastFour,
            scopes,
            environment,
            status: 'active',
            expires_at: expiresAt ?? null
          })
          .select('id,name,prefix,last_four,scopes,environment,created_at')
          .single();

        if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await admin.from('audit_logs').insert({
      organization_id: project.organization_id,
      actor_id: user.id,
      action:'api_key.created',
      entity_type:'api_key',
      entity_id: apiKey.id,
    });

    return NextResponse.json(
      {
        apiKey: {...apiKey, rawKey},
        message:"Store this key safely. You won't be able to see it again.",
      },
      {status: 201}
    );

  }
  catch(err){
    console.error('Error creating API key:', err);
     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
  }

  export async function GET(
    req: Request,
    {params}: {params : Promise<{projectId: string}>}
  ){
    try{
      const {projectId} = await params;

      const supabase = await getSupabaseClient();
      const {data: {user}}= await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const admin = await getSupabaseAdmin();

      const {data: project} = await admin
            .from('projects')
            .select('organization_id')
            .eq('id', projectId)
            .single();
        
       if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      const { data: membership } = await supabase
      .from('members')
      .select('role')
      .eq('organization_id', project.organization_id)
      .eq('user_id', user.id)
      .single();

     if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

     const {data: keys, error} = await admin
           .from('api_keys')
           .select('id, name, prefix, last_four, scopes, environment, last_used_at, created_at, status')
           .eq('project_id', projectId)
           .eq('status', 'active')
           .order('created_at', { ascending: false });
      
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      return NextResponse.json({ keys: keys ?? [] });

    }
    catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
  }

