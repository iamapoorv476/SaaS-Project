import { getSupabaseServerClient } from "@/app/lib/billing/supabase/server";

interface Membership {
  role: "owner" | "admin" | "member";
  organizations: {
    id: string;
    name: string;
  } | null;
}

export async function GET(){
    const supabase = getSupabaseServerClient();

    const{
        data: {user},
        error:authError,
    } = await supabase.auth.getUser();

    if(!user || authError){
        return Response.json({error:"Unauthorized"},{status:401});
    }

    const {data, error} = await supabase
         .from("members")
         .select(`
            role,
            organizations (
               id,
               name

            )
        ` )
        .eq("user_id",user.id);
    

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const organizations = data.map((m: any)=>({
    id: m.organizations.id,
    name:m.organizations.name,
    role:m.role,
  }))
  return Response.json({organizations});
}