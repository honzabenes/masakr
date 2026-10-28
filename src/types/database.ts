import type { ConversationStatus, SenderRole, UserRole } from "@/types";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          nickname: string | null;
          role: UserRole;
          grade_level: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          nickname?: string | null;
          role?: UserRole;
          grade_level?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nickname?: string | null;
          role?: UserRole;
          grade_level?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          created_by: string | null;
          created_at: string;
          image_path: string | null;
          is_published: boolean;
          due_date: string | null;
          task_number: number | null;
          grade_levels: string[];
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          created_by?: string | null;
          created_at?: string;
          image_path?: string | null;
          is_published?: boolean;
          due_date?: string | null;
          task_number?: number | null;
          grade_levels?: string[];
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          created_by?: string | null;
          created_at?: string;
          image_path?: string | null;
          is_published?: boolean;
          due_date?: string | null;
          task_number?: number | null;
          grade_levels?: string[];
        };
        Relationships: [];
      };
      task_solutions: {
        Row: {
          task_id: string;
          solution_text: string | null;
          solution_image_path: string | null;
          pedagogical_notes: string | null;
        };
        Insert: {
          task_id: string;
          solution_text?: string | null;
          solution_image_path?: string | null;
          pedagogical_notes?: string | null;
        };
        Update: {
          task_id?: string;
          solution_text?: string | null;
          solution_image_path?: string | null;
          pedagogical_notes?: string | null;
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
          pinned_message_id: string | null;
          is_solved_by_ai: boolean;
          message_count: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          status?: ConversationStatus;
          created_at?: string;
          pinned_message_id?: string | null;
          is_solved_by_ai?: boolean;
          message_count?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          user_id?: string;
          status?: ConversationStatus;
          created_at?: string;
          pinned_message_id?: string | null;
          is_solved_by_ai?: boolean;
          message_count?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_type: SenderRole;
          sender_id: string | null;
          content: string;
          image_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_type: SenderRole;
          sender_id?: string | null;
          content: string;
          image_path?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_type?: SenderRole;
          sender_id?: string | null;
          content?: string;
          image_path?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      message_ai_metadata: {
        Row: {
          message_id: string;
          ocr_transcription: string | null;
          student_error_analysis: string | null;
          did_answer_previous: boolean | null;
          tokens_used: number | null;
        };
        Insert: {
          message_id: string;
          ocr_transcription?: string | null;
          student_error_analysis?: string | null;
          did_answer_previous?: boolean | null;
          tokens_used?: number | null;
        };
        Update: {
          message_id?: string;
          ocr_transcription?: string | null;
          student_error_analysis?: string | null;
          did_answer_previous?: boolean | null;
          tokens_used?: number | null;
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
