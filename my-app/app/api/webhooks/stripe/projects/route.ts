import { getOrgPlan } from "@/app/lib/billing/getOrgPlan";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { count } from "console";

export async function POST(req: Request){
    const {organizationId, name} = await req.json();

    const supabase = getSupabaseServerClient();

    const {plan ,status} = await getOrgPlan(organizationId);
    if(status !== "active"){
        return Response.json(
            {error:"Subscription inactive"},
            { status: 403 }

        )
    }
    const {count} = await supabase
         .from("projects")
         .select("*",{count: "exact", head: "true"})
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
  return Response.json({project: data});
           

}