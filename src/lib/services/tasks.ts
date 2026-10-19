import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type AppSupabaseClient = SupabaseClient<Database>;
type Task = Database["public"]["Tables"]["tasks"]["Row"];

export async function getTasks(
  supabase: AppSupabaseClient,
): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Nepodařilo se načíst úkoly: ${error.message}`);
  }

  return data;
}

export async function getTaskById(
  supabase: AppSupabaseClient,
  taskId: string,
): Promise<Task | null> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .maybeSingle();

  if (error) {
    throw new Error(`Nepodařilo se načíst úkol: ${error.message}`);
  }

  return data;
}
