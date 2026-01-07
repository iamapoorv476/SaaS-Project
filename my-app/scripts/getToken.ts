import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';
const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function run() {
  const { data, error } = await client.auth.signInWithPassword({
    email: "test@example.com",
    password: "12345678",
  });

  console.log("TOKEN:", data.session?.access_token);
}

run();
