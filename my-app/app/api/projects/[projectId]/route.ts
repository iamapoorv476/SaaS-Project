import { getSupabaseServerClient } from "@/app/lib/billing/supabase/server";

export async function DELETE(
    req: Request,
    {params} : {params: {projectId: string}}
) {
    const projectId = params.projectId;

    const supabase = getSupabaseServerClient();

    const {
        data : {user},
    } = await supabase.auth.getUser();

    if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
   }

   const { data: project } = await supabase
    .from("projects")
    .select("organization_id")
    .eq("id", projectId)
    .single();

   if (!project) {
      return Response.json({ error: "Not found" }, { status: 404 });
   }

   const { data: membership } = await supabase
    .from("members")
    .select("role")
    .eq("organization_id", project.organization_id)
    .eq("user_id", user.id)
    .single();

    if (!membership) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  
  await supabase.from("audit_logs").insert({
    organization_id: project.organization_id,
    actor_id: user.id,
    action: "project.deleted",
    entity_type: "project",
    entity_id: projectId,
  });

  return Response.json({ success: true });
  
}