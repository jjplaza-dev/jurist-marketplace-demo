import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

// Placeholders keep `next build` working when env vars are not set yet.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-key",
  { auth: { persistSession: false } }
);

export const IMAGE_BUCKET = "listing-images";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
