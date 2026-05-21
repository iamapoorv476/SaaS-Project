import { getSupabaseClient, getSupabaseAdmin } from "@/app/lib/billing/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
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
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const admin = await getSupabaseAdmin();

    const { data: membership, error: membershipError } = await admin
      .from("members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: "Forbidden - not a member of this organization" },
        { status: 403 }
      );
    }

    const { data: subscription, error: subError } = await admin
      .from("subscriptions")
      .select(`
        *,
        subscription_plans (
          name
        )
      `)
      .eq("organization_id", organizationId)
      .single();

    // No subscription found → free plan
    if (subError || !subscription) {
      return NextResponse.json({
        plan: "free",
        status: "inactive",
        subscription: null,
      });
    }

    // Subscription exists but is canceled/past_due → treat as free
    const activePlanStatuses = ["active", "trialing"];
    const isActive = activePlanStatuses.includes(subscription.status);

    return NextResponse.json({
      plan: isActive
        ? (subscription.subscription_plans?.name ?? "free")
        : "free",
      status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_end: subscription.current_period_end,
      subscription: isActive ? subscription : null,
    });

  } catch (error) {
    console.error("Error in GET /api/billing/status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}