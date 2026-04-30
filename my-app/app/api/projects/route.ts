import { getOrgPlan } from "@/app/lib/billing/getOrgPlan";
import { getSupabaseClient, getSupabaseAdmin } from "@/app/lib/billing/supabase/server";

function generateSlug(name: string): string{
  return name
       .toLowerCase()
       .trim()
       .replace(/[^a-z0-9\s-]/g, "")
       .replace(/\s+/g, "-")
       .replace(/-+/g, "-");
}

export async function POST(req: Request) {
  try {
    const { organizationId, name, description } = await req.json();
    
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

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { plan } = await getOrgPlan(organizationId);
    const resolvedPlan = Array.isArray(plan) ? plan[0] : plan;
    
    // if (status !== "active") {
    //   return Response.json(
    //     { error: "Subscription inactive" },
    //     { status: 403 }
    //   );
    // }
    const admin = await getSupabaseAdmin();

    const { count } = await admin
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "active");

    if ((count ?? 0) >= resolvedPlan.max_projects) {
  return Response.json(
    {
      error: `Project limit reached (${count}/${resolvedPlan.max_projects}). Upgrade to Pro.`,
    },
    { status: 403 }
  );
}
    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let suffix = 1;

    while(true){

    const { data: existing } = await admin
      .from("projects")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("slug", slug)
      .maybeSingle();
    
    if(!existing) break;
    slug= `${baseSlug}-${suffix++}`;
    }
    const {data, error} = await admin
        .from("projects")
        .insert({
          organization_id: organizationId,
          created_by: user.id,
          name: name.trim(),
          slug,
          description: description?.trim() || null,
          status: "active",
        })
        .select()
        .single();
      if(error){
        if(error.code === "23505"){
          return Response.json(
            {error:"A project with this name already exists."},
            {status:409}
          )
        }
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
      .eq("status","active")
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