"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireCurrentUser } from "@/lib/services/auth";
import { submitConversation } from "@/lib/services/conversations";

const SubmitTaskSchema = z.object({
  conversationId: z.uuid(),
  taskId: z.uuid(),
});

export async function submitTaskAction(conversationId: string, taskId: string) {
  const parsed = SubmitTaskSchema.safeParse({ conversationId, taskId });
  if (!parsed.success) {
    throw new Error("Neplatný identifikátor úlohy nebo konverzace.");
  }

  const supabase = await createClient();
  const user = await requireCurrentUser(supabase);

  await submitConversation(supabase, parsed.data.conversationId, user.id);

  revalidatePath(`/task/${parsed.data.taskId}`);
  revalidatePath("/dashboard");
}
