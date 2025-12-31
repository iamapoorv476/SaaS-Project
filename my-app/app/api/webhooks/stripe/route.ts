import Stripe from "stripe"
import { headers } from "next/headers"
import {createClient} from "@supabase/supabase-js";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-12-18",
});

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);
async function handleCheckoutCompleted(
    session:Stripe.Checkout.Session
) {
    const organizationId = session.metadata?.organization_id;
    if(!organizationId){
        return;
    }
    const customerId = typeof session.customer === "string"?
                         session.customer : session.customer?.id;
    
    if(!customerId) return;

    await supabase
        .from("organizations")
        .update({stripe_customer_id: customerId})
        .eq("id", organizationId);
                         
}

async function handleSubscriptionUpsert(
    subscription : Stripe.Subscription
) {
    const customerId = typeof subscription.customer === "string" ?
                         subscription.customer : subscription.customer.id;
    
    const {data : org} = await supabase
         .from("organizations")
         .select("id")
         .eq("stripe_customer_id", customerId)
         .single();
    if (!org) return;

    const priceId = subscription.items.data[0].price.id
    const planId = await getPlanByPriceID(priceId);

    await supabase.from("subscriptions").upsert({
        organization_id : org.id,
        plan_id: planId,
        stripe_subscription_id: subscription.id,
        status : subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000),
    current_period_end: new Date(subscription.current_period_end * 1000),
    cancel_at_period_end: subscription.cancel_at_period_end,

    })
}
async function handleSubscriptionDeleted(
    subscription : Stripe.Subscription
) {
    await supabase
         .from("subscriptions")
         .update({
            status:"canceled",
            cancel_at_period_end: false,
         })
         .eq("stripe_subscription_id",subscription.id);
}

export async function POST(req: Request){
    const body = await req.text();
    const signature =  headers().get("stripe-signature");

    if(!signature){
        return new Response("Missing stripe signature",{status: 400});
    }
    let event : Stripe.event;

    try{
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch(err){
        console.error("Webhook signature verification failed",err);
        return new Response("Invalid signature",{status:400});
    }
    switch(event.type){
        case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

        case "customer.subscription.updated":
        case "customer.subscription.created":
        await handleSubscriptionUpsert(event.data.object as Stripe.Subscription);
        break;

        case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

        default:
            console.log(`Unhandled event type : ${event.type}`);
    }
       
    return new Response("OK", {status: 200});
}