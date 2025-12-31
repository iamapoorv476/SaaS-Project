import { getOrgPlan } from "@/app/lib/billing/getOrgPlan";
import { getSupabaseServerClient } from "@/lib/supabase/server";
//import { count } from "console";

export async function POST(req: Request){
    const {organizationId, name} = await req.json();
    if (!organizationId || !name) {
    return Response.json(
      { error: "organizationId and name are required" },
      { status: 400 }
    );
  }
  

    const supabase = getSupabaseServerClient();
    const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data: membership } = await supabase
    .from("members")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

    const {plan ,status} = await getOrgPlan(organizationId);
    if(status !== "active"){
        return Response.json(
            {error:"Subscription inactive"},
            { status: 403 }

        )
    }
    const {count} = await supabase
         .from("projects")
         .select("*",{count: "exact", head: true})
         .eq("organization_id",organizationId);

         if((count ?? 0) >= plan.max_projects){
            return Response.json(
                {
                    error : `Project limit reached (${count}/${plan.max_projects}). Upgrade to Pro.`
                },
                { status: 403 }
            )
         }
    
    const {data , error} = await supabase
           .from("projects")
           .insert({
            organization_id : organizationId,
            name,
           })
           .select()
           .single();

            if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  await supabase.from("audit_logs").insert({
    organization_id: organizationId,
    actor_id: user.id,
    action: "project.created",
    entity_type: "project",
    entity_id: data.id,
  });
  return Response.json({project: data});
           

}