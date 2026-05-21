import { createClient } from "@supabase/supabase-js";

// ❌ Removed cache() — it was serving stale plan data after upgrades
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FREE_PLAN = {
  slug: "free",
  name: "Free",
  max_projects: 1,
  max_members: 1,
};

export async function getOrgPlan(organizationId: string) {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select(`
        status,
        cancel_at_period_end,
        current_period_end,
        subscription_plans (
          slug,
          name,
          max_projects,
          max_members
        )
      `)
      .eq("organization_id", organizationId)
      .in("status", ["active", "trialing"]) // ✅ only treat active/trialing as paid
      .order("current_period_end", { ascending: false })
      .limit(1)
      .maybeSingle(); // ✅ won't throw if no row found

    // No active subscription → free plan
    if (error || !data || !data.subscription_plans) {
      const { data: freePlan } = await supabase
        .from("subscription_plans")
        .select("slug, name, max_projects, max_members")
        .eq("slug", "free")
        .maybeSingle();

      return {
        status: "free" as const,
        plan: freePlan ?? FREE_PLAN,
        isPro: false,
        cancel_at_period_end: false,
        current_period_end: null,
      };
    }

    const plan = Array.isArray(data.subscription_plans)
      ? data.subscription_plans[0]
      : data.subscription_plans;

    return {
      status: data.status,
      plan: plan ?? FREE_PLAN,
      isPro: plan?.slug !== "free",         // ✅ handy boolean for gating UI
      cancel_at_period_end: data.cancel_at_period_end ?? false,
      current_period_end: data.current_period_end ?? null,
    };

  } catch (err) {
    console.error("Error fetching org plan:", err);
    return {
      status: "free" as const,
      plan: FREE_PLAN,
      isPro: false,
      cancel_at_period_end: false,
      current_period_end: null,
    };
  }
}