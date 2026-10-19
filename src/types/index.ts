export type UserRole = "student" | "teacher" | "admin";
export type SenderRole = "student" | "ai" | "admin";
export type ConversationStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "graded";

export interface Message {
  id: string;
  sender_type: SenderRole;
  content: string;
  image_url?: string;
  created_at: string;
}
