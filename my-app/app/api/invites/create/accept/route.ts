import { getSupabaseServerClient } from "@/app/lib/billing/supabase/server";
export async function POST(req: Request) {
  const { token } = await req.json();

  if (!token) {
    return Response.json({ error: "Token required" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data: invite } = await supabase
    .from("invites")
    .select("*")
    .eq("token", token)
    .is("accepted_at", null)
    .single();

  if (!invite) {
    return Response.json({ error: "Invalid or expired invite" }, { status: 410 });
  }

  await supabase.from("members").insert({
    organization_id: invite.organization_id,
    user_id: user.id,
    role: invite.role,
  });

  await supabase
    .from("invites")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  await supabase.from("audit_logs").insert({
    organization_id: invite.organization_id,
    actor_id: user.id,
    action: "invite.accepted",
    entity_type: "invite",
    entity_id: invite.id,
  });

  return Response.json({ success: true });
}
