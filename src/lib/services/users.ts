import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { UserRole } from "@/types";

type AppSupabaseClient = SupabaseClient<Database>;

export const getCurrentUserProfile = cache(async () => {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, role, grade_level, nickname")
    .eq("id", authData.user.id)
    .single();

  if (profileError) {
    throw new Error(
      `Nepodařilo se načíst profil uživatele: ${profileError.message}`,
    );
  }

  return profile;
});

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

export async function getUserGradeLevel(
  supabase: AppSupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("users")
    .select("grade_level")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(`Nepodařilo se načíst ročník uživatele: ${error.message}`);
  }

  return data.grade_level;
}
