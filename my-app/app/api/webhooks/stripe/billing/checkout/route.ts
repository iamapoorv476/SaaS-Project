import Stripe from "stripe";
import {createClient} from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!,{
    apiVersion:"2024-12-18",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req:Request){
    const {organizationId, priceId} = await req.json();

    if(!organizationId || !priceId){
        return new  Response("Missing data", {status:400});
    }
    const {data : org} = await supabase
          .from("organizations")
          .select("stripe_customer_id")
          .eq("id",organizationId)
          .single();
    
    const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],

        customer : org?.stripe_customer_id ?? undefined
         line_items : [
            {
                price :priceId,
                quantity: 1,
            },

         ],

         success_url : `${process.env.NEXT_PUBLIC_APP_URL}/billing/success`,
         cancel_url : `${process.env.NEXT_PUBLIC_APP_URL}billing/cancel/`,

         metadata :{
            organization_id : organizationId,
         },

    });
    return Response.json({url : session.url});
}