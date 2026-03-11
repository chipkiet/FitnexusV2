import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded before accessing process.env
dotenv.config({ path: path.join(__dirname, "../.env") });

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
