"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCurrentUser } from "@/lib/services/auth";
import { submitConversation } from "@/lib/services/conversations";

export async function submitTaskAction(conversationId: string, taskId: string) {
  const supabase = await createClient();
  const user = await requireCurrentUser(supabase);

  await submitConversation(supabase, conversationId, user.id);

  revalidatePath(`/task/${taskId}`);
  revalidatePath("/dashboard");
}
