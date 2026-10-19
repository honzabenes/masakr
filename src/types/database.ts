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
          model_solution: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          model_solution?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          model_solution?: string | null;
          created_at?: string;
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
