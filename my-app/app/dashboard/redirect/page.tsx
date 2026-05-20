import { redirect } from "next/navigation";
import { getSupabaseClient, getSupabaseAdmin } from "@/app/lib/billing/supabase/server";

export default async function DashboardRedirectPage() {
  const supabase = await getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  const admin = await getSupabaseAdmin();

  // Get user's first organization
  const { data: membership } = await admin
    .from("members")
    .select("organization_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!membership) redirect("/onboarding/create-org");

  // Get first active project in that org
  const { data: project } = await admin
    .from("projects")
    .select("id")
    .eq("organization_id", membership.organization_id)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!project) {
    // Has org but no projects — go to projects list
    redirect(`/dashboard/${membership.organization_id}/projects`);
  }

  // Has org and project — go straight to project dashboard
  redirect(`/dashboard/${membership.organization_id}/projects/${project.id}`);
}