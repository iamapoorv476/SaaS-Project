import { redirect } from "next/navigation";
import { getSupabaseClient, getSupabaseAdmin } from "@/app/lib/billing/supabase/server";
import { Playground } from "@/app/dashboard/Playground";

export default async function PlaygroundPage({
    params,
}: {
    params: Promise<{orgId: string; projectId: string}>;
}) {
    const { orgId, projectId } = await params;
    const supabase = await getSupabaseClient();
    const {
        data: { user},
    } = await supabase.auth.getUser();

    if (!user) redirect('/signin?redirect=/dashboard');

    const admin = await getSupabaseAdmin();

    const {data: membership} = await admin
          .from('members')
          .select('role')
          .eq('organization_id', orgId)
          .eq('user_id', user.id)
          .single();

    if (!membership) redirect('/dashboard');

    const {data: apiKey} = await admin
       .from('api_keys')
       .select('id,prefix,scopes')
       .eq('project_id', projectId)
       .eq('status', 'active')
       .overlaps('scopes', ['ai:chat'])
       .order('created_at', {ascending: false})
       .limit(1)
       .single();

    const {data: project} = await admin
       .from('projects')
       .select('id,name,organization_id')
       .eq('id', projectId)
       .eq('organization_id', orgId)
       .single();

    if (!project) redirect('/dashboard');

    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <div className="max-w-7xl mx-auto">

                <div className="mb-6">
                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                        <span>Dashboard</span>
                        <span>/</span>
                        <span>{project.name}</span>
                        <span>/</span>
                        <span className="text-white">Playground</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">AI Playground</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Upload documents and chat with your RAG-powered AI in real time.
                    </p>
                </div>

                {!apiKey ? (
                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-center">
                       <p className="text-amber-400 font-medium mb-2">No AI-enabled API key found</p>
                       <p className="text-slate-400 text-sm mb-4">
                          Create an API key with the <code className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">ai:chat</code> and{' '}
                          <code className="bg-slate-800 px-1.5 py-0.5 rounded text-ws">ai:embed</code>scopes to use the playground.

                        </p> 
                        <a
                          href={`/dashboard/${orgId}/projects/${projectId}/keys/new`}
                          className="inline-block bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
                        >
                            Create API Key
                        </a>
                        </div>
                ) : (
                    <Playground
                       
                       projectId={projectId}
                       organizationId={orgId}
                    />
                )}
            </div>
        </div>
    )
}