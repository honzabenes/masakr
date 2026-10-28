import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { createAdminClient } from "@/lib/supabase/admin";

type AppSupabaseClient = SupabaseClient<Database>;
type Task = Database["public"]["Tables"]["tasks"]["Row"];

export interface TaskPromptContext {
  title: string;
  description: string | null;
  grade_levels: string[];
  solution_text: string | null;
  pedagogical_notes: string | null;
}

export interface CreateTaskParams {
  title: string;
  taskNumber: number | null;
  description: string;
  gradeLevels: string[];
  dueDate: string | null;
  isPublished: boolean;
  solutionText: string;
  pedagogicalNotes: string | null;
  taskImageFile: File | null;
  solutionImageFile: File | null;
  teacherId: string;
}

export async function getTasks(
  supabase: AppSupabaseClient,
  studentGradeLevel?: string | null,
): Promise<Task[]> {
  let query = supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (studentGradeLevel) {
    query = query.contains("grade_levels", [studentGradeLevel]);
  }

  const { data, error } = await query;

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
      .select("title, description, grade_levels")
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
    grade_levels: task.grade_levels,
    solution_text: solution.solution_text,
    pedagogical_notes: solution.pedagogical_notes,
  };
}

async function uploadStorageFile(
  supabase: AppSupabaseClient,
  bucket: "task-images" | "teacher-solutions",
  file: File,
): Promise<string> {
  const allowedTypes: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  const ext = allowedTypes[file.type];
  if (!ext) {
    throw new Error(
      "Nepodporovaný formát obrázku. Povolené jsou JPG, PNG a WEBP.",
    );
  }

  const filePath = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(
      `Chyba při nahrávání souboru do ${bucket}: ${error.message}`,
    );
  }

  return filePath;
}

export async function createTaskWithSolution(
  supabase: AppSupabaseClient,
  params: CreateTaskParams,
): Promise<string> {
  let taskImagePath: string | null = null;
  let solutionImagePath: string | null = null;

  if (params.taskImageFile && params.taskImageFile.size > 0) {
    taskImagePath = await uploadStorageFile(
      supabase,
      "task-images",
      params.taskImageFile,
    );
  }

  if (params.solutionImageFile && params.solutionImageFile.size > 0) {
    solutionImagePath = await uploadStorageFile(
      supabase,
      "teacher-solutions",
      params.solutionImageFile,
    );
  }

  const { data: createdTask, error: taskError } = await supabase
    .from("tasks")
    .insert({
      title: params.title,
      task_number: params.taskNumber,
      description: params.description,
      grade_levels: params.gradeLevels,
      due_date: params.dueDate,
      is_published: params.isPublished,
      image_path: taskImagePath,
      created_by: params.teacherId,
    })
    .select("id")
    .single();

  if (taskError || !createdTask) {
    if (taskImagePath)
      await supabase.storage.from("task-images").remove([taskImagePath]);
    if (solutionImagePath)
      await supabase.storage
        .from("teacher-solutions")
        .remove([solutionImagePath]);
    throw new Error(`Nepodařilo se uložit zadání úlohy: ${taskError?.message}`);
  }

  const { error: solutionError } = await supabase
    .from("task_solutions")
    .insert({
      task_id: createdTask.id,
      solution_text: params.solutionText,
      pedagogical_notes: params.pedagogicalNotes,
      solution_image_path: solutionImagePath,
    });

  if (solutionError) {
    await supabase.from("tasks").delete().eq("id", createdTask.id);
    if (taskImagePath)
      await supabase.storage.from("task-images").remove([taskImagePath]);
    if (solutionImagePath)
      await supabase.storage
        .from("teacher-solutions")
        .remove([solutionImagePath]);
    throw new Error(
      `Nepodařilo se uložit vzorové řešení: ${solutionError.message}`,
    );
  }

  return createdTask.id;
}
