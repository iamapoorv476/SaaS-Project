import { createClient } from "@supabase/supabase-js";
import { cache } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const getOrgPlan = cache(async (organizationId: string) => {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select(`
        status,
        subscription_plans (
          slug,
          max_projects,
          max_members
        )
      `)
      .eq("organization_id", organizationId)
      .single();
    if (error || !data) {
      console.log(`No subscription found for org ${organizationId}, using free plan`);
      const { data: freePlan } = await supabase
        .from("subscription_plans")
        .select("slug, max_projects, max_members")
        .eq("slug", "free")
        .single();
      
      return {
        status: "free",
        plan: freePlan || {
          slug: "free",
          max_projects: 1,
          max_members: 1,
        },
      };
    }

    if (!data.subscription_plans) {
      console.error(`Plan data missing for subscription`, data);
      throw new Error("Invalid subscription data");
    }

    return {
      status: data.status,
      plan: data.subscription_plans,
    };
    
  } catch (error) {
    console.error("Error fetching org plan:", error);
    
    return {
      status: "error",
      plan: {
        slug: "free",
        max_projects: 1,
        max_members: 1,
      },
    };
  }
});