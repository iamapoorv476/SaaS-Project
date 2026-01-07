import { getOrgPlan } from "@/app/lib/billing/getOrgPlan";
import { getSupabaseClient, getSupabaseAdmin } from "@/app/lib/billing/supabase/server";

export async function POST(req: Request) {
  try {
    const { organizationId, name } = await req.json();
    
    if (!organizationId || !name) {
      return Response.json(
        { error: "organizationId and name are required" },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseClient();
    
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

    const { plan, status } = await getOrgPlan(organizationId);
    
    if (status !== "active") {
      return Response.json(
        { error: "Subscription inactive" },
        { status: 403 }
      );
    }
    const admin = await getSupabaseAdmin();

    const { count } = await admin
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId);

    if ((count ?? 0) >= plan.max_projects) {
      return Response.json(
        {
          error: `Project limit reached (${count}/${plan.max_projects}). Upgrade to Pro.`,
        },
        { status: 403 }
      );
    }

    const { data, error } = await admin
      .from("projects")
      .insert({
        organization_id: organizationId,
        name,
      })
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    await admin.from("audit_logs").insert({
      organization_id: organizationId,
      actor_id: user.id,
      action: "project.created",
      entity_type: "project",
      entity_id: data.id,
    });

    return Response.json({ project: data }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/projects:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return Response.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }
    const supabase = await getSupabaseClient();

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

    const admin = await getSupabaseAdmin();

    const { data, error } = await admin
      .from("projects")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ projects: data ?? [] });
  } catch (error) {
    console.error("Error in GET /api/projects:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}