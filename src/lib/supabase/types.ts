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
      briefs: {
        Row: {
          id: string;
          user_id: string | null;
          anon_session_id: string | null;
          created_at: string;
          updated_at: string;
          title: "Doctor Brief" | "Emergency Brief";
          care_setting: Database["public"]["Enums"]["care_setting"];
          department_bucket: Database["public"]["Enums"]["department_bucket"];
          summary_json: Json;
          confidence_notes: string | null;
          share_token: string | null;
          share_pin_hash: string | null;
          share_expires_at: string | null;
          revoked_at: string | null;
          attachment_count: number;
          generated_by_model: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          anon_session_id?: string | null;
          created_at?: string;
          updated_at?: string;
          title: "Doctor Brief" | "Emergency Brief";
          care_setting: Database["public"]["Enums"]["care_setting"];
          department_bucket: Database["public"]["Enums"]["department_bucket"];
          summary_json?: Json;
          confidence_notes?: string | null;
          share_token?: string | null;
          share_pin_hash?: string | null;
          share_expires_at?: string | null;
          revoked_at?: string | null;
          attachment_count?: number;
          generated_by_model?: string | null;
        };
        Update: {
          user_id?: string | null;
          anon_session_id?: string | null;
          updated_at?: string;
          title?: "Doctor Brief" | "Emergency Brief";
          care_setting?: Database["public"]["Enums"]["care_setting"];
          department_bucket?: Database["public"]["Enums"]["department_bucket"];
          summary_json?: Json;
          confidence_notes?: string | null;
          share_token?: string | null;
          share_pin_hash?: string | null;
          share_expires_at?: string | null;
          revoked_at?: string | null;
          attachment_count?: number;
          generated_by_model?: string | null;
        };
        Relationships: [];
      };
      brief_events: {
        Row: {
          id: string;
          brief_id: string;
          actor_type: Database["public"]["Enums"]["brief_actor_type"];
          actor_id: string | null;
          event_type: string;
          ip: string | null;
          user_agent: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          brief_id: string;
          actor_type: Database["public"]["Enums"]["brief_actor_type"];
          actor_id?: string | null;
          event_type: string;
          ip?: string | null;
          user_agent?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          actor_id?: string | null;
          event_type?: string;
          ip?: string | null;
          user_agent?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      uploads: {
        Row: {
          id: string;
          brief_id: string | null;
          user_id: string | null;
          anon_session_id: string | null;
          storage_path: string;
          mime_type: string;
          original_filename: string | null;
          created_at: string;
          ocr_text: string | null;
          doc_summary: string | null;
          extraction_confidence: string | null;
        };
        Insert: {
          id?: string;
          brief_id?: string | null;
          user_id?: string | null;
          anon_session_id?: string | null;
          storage_path: string;
          mime_type: string;
          original_filename?: string | null;
          created_at?: string;
          ocr_text?: string | null;
          doc_summary?: string | null;
          extraction_confidence?: string | null;
        };
        Update: {
          brief_id?: string | null;
          user_id?: string | null;
          anon_session_id?: string | null;
          ocr_text?: string | null;
          doc_summary?: string | null;
          extraction_confidence?: string | null;
        };
        Relationships: [];
      };
      doctor_applications: {
        Row: {
          id: string;
          auth_user_id: string;
          full_name: string;
          specialization: string;
          languages: string[];
          registration_number: string;
          registration_council: string;
          years_experience: number;
          city: string;
          phone: string;
          whatsapp: string | null;
          quickcheck_opt_in: boolean;
          availability_days: string[];
          availability_window: string;
          terms_accepted: boolean;
          status: "pending" | "approved" | "rejected" | "disabled";
          reviewed_by: string | null;
          reviewed_at: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          full_name: string;
          specialization: string;
          languages?: string[];
          registration_number: string;
          registration_council: string;
          years_experience: number;
          city: string;
          phone: string;
          whatsapp?: string | null;
          quickcheck_opt_in?: boolean;
          availability_days?: string[];
          availability_window?: string;
          terms_accepted?: boolean;
          status?: "pending" | "approved" | "rejected" | "disabled";
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          specialization?: string;
          languages?: string[];
          registration_number?: string;
          registration_council?: string;
          years_experience?: number;
          city?: string;
          phone?: string;
          whatsapp?: string | null;
          quickcheck_opt_in?: boolean;
          availability_days?: string[];
          availability_window?: string;
          terms_accepted?: boolean;
          status?: "pending" | "approved" | "rejected" | "disabled";
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      doctors: {
        Row: {
          id: string;
          auth_user_id: string | null;
          name: string;
          phone: string | null;
          specialization: string | null;
          languages: string[];
          years_experience: number | null;
          city: string | null;
          registration_number: string | null;
          registration_council: string | null;
          availability_enabled: boolean;
          availability_days: string[];
          availability_start_time: string;
          availability_end_time: string;
          role: "doctor" | "admin";
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          name: string;
          phone?: string | null;
          specialization?: string | null;
          languages?: string[];
          years_experience?: number | null;
          city?: string | null;
          registration_number?: string | null;
          registration_council?: string | null;
          availability_enabled?: boolean;
          availability_days?: string[];
          availability_start_time?: string;
          availability_end_time?: string;
          role?: "doctor" | "admin";
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          auth_user_id?: string | null;
          name?: string;
          phone?: string | null;
          specialization?: string | null;
          languages?: string[];
          years_experience?: number | null;
          city?: string | null;
          registration_number?: string | null;
          registration_council?: string | null;
          availability_enabled?: boolean;
          availability_days?: string[];
          availability_start_time?: string;
          availability_end_time?: string;
          role?: "doctor" | "admin";
          active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      quickcheck_slots: {
        Row: {
          id: string;
          start_time: string;
          end_time: string;
          is_booked: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          start_time: string;
          end_time: string;
          is_booked?: boolean;
          created_at?: string;
        };
        Update: {
          start_time?: string;
          end_time?: string;
          is_booked?: boolean;
        };
        Relationships: [];
      };
      quickcheck_bookings: {
        Row: {
          id: string;
          slot_id: string;
          brief_id: string;
          user_id: string | null;
          anon_session_id: string | null;
          phone: string;
          language: Database["public"]["Enums"]["quickcheck_language"];
          consent_to_call: boolean;
          status: Database["public"]["Enums"]["quickcheck_booking_status"];
          doctor_id: string | null;
          notes: string | null;
          reschedule_count: number;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          slot_id: string;
          brief_id: string;
          user_id?: string | null;
          anon_session_id?: string | null;
          phone: string;
          language?: Database["public"]["Enums"]["quickcheck_language"];
          consent_to_call?: boolean;
          status?: Database["public"]["Enums"]["quickcheck_booking_status"];
          doctor_id?: string | null;
          notes?: string | null;
          reschedule_count?: number;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          slot_id?: string;
          brief_id?: string;
          user_id?: string | null;
          anon_session_id?: string | null;
          phone?: string;
          language?: Database["public"]["Enums"]["quickcheck_language"];
          consent_to_call?: boolean;
          status?: Database["public"]["Enums"]["quickcheck_booking_status"];
          doctor_id?: string | null;
          notes?: string | null;
          reschedule_count?: number;
          updated_at?: string;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      doctor_access_log: {
        Row: {
          id: string;
          doctor_id: string;
          brief_id: string;
          timestamp: string;
          action: string;
        };
        Insert: {
          id?: string;
          doctor_id: string;
          brief_id: string;
          timestamp?: string;
          action?: string;
        };
        Update: {
          action?: string;
        };
        Relationships: [];
      };
      analytics_events: {
        Row: {
          id: string;
          event_name: string;
          brief_id: string | null;
          user_id: string | null;
          anon_session_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_name: string;
          brief_id?: string | null;
          user_id?: string | null;
          anon_session_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          metadata?: Json;
        };
        Relationships: [];
      };
      support_tickets: {
        Row: {
          id: string;
          booking_id: string | null;
          ticket_type: string;
          status: "open" | "resolved" | "closed";
          notes: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          ticket_type: string;
          status?: "open" | "resolved" | "closed";
          notes?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          booking_id?: string | null;
          ticket_type?: string;
          status?: "open" | "resolved" | "closed";
          notes?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      care_setting: "self_care" | "opd_24_72h" | "urgent_today" | "er_now";
      department_bucket:
        | "general_medicine"
        | "ent"
        | "ortho"
        | "derm"
        | "gyn"
        | "gastro"
        | "neuro"
        | "cardio"
        | "pulmo"
        | "pediatrics"
        | "other";
      brief_actor_type: "user" | "doctor" | "public_link" | "system";
      quickcheck_language: "english" | "hindi";
      quickcheck_booking_status: "booked" | "completed" | "no_show" | "rescheduled" | "cancelled";
    };
    CompositeTypes: Record<string, never>;
  };
};
