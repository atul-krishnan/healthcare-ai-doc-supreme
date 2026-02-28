export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          country: string | null;
          timezone: string | null;
          role: "patient" | "doctor" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          country?: string | null;
          timezone?: string | null;
          role?: "patient" | "doctor" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          phone?: string | null;
          country?: string | null;
          timezone?: string | null;
          role?: "patient" | "doctor" | "admin";
          updated_at?: string;
        };
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          id: string;
          user_id: string;
          daily_summary: boolean;
          consultation_updates: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          daily_summary?: boolean;
          consultation_updates?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          daily_summary?: boolean;
          consultation_updates?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      triage_sessions: {
        Row: {
          id: string;
          user_id: string;
          symptom_text: string;
          severity: "low" | "medium" | "high";
          recommendation: string;
          red_flags: string[];
          ai_model: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symptom_text: string;
          severity: "low" | "medium" | "high";
          recommendation: string;
          red_flags?: string[];
          ai_model?: string | null;
          created_at?: string;
        };
        Update: {
          severity?: "low" | "medium" | "high";
          recommendation?: string;
          red_flags?: string[];
          ai_model?: string | null;
        };
        Relationships: [];
      };
      chat_threads: {
        Row: {
          id: string;
          user_id: string;
          status: "open" | "closed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: "open" | "closed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: "open" | "closed";
          updated_at?: string;
        };
        Relationships: [];
      };
      chat_messages: {
        Row: {
          id: string;
          thread_id: string;
          user_id: string;
          role: "patient" | "doctor" | "assistant";
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          thread_id: string;
          user_id: string;
          role: "patient" | "doctor" | "assistant";
          content: string;
          created_at?: string;
        };
        Update: {
          content?: string;
        };
        Relationships: [];
      };
      consultations: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string | null;
          triage_session_id: string | null;
          status: "open" | "assigned" | "in_progress" | "completed" | "cancelled";
          priority: "normal" | "urgent" | "critical";
          chief_complaint: string;
          clinical_summary: string | null;
          resolution_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id?: string | null;
          triage_session_id?: string | null;
          status?: "open" | "assigned" | "in_progress" | "completed" | "cancelled";
          priority?: "normal" | "urgent" | "critical";
          chief_complaint: string;
          clinical_summary?: string | null;
          resolution_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          doctor_id?: string | null;
          triage_session_id?: string | null;
          status?: "open" | "assigned" | "in_progress" | "completed" | "cancelled";
          priority?: "normal" | "urgent" | "critical";
          chief_complaint?: string;
          clinical_summary?: string | null;
          resolution_notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      consultation_messages: {
        Row: {
          id: string;
          consultation_id: string;
          sender_id: string;
          sender_role: "patient" | "doctor" | "assistant";
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          consultation_id: string;
          sender_id: string;
          sender_role: "patient" | "doctor" | "assistant";
          content: string;
          created_at?: string;
        };
        Update: {
          content?: string;
        };
        Relationships: [];
      };
      prescriptions: {
        Row: {
          id: string;
          consultation_id: string;
          patient_id: string;
          doctor_id: string;
          medication: string;
          dosage: string;
          instructions: string;
          status: "issued" | "voided";
          created_at: string;
        };
        Insert: {
          id?: string;
          consultation_id: string;
          patient_id: string;
          doctor_id: string;
          medication: string;
          dosage: string;
          instructions: string;
          status?: "issued" | "voided";
          created_at?: string;
        };
        Update: {
          medication?: string;
          dosage?: string;
          instructions?: string;
          status?: "issued" | "voided";
        };
        Relationships: [];
      };
      audit_events: {
        Row: {
          id: string;
          actor_user_id: string;
          action: string;
          resource_type: string;
          resource_id: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_user_id: string;
          action: string;
          resource_type: string;
          resource_id: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          metadata?: Json;
        };
        Relationships: [];
      };
      health_records: {
        Row: {
          id: string;
          user_id: string;
          record_type: string;
          source: string;
          title: string;
          observed_at: string | null;
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          record_type: string;
          source?: string;
          title: string;
          observed_at?: string | null;
          payload?: Json;
          created_at?: string;
        };
        Update: {
          record_type?: string;
          source?: string;
          title?: string;
          observed_at?: string | null;
          payload?: Json;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          status: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          stripe_price_id: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider?: string;
          status: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          current_period_end?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
