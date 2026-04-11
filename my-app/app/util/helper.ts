import { getSupabaseAdmin } from "../lib/billing/supabase/server";
async function getPlanByPriceID(priceId : string){
    const admin = await getSupabaseAdmin();
    const {data, error} = await admin
         .from("subscription_plans")
         .select("id")
         .eq("stripe_price_id", priceId)
         .single();

    if(error) throw error;
    return data.id;
}