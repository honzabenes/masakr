"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireCurrentUser } from "@/lib/services/auth";
import { getUserRole } from "@/lib/services/users";
import { createTaskWithSolution } from "@/lib/services/tasks";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const CreateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Název úlohy musí mít alespoň 3 znaky.")
    .max(150),
  taskNumber: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() !== "" ? Number(val) : null))
    .refine((val) => val === null || (Number.isInteger(val) && val > 0), {
      message: "Číslo úlohy musí být kladné celé číslo.",
    }),
  description: z.string().trim().min(10, "Zadání úlohy je příliš krátké."),
  gradeLevels: z
    .array(z.enum(["5", "7", "9"]))
    .min(1, "Vyberte alespoň jeden ročník."),
  dueDate: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return null;
      const parsed = new Date(val);
      return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
    }),
  isPublished: z.boolean(),
  solutionText: z.string().trim().min(5, "Vzorové řešení nesmí být prázdné."),
  pedagogicalNotes: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() !== "" ? val.trim() : null)),
});

function validateOptionalImage(
  file: File | null,
  label: string,
): string | null {
  if (!file || file.size === 0) return null;
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return `${label}: Povolené jsou pouze formáty JPG, PNG a WEBP.`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `${label}: Maximální velikost souboru je 5 MB.`;
  }
  return null;
}

export interface CreateTaskActionState {
  error?: string;
}

export async function createTaskAction(
  formData: FormData,
): Promise<CreateTaskActionState> {
  const supabase = await createClient();
  const user = await requireCurrentUser(supabase);
  const role = await getUserRole(supabase, user.id);

  if (role !== "teacher") {
    return { error: "Nemáte oprávnění vytvářet úlohy." };
  }

  const rawData = {
    title: formData.get("title") ?? "",
    taskNumber: (formData.get("task_number") as string) ?? "",
    description: formData.get("description") ?? "",
    gradeLevels: formData.getAll("grade_levels"),
    dueDate: (formData.get("due_date") as string) ?? "",
    isPublished: formData.get("is_published") === "on",
    solutionText: formData.get("solution_text") ?? "",
    pedagogicalNotes: (formData.get("pedagogical_notes") as string) ?? "",
  };

  const parsed = CreateTaskSchema.safeParse(rawData);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { error: firstIssue?.message ?? "Zkontrolujte vyplněné údaje." };
  }

  const taskImageFile = formData.get("task_image") as File | null;
  const solutionImageFile = formData.get("solution_image") as File | null;

  const taskImgError = validateOptionalImage(taskImageFile, "Obrázek zadání");
  if (taskImgError) return { error: taskImgError };

  const solImgError = validateOptionalImage(
    solutionImageFile,
    "Fotka vzorového řešení",
  );
  if (solImgError) return { error: solImgError };

  try {
    await createTaskWithSolution(supabase, {
      ...parsed.data,
      taskImageFile:
        taskImageFile && taskImageFile.size > 0 ? taskImageFile : null,
      solutionImageFile:
        solutionImageFile && solutionImageFile.size > 0
          ? solutionImageFile
          : null,
      teacherId: user.id,
    });
  } catch (err) {
    console.error("[CREATE_TASK_ACTION_ERROR]", err);
    return {
      error:
        err instanceof Error
          ? err.message
          : "Nastala chyba při ukládání úlohy do databáze.",
    };
  }

  revalidatePath("/tasks");
  revalidatePath("/teacher-dashboard");
  revalidatePath("/dashboard");
  redirect("/tasks");
}
