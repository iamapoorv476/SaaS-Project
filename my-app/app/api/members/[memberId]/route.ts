import { getSupabaseServerClient } from "@/app/lib/billing/supabase/server";

export async function DELETE(
    req: Request,
    {params}: {params: {memberId: string}}
) {
    const supabase = getSupabaseServerClient();
    const memberId = params.memberId;

    const {
        data: {user},
    } = await supabase.auth.getUser();

    if(!user) return Response.json({error: "Unauthorized"}, {status: 401});

    const {data: member} = await supabase
       .from("members")
       .select("organization_id, user_id")
       .eq("id", memberId)
       .single();
    
    if(!member){
        return Response.json({error:"Not found"}, {status: 404});
    }

    const {data: acting} = await supabase
        .from("members")
        .select("role")
        .eq("organization_id", member.organization_id)
        .eq("user_id", user.id)
        .single();
    
    if (!acting || !["owner", "admin"].includes(acting.role)) {
         return Response.json({ error: "Forbidden" }, { status: 403 });
  }
    
    if(member.user_id === user.id && acting.role === "owner"){
        return Response.json(
            {error: "Owners cannot remove themselves"},
            {status: 400}
        )
    }
    
    await supabase.from("members").delete().eq("id", memberId);

    await supabase.from("audit_logs").insert({
    organization_id: member.organization_id,
    actor_id: user.id,
    action: "member.removed",
    entity_type: "member",
    entity_id: memberId,
  });

  return Response.json({ success: true });
}