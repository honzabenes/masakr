import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { UserRole } from "@/types";

type AppSupabaseClient = SupabaseClient<Database>;

export async function getUserRole(
  supabase: AppSupabaseClient,
  userId: string,
): Promise<UserRole> {
  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(`Nepodařilo se načíst roli uživatele: ${error.message}`);
  }

  return data.role;
}
