
import { getOrgPlan } from "@/app/lib/billing/getOrgPlan";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const VALID_ROLES = ["member", "admin"];

export async function POST(req: Request) {
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

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { plan } = await getOrgPlan(organizationId);

  const { count } = await supabase
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
   const { data: existingInvite } = await supabase
    .from("invites")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("email", email)
    .is("accepted_at", null)
    .maybeSingle();

  if (existingInvite) {
    return Response.json({ error: "Invite already pending" }, { status: 409 });
  }
  const token = crypto.randomUUID();

  const { data, error } = await supabase
    .from("invites")
    .insert({
      organization_id: organizationId,
      email,
      role,
      created_by: user.id,
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