import { getSupabaseClient,getSupabaseAdmin } from "@/app/lib/billing/supabase/server";

export async function DELETE(
    req: Request,
    {params} : {params: Promise<{projectId: string}>}
) {
  try{

    const {projectId} = await params;

    const supabase = await getSupabaseClient();

    const {
        data : {user},
    } = await supabase.auth.getUser();

    if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
   }

   const admin = await getSupabaseAdmin();

   const { data: project } = await supabase
    .from("projects")
    .select("organization_id,status")
    .eq("id", projectId)
    .single();

   if (!project || project.status === "deleted") {
      return Response.json({ error: "Not found" }, { status: 404 });
   }

   const { data: membership } = await supabase
    .from("members")
    .select("role")
    .eq("organization_id", project.organization_id)
    .eq("user_id", user.id)
    .single();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
        return Response.json({ error: "Only admins can delete projects" }, { status: 403 });
    }

    const { error } = await admin
    .from("projects")
     .update({
        status: "deleted",
        updated_at: new Date().toISOString(),
      })
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
  
} catch (error) {
    console.error("Error in DELETE /api/projects/[projectId]:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}