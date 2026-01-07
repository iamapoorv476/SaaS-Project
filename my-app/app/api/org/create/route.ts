import { getSupabaseClient,getSupabaseAdmin } from "@/app/lib/billing/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
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
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 }
      );
    }
    const admin = await getSupabaseAdmin();
    const { data: organization, error: orgError } = await admin
      .from("organizations")
      .insert({
        name: name.trim(),
        owner_id: user.id,
      })
      .select()
      .single();

    if (orgError) {
      console.error("Error creating organization:", orgError);
      return NextResponse.json(
        { error: "Failed to create organization", details: orgError.message },
        { status: 500 }
      );
    }
    const { error: memberError } = await admin.from("members").insert({
      organization_id: organization.id,
      user_id: user.id,
      role: "owner",
    });

    if (memberError) {
      console.error("Error creating member record:", memberError);
      await admin.from("organizations").delete().eq("id", organization.id);
      
      return NextResponse.json(
        { error: "Failed to create member record", details: memberError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        organization: {
          id: organization.id,
          name: organization.name,
          created_at: organization.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error in /api/org/create:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}