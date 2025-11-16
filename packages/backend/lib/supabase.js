import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const hasSupabaseEnv = Boolean(supabaseUrl && supabaseServiceKey);

if (!hasSupabaseEnv) {
  console.warn(
    "[Env] SUPABASE_URL or SUPABASE_SERVICE_KEY missing. Screenshot storage features are disabled."
  );
}

export const supabase = hasSupabaseEnv
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export function isSupabaseConfigured() {
  return hasSupabaseEnv;
}
