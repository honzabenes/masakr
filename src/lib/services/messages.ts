import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";
import type { Message, SenderRole } from "@/types";

type AppSupabaseClient = SupabaseClient<Database>;

export async function getMessagesByConversationId(
  supabase: AppSupabaseClient,
  conversationId: string,
): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, sender_type, content, image_path, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Nepodařilo se načíst zprávy: ${error.message}`);
  }

  return data.map((msg) => ({
    id: msg.id,
    sender_type: msg.sender_type,
    content: msg.content,
    image_url: msg.image_path ?? undefined,
    created_at: msg.created_at,
  }));
}

export async function createMessage(params: {
  conversationId: string;
  senderType: SenderRole;
  senderId?: string | null;
  content: string;
  imagePath?: string | null;
}): Promise<Message> {
  const adminSupabase = createAdminClient();

  const { data, error } = await adminSupabase
    .from("messages")
    .insert({
      conversation_id: params.conversationId,
      sender_type: params.senderType,
      sender_id: params.senderId ?? null,
      content: params.content,
      image_path: params.imagePath ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Nepodařilo se uložit zprávu: ${error.message}`);
  }

  return {
    id: data.id,
    sender_type: data.sender_type,
    content: data.content,
    image_url: data.image_path ?? undefined,
    created_at: data.created_at,
  };
}
