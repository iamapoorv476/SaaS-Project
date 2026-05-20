import Stripe from "stripe";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getPlanByPriceID(priceId: string): Promise<string | null> {
  const { data: plan } = await supabase
    .from("subscription_plans")
    .select("id")
    .eq("stripe_price_id", priceId)
    .single();
  return plan?.id ?? null;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const organizationId = session.metadata?.organization_id;
  if (!organizationId) return;

  const customerId = typeof session.customer === "string"
    ? session.customer
    : session.customer?.id;

  if (!customerId) return;

  await supabase
    .from("organizations")
    .update({ stripe_customer_id: customerId })
    .eq("id", organizationId);
}

async function handleSubscriptionUpsert(subscription: Stripe.Subscription) {
  console.log(" handleSubscriptionUpsert called");
  console.log("Subscription ID:", subscription.id);
  console.log("Subscription status:", subscription.status);

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  console.log(" customerId:", customerId);

  const { data: orgData } = await supabase
    .from("organizations")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  let orgId: string | null = orgData?.id ?? null;

  if (!orgId) {
    console.log(" org not found by customerId, checking Stripe metadata...");

    const customer = await stripe.customers.retrieve(customerId);

    if (customer.deleted) {
      console.log(" customer deleted");
      return;
    }

    const organizationId = (customer as Stripe.Customer).metadata?.organization_id;

    console.log(" organizationId from metadata:", organizationId);

    if (!organizationId) {
      console.log(" no organizationId in metadata");
      return;
    }

    const { error: updateError } = await supabase
      .from("organizations")
      .update({ stripe_customer_id: customerId })
      .eq("id", organizationId);

    console.log(" stripe_customer_id update error:", updateError);

    orgId = organizationId;
  }

  if (!orgId) {
    console.log(" org still not resolved");
    return;
  }

  const priceId = subscription.items.data[0].price.id;
  console.log(" priceId:", priceId);

  const planId = await getPlanByPriceID(priceId);
  console.log(" planId:", planId);

  if (!planId) {
    console.log(" No planId found — aborting");
    return;
  }

  const item = subscription.items.data[0];

  if (!item?.current_period_start || !item?.current_period_end) {
    console.log(" Missing period timestamps from Stripe");
    return;
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .upsert({
      organization_id: orgId,
      plan_id: planId,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_start: new Date(item.current_period_start * 1000),
      current_period_end: new Date(item.current_period_end * 1000),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .select();

  console.log(" Upsert data:", data);
  console.log(" Upsert error:", error);
}
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      cancel_at_period_end: false,
    })
    .eq("stripe_subscription_id", subscription.id);
}

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case "customer.subscription.created":
    case "customer.subscription.updated":
      await handleSubscriptionUpsert(event.data.object as Stripe.Subscription);
      break;

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new Response("OK", { status: 200 });
}