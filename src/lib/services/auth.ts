import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { redirect } from "next/navigation";

export type AppSupabaseClient = SupabaseClient<Database>;

export async function getCurrentUser(
  supabase: AppSupabaseClient,
): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(`Nepodařilo se načíst přihlášeného uživatele: ${error.message}`);
  }

  return data.user;
}

export async function requireCurrentUser(
  supabase: AppSupabaseClient,
): Promise<User> {
  const user = await getCurrentUser(supabase);

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function signInWithPassword(
  supabase: AppSupabaseClient,
  email: string,
  password: string,
): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  return { error: error ? new Error(error.message) : null };
}

export async function signOut(supabase: AppSupabaseClient): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`Nepodařilo se odhlásit uživatele: ${error.message}`);
  }
}
