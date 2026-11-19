import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service role key. It bypasses RLS, which is
 * how the server reads/writes the `sellers` and `orders` tables and marks listings sold.
 * Never import this from a "use client" file and never prefix the key with NEXT_PUBLIC_.
 */
export function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
  }
}
