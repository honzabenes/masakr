import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { createAdminClient } from "@/lib/supabase/admin";

type AppSupabaseClient = SupabaseClient<Database>;
type Task = Database["public"]["Tables"]["tasks"]["Row"];

export interface TaskPromptContext {
  title: string;
  description: string | null;
  grade_level: string | null;
  solution_text: string | null;
  pedagogical_notes: string | null;
}

export async function getTasks(supabase: AppSupabaseClient): Promise<Task[]> {
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

export async function getTaskWithSolutionForAi(
  taskId: string,
): Promise<TaskPromptContext | null> {
  const adminSupabase = createAdminClient();

  const [
    { data: task, error: taskError },
    { data: solution, error: solutionError },
  ] = await Promise.all([
    adminSupabase
      .from("tasks")
      .select("title, description, grade_level")
      .eq("id", taskId)
      .maybeSingle(),
    adminSupabase
      .from("task_solutions")
      .select("solution_text, pedagogical_notes")
      .eq("task_id", taskId)
      .maybeSingle(),
  ]);

  if (taskError) {
    throw new Error(`Nepodařilo se načíst úlohu: ${taskError.message}`);
  }
  if (solutionError) {
    throw new Error(
      `Nepodařilo se načíst řešení úlohy: ${solutionError.message}`,
    );
  }

  if (!task || !solution) {
    return null;
  }

  return {
    title: task.title,
    description: task.description,
    grade_level: task.grade_level,
    solution_text: solution.solution_text,
    pedagogical_notes: solution.pedagogical_notes,
  };
}
