import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { ConversationStatus } from "@/types";

type AppSupabaseClient = SupabaseClient<Database>;
type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
type ConversationSummary = Pick<
  Conversation,
  "task_id" | "status" | "created_at" | "message_count"
>;

export async function getUserConversationSummaries(
  supabase: AppSupabaseClient,
  userId: string,
): Promise<ConversationSummary[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("task_id, status, created_at, message_count")
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Nepodařilo se načíst konverzace: ${error.message}`);
  }

  return data;
}

export async function getConversation(
  supabase: AppSupabaseClient,
  taskId: string,
  userId: string,
): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("task_id", taskId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Nepodařilo se načíst konverzaci: ${error.message}`);
  }

  return data;
}

export async function getConversationByIdForUser(
  supabase: AppSupabaseClient,
  conversationId: string,
  userId: string,
): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Nepodařilo se načíst konverzaci: ${error.message}`);
  }

  return data;
}

export async function createConversation(
  supabase: AppSupabaseClient,
  taskId: string,
  userId: string,
  status: ConversationStatus,
): Promise<Conversation> {
  const { data, error } = await supabase
    .from("conversations")
    .insert({ task_id: taskId, user_id: userId, status })
    .select()
    .single();

  if (error) {
    throw new Error(`Nepodařilo se založit novou konverzaci: ${error.message}`);
  }

  return data;
}
