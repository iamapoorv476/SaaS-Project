
import { getOrgPlan } from "@/app/lib/billing/getOrgPlan";
import { getSupabaseClient,getSupabaseAdmin } from "@/app/lib/billing/supabase/server";

const VALID_ROLES = ["member", "admin"];

export async function POST(req: Request) {
  try{
  const { organizationId, email, role } = await req.json();

  if (!organizationId || !email) {
    return Response.json(
      { error: "organizationId and email are required" },
      { status: 400 }
    );
  }

  if (!VALID_ROLES.includes(role)) {
    return Response.json({ error: "Invalid role" }, { status: 400 });
  }

  const supabase =await getSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const admin = await getSupabaseAdmin();

  const { data: membership } = await admin
    .from("members")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .single();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { plan } = await getOrgPlan(organizationId);

  const { count } = await admin
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  if ((count ?? 0) >= plan.max_members) {
    return Response.json(
      {
        error: `Member limit reached (${count}/${plan.max_members}). Upgrade to Pro.`,
      },
      { status: 403 }
    );
  }
   const { data: existingInvite } = await admin
    .from("invites")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("email", email)
    .is("accepted_at", null)
    .maybeSingle();

  if (existingInvite) {
    return Response.json({ error: "Invite already pending" }, { status: 409 });
  }
  // const {data: existingMember} = await admin 
  //        .from("members")
  //        .select("id")
  //        .eq("organization_id",organizationId)
  //        .eq("user_id",user.id)
  //        .maybeSingle();
  // if(existingMember){
  //   return Response.json({error:"Member already exists"},{status: 409});
  // }
  const token = crypto.randomUUID();
  const { data, error } = await admin
    .from("invites")
    .insert({
      organization_id: organizationId,
      email,
      role,
      created_by: user.id,
      token: token,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("audit_logs").insert({
    organization_id: organizationId,
    actor_id: user.id,
    action: "invite.created",
    entity_type: "invite",
    entity_id: data.id,
  });
  

  return Response.json({ invite: data });
}
catch(error){
  console.error("Unexpected error in POST /api/invites/create:", error);
  return Response.json({error:"Internal server error"},{status:500})
}
}