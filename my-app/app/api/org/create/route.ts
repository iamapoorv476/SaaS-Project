import { getSupabaseServerClient } from "@/app/lib/billing/supabase/server";

export async function POST(req:Request) {
    const {name} = await req.json();

    if(!name){
        return Response.json({error :"name required"},{status:400});
    }

    const supabase = getSupabaseServerClient();

    const {
        data :{user},
        error : authError,
    } = await supabase.auth.getUser();

    if(!user || authError){
        return Response.json({error:"Authentication is required"},{status:401});
    }

    const {data : org, error: orgError} = await supabase
          .from("organizations")
          .insert({name})
          .select()
          .single();
    
    if(orgError){
        return Response.json({error:orgError.message},{status:500});
    }

    await supabase.from("members").insert({
        organization_id :org.id,
        user_id:user.id,
        role:"owner",
    });

    const {data: freePlan} =await supabase
          .from("subscription_plans")
    .select("id")
    .eq("slug", "free")
    .single();

  if (freePlan) {
    await supabase.from("subscriptions").insert({
      organization_id: org.id,
      plan_id: freePlan.id,
      status: "active",
    });
  }

   await supabase.from("audit_logs").insert({
    organization_id: org.id,
    actor_id: user.id,
    action: "organization.created",
    entity_type: "organization",
    entity_id: org.id,
  });

  return Response.json({ organization: org });


}