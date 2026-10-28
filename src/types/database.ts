import type { ConversationStatus, SenderRole, UserRole } from "@/types";

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
          task_number: number | null;
          title: string;
          description: string | null;
          grade_level: string | null;
          grade_levels: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          task_number?: number | null;
          title: string;
          description?: string | null;
          grade_level?: string | null;
          grade_levels?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          task_number?: number | null;
          title?: string;
          description?: string | null;
          grade_level?: string | null;
          grade_levels?: string[];
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
          updated_at: string;
          message_count: number;
          is_solved_by_ai: boolean;
          pinned_message_id: string | null;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          status?: ConversationStatus;
          created_at?: string;
          updated_at?: string;
          message_count?: number;
          is_solved_by_ai?: boolean;
          pinned_message_id?: string | null;
        };
        Update: {
          id?: string;
          task_id?: string;
          user_id?: string;
          status?: ConversationStatus;
          created_at?: string;
          updated_at?: string;
          message_count?: number;
          is_solved_by_ai?: boolean;
          pinned_message_id?: string | null;
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
