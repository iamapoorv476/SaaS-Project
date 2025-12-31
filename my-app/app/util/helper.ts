async function getPlanByPriceID(priceId : string){
    const {data, error} = await supabase
         .from("subscription_plans")
         .select("id")
         .eq("stripe_price_id", priceId)
         .single();

    if(error) throw error;
    return data.id;
}