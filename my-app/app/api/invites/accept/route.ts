import { getSupabaseClient, getSupabaseAdmin } from "@/app/lib/billing/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be logged in to accept an invite" },
        { status: 401 }
      );
    }

    const admin = await getSupabaseAdmin();
    const { data: invite, error: inviteError } = await admin
      .from("invites")
      .select("*")
      .eq("token", token)
      .is("accepted_at", null)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: "Invalid or expired invite" },
        { status: 404 }
      );
    }
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "This invite has expired" },
        { status: 410 }
      );
    }
    if (user.email !== invite.email) {
      return NextResponse.json(
        { error: "This invite was sent to a different email address" },
        { status: 403 }
      );
    }

    const { data: existingMember } = await admin
      .from("members")
      .select("id")
      .eq("organization_id", invite.organization_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingMember) {
      return NextResponse.json(
        { error: "You are already a member of this organization" },
        { status: 409 }
      );
    }
    const { data: member, error: memberError } = await admin
      .from("members")
      .insert({
        organization_id: invite.organization_id,
        user_id: user.id,
        role: invite.role,
      })
      .select()
      .single();

    if (memberError) {
      console.error("Error creating member:", memberError);
      return NextResponse.json(
        { error: "Failed to add you as a member", details: memberError.message },
        { status: 500 }
      );
    }
    const { error: updateError } = await admin
      .from("invites")
      .update({
        accepted_at: new Date().toISOString(),
        accepted_by: user.id,
      })
      .eq("id", invite.id);

    if (updateError) {
      console.error("Error updating invite:", updateError);
    }

    await admin.from("audit_logs").insert({
      organization_id: invite.organization_id,
      actor_id: user.id,
      action: "invite.accepted",
      entity_type: "invite",
      entity_id: invite.id,
      metadata: {
        email: invite.email,
        role: invite.role,
      },
    });
    const { data: organization } = await admin
      .from("organizations")
      .select("id, name")
      .eq("id", invite.organization_id)
      .single();

    return NextResponse.json(
      {
        success: true,
        message: "Successfully joined organization",
        organization: organization || { id: invite.organization_id, name: "Unknown" },
        member,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error accepting invite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}