import { getSupabaseServerClient } from "@/app/lib/billing/supabase/server";
import { getOrgPlan } from "@/app/lib/billing/getOrgPlan";

export async function GET(req: Request){
    const {searchParams} = new URL(req.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
    return Response.json(
      { error: "organizationId is required" },
      { status: 400 }
    );
  }
  const supabase = getSupabaseServerClient();
   const {
    data : {user},
   } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const {data: membership} =await supabase
         .from("members")
         .select("role")
         .eq("organization_id",organizationId)
         .eq("user_id", user.id)
         .single();
   
     if (!membership) {
    return Response.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const { plan, status } = await getOrgPlan(organizationId);
  const [{ count: projectCount }, { count: memberCount }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId),

      supabase
        .from("members")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId),
    ]);

  return Response.json({
    plan: plan.slug,
    status,
    usage: {
      projects: `${projectCount}/${plan.max_projects}`,
      members: `${memberCount}/${plan.max_members}`,
    },
    limits: {
      max_projects: plan.max_projects,
      max_members: plan.max_members,
    },
    role: membership.role,
  });
}