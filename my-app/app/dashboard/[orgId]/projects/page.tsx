import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseClient, getSupabaseAdmin } from "@/app/lib/billing/supabase/server";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;

  const supabase = await getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const admin = await getSupabaseAdmin();

  const { data: membership } = await admin
    .from("members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .single();

  if (!membership) redirect("/dashboard");

  const { data: projects } = await admin
    .from("projects")
    .select("*")
    .eq("organization_id", orgId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 text-sm mt-1">
            {projects?.length ?? 0} of 3 projects (free plan)
          </p>
        </div>
        <Link
          href={`/dashboard/${orgId}/projects/new`}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition shadow-lg shadow-blue-600/20"
        >
          New Project
        </Link>
      </div>

      {!projects?.length ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-slate-400">No projects yet.</p>
          <Link
            href={`/dashboard/${orgId}/projects/new`}
            className="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition"
          >
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/${orgId}/projects/${project.id}`}
              className="block rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-blue-500/40 hover:bg-white/10 transition group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-semibold group-hover:text-blue-400 transition">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
                <span className="text-xs text-slate-500 shrink-0 ml-4">
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-3 font-mono">
                /{project.slug}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
