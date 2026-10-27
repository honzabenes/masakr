import type { ConversationStatus, UserRole } from "@/types";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          role: UserRole;
        };
        Insert: {
          id: string;
          role?: UserRole;
        };
        Update: {
          id?: string;
          role?: UserRole;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          grade_level: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          grade_level?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          grade_level?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      task_solutions: {
        Row: {
          task_id: string;
          solution_text: string | null;
          pedagogical_notes: string | null;
          solution_image_path: string | null;
        };
        Insert: {
          task_id: string;
          solution_text?: string | null;
          pedagogical_notes?: string | null;
          solution_image_path?: string | null;
        };
        Update: {
          task_id?: string;
          solution_text?: string | null;
          pedagogical_notes?: string | null;
          solution_image_path?: string | null;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          status: ConversationStatus;
          created_at: string;
          message_count: number;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          status?: ConversationStatus;
          created_at?: string;
          message_count?: number;
        };
        Update: {
          id?: string;
          task_id?: string;
          user_id?: string;
          status?: ConversationStatus;
          created_at?: string;
          message_count?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
