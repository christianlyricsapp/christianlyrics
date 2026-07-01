import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  // Graceful fallback during build step if variables aren't injected yet locally
  console.warn("Supabase credentials not found. Database features will fallback to empty data.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: typeof window !== "undefined" ? window.sessionStorage : undefined,
    detectSessionInUrl: true,
  }
});
