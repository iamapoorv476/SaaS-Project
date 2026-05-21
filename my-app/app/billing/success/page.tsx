import { redirect } from "next/navigation";
import { getSupabaseClient, getSupabaseAdmin } from "@/app/lib/billing/supabase/server";
import { BillingSuccessClient } from "./BillingSuccessClient";

export default async function BillingSuccessPage() {
  const supabase = await getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/signin?redirect=/billing/success");

  const admin = await getSupabaseAdmin();

  const { data: membership } = await admin
    .from("members")
    .select("organization_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!membership) redirect("/dashboard");

  return <BillingSuccessClient organizationId={membership.organization_id} />;
}