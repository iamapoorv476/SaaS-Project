import Link from "next/link";
import { redirect } from "next/navigation";
import { ApiKeysTable } from "./ApiKeysTable";
import { TokenUsageCard } from "@/app/components/dashboard/TokenUsageCard";
import { RagEvaluationCard } from "@/app/components/dashboard/RagEvaluationCard";
import { getSupabaseClient,getSupabaseAdmin } from "@/app/lib/billing/supabase/server";
import { UsageCharts } from "./UsageCharts";

export default async function ProjectDashboardPage({
    params,
}: {
    params: Promise<{orgId: string; projectId: string}>
}) {
    const {orgId, projectId} = await params;

    const supabase = await getSupabaseClient();
    const {data: {user}} = await supabase.auth.getUser();

    if (!user) redirect("/auth/login");

    const admin = await getSupabaseAdmin();

    const {data: membership} = await admin
          .from("members")
          .select("role")
          .eq("organization_id", orgId)
          .eq("user_id", user.id)
          .single();
    
    if (!membership) redirect("/dashboard");

    const {data: project} = await admin 
           .from("projects")
           .select("*")
           .eq("id", projectId)
           .eq("organization_id",orgId)
           .neq("status", "deleted")
           .single();

    if (!project) {
    return (
      <div className="max-w-3xl mx-auto mt-20 p-10 rounded-2xl border border-white/10 bg-white/5">
        <h1 className="text-2xl font-bold text-white">Project not found</h1>
        <p className="text-slate-400 mt-2">
          This project may have been deleted or you don&apos;t have access.
        </p>
        <Link
          href={`/dashboard/${orgId}/projects`}
          className="inline-block mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition"
        >
          Back to projects
        </Link>
      </div>
    );
  }
  
  const {data: apiKeys} = await admin
        .from("api_keys")
        .select("id,name,prefix,scopes,environment,last_used_at,created_at,status")
        .eq("project_id", projectId)
        .eq("status","active")
        .order("created_at", {ascending: false})
        .limit(5);

    const {data: auditLogs} = await admin
          .from("audit_logs")
          .select("id, action, actor_id, created_at")
          .eq("entity_id", projectId)
          .order("created_at", { ascending: false })
          .limit(5);

    const isAdmin = ["owner", "admin"].includes(membership.role);

    return(
        <div className="space-y-6 max-w-7xl mx-auto p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href={`/dashboard/${orgId}`} className="hover:text-slate-300 transition">
              Dashboard
            </Link>
            
            <span>/</span>
            <Link href={`/dashboard/${orgId}/projects`}  className="hover:text-slate-300 transition">
               Projects
            </Link>
            <span>/</span>
            <span className="text-slate-300">{project.name}</span>
           
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
            {project.name}
        </h1>
        {project.description &&(
             <p className="text-slate-400 text-sm mt-1">{project.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2">
            <span className="font-mono text-xs text-slate-500">
                /{project.slug}
            </span>
             <StatusBadge status={project.status} />
        </div>
        </div>

        {isAdmin &&(
            <div className="flex gap-3">
            {/* <Link
              href={`/dashboard/${orgId}/projects/${projectId}/settings`}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition border border-white/10"
            >
                Settings
            </Link> */}
            <Link
              href={`/dashboard/${orgId}/projects/${projectId}/keys/new`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition shadow-lg shadow-blue-600/20"
            >
              + New API Key
            </Link>

            </div>
        )}
        </div>
        

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="API Keys"
          value={String(apiKeys?.length ?? 0)}
          subtext="active keys"
        />
        <StatCard
          title="Environments"
          value="3"
          subtext="dev · staging · prod"
        />
        
        <UsageCharts projectId={projectId} />
      </div>
      <TokenUsageCard 
        projectId={projectId} 
        organizationId={orgId} 
      />
      <RagEvaluationCard projectId={projectId} />

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-white font-semibold">API Keys</h2>
          {isAdmin && (
            <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/${orgId}/projects/${projectId}/keys/new`}
              className="text-sm text-blue-400 hover:text-blue-300 transition"
            >
              + Add key
            </Link>
            <Link
              href={`/dashboard/${orgId}/projects/${projectId}/playground`}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition"
            >
               AI Playground
            </Link>
            </div>
          )}
        </div>

        <ApiKeysTable
           apiKeys={apiKeys ?? []}
           projectId={projectId}
           orgId={orgId}
           isAdmin={isAdmin}
        />
     </div>
         
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-white font-semibold">Recent Activity</h2>
        </div>

        {!auditLogs?.length ? (
            <div className="px-6 py-8 text-center">
                <p className="text-slate-400 text-sm">No activity yet.</p> 
            </div>
        ): (
            <div className="divide-y divide-white/5">
                {auditLogs?.map((log)=>(
                    <div key ={log.id} className="px-6 py-3 flex items-center justify-between">
                        <span className="text-sm font-mono text-slate-300">
                  {log.action}
                </span>
                 <span className="text-xs text-slate-500">
                  {new Date(log.created_at).toLocaleString()}
                </span>
                    </div>
                    ))}
            </div>
        
        )}
        </div>

        {!apiKeys?.length && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-white font-semibold">Get started</h2>
                <ul className="mt-3 space-y-2 text-slate-400 text-sm list-disc pl-5">
                   <li>Create an API key for your development environment</li>
                  <li>Use the key in your app to authenticate requests</li>
                  <li>Monitor usage and rotate keys from this dashboard</li>
                </ul>
            </div>
        )}

        </div>
    );
}

function StatCard({
  title, value, subtext,
}: {
  title: string; value: string; subtext: string;
}) {
  return (
    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
      <p className="text-slate-400 text-sm">{title}</p>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
      {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    archived: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    deleted: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${styles[status] ?? styles.active}`}>
      {status}
    </span>
  );
}







    
