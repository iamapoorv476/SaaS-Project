import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseClient,getSupabaseAdmin } from "@/app/lib/billing/supabase/server";

export default async function  OrgDashboardPage ({
    params,

}:{
    params:Promise <{orgId: string}>;
}) {
    const {orgId} = await params;

    const supabase = await getSupabaseClient();
    const {
        data: {user},
    } = await supabase.auth.getUser();

    if(!user){
        redirect("/auth/login");
    }
    const admin = await getSupabaseAdmin();

    const {data: membership, error: membershipError}=  await admin
           .from("members")
           .select("role, organizations(id, name, slug)")
           .eq("organization_id",orgId)
           .eq("user_id",user.id)
           .single();
    
    console.log("Membership query result:", { membership, membershipError });

    if (membershipError || !membership?.organizations) {
    return (
      <div className="max-w-3xl mx-auto mt-20 p-10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-white">Access denied</h1>
        <p className="text-slate-400 mt-2">
          You don’t have permission to access this organization.
        </p>
        {membershipError && (
          <p className="text-rose-400 text-sm mt-2">
            Error: {membershipError.message}
          </p>
        )}
        <Link
          href="/dashboard"
          className="inline-block mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  const org = membership.organizations as any;
  const role = membership.role

  return(
    <div className="space-y-6 max-w-7xl mx-auto p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <p className="text-slate-500 text-sm">Workspace</p>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    {org.name}
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                    Role: <span className="text-slate-200">{role}</span>
                </p>
            </div>

            <div className="flex gap-3">
                <Link
                   href={`/dashboard/${orgId}/members`}
                   className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition border border-white/10"
                >
                    Invite Members
                </Link>

                <Link 
                   href={`/dashboard/${orgId}/projects`}
                   className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition shadow-lg shadow-blue-600/20"
                >
                    New Project
                   </Link>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Projects" value="--" subtext="coming soon" />
        <StatCard title="Members" value="--" subtext="coming soon" />
        <StatCard title="Plan" value="--" subtext="coming soon" />
       </div>

       <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <h2 className="text-white font-semibold">Next steps</h2>
        <ul className="mt-3 space-y-2 text-slate-400 text-sm list-disc pl-5">
          <li>Create your first project</li>
          <li>Invite team members</li>
          <li>Upgrade plan if you hit limits</li>
        </ul>
      </div>
    
    </div>
  )
}

function StatCard({
    title,
    value,
    subtext,
}:{
    title: string;
    value: string;
    subtext: string;
}
){
  return (
    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
      <p className="text-slate-400 text-sm">{title}</p>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
      {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
    </div>
  );
}
