import { getSupabaseClient } from "@/app/lib/billing/supabase/server";

interface Membership {
  role: "owner" | "admin" | "member";
  organizations: {
    id: string;
    name: string;
  } | null;
}

export async function GET(){
    try {
    const supabase =  await getSupabaseClient();

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

  const organizations = (data as Membership[])
       .filter(m => m.organizations !==null)
       .map(m => ({
        id: m.organizations!.id,
        name: m.organizations!.name,
        role: m.role,
       }))
       .sort((a, b) => {

        const roleOrder = {owner: 0, admin: 1, member: 2};
        const roleCompare = (roleOrder[a.role] || 3) - (roleOrder[b.role] || 3);
        return roleCompare !== 0 ? roleCompare : a.name.localeCompare(b.name);

       })

  return Response.json({organizations});
} 
catch(error){
    console.error("Unexpected error:", error);
    return Response.json(
        {error: "Internal Server Error"},
        {status: 500}
    )
}

}
