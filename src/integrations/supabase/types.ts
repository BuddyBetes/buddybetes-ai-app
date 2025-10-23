export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_activity_logs: {
        Row: {
          action: string
          admin_user_id: string
          id: string
          ip_address: unknown
          metadata: Json | null
          resource: string | null
          timestamp: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource?: string | null
          timestamp?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource?: string | null
          timestamp?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      assistant_conversations: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      assistant_messages: {
        Row: {
          content: string
          conversation_id: string
          id: string
          message_type: string
          nutritional_info: Json | null
          timestamp: string
        }
        Insert: {
          content: string
          conversation_id: string
          id?: string
          message_type: string
          nutritional_info?: Json | null
          timestamp?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          id?: string
          message_type?: string
          nutritional_info?: Json | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistant_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "assistant_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_active_users: {
        Row: {
          avg_session_duration: unknown
          created_at: string
          date: string
          id: string
          new_users: number
          returning_users: number
          total_active_users: number
          total_sessions: number
          updated_at: string
        }
        Insert: {
          avg_session_duration?: unknown
          created_at?: string
          date: string
          id?: string
          new_users?: number
          returning_users?: number
          total_active_users?: number
          total_sessions?: number
          updated_at?: string
        }
        Update: {
          avg_session_duration?: unknown
          created_at?: string
          date?: string
          id?: string
          new_users?: number
          returning_users?: number
          total_active_users?: number
          total_sessions?: number
          updated_at?: string
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string
          current_uses: number
          discount_percentage: number
          duration_days: number | null
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number
          discount_percentage: number
          duration_days?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number
          discount_percentage?: number
          duration_days?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      discount_redemptions: {
        Row: {
          discount_code_id: string
          id: string
          redeemed_at: string
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          discount_code_id: string
          id?: string
          redeemed_at?: string
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          discount_code_id?: string
          id?: string
          redeemed_at?: string
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discount_redemptions_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_redemptions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      email_analytics: {
        Row: {
          campaign_id: string | null
          clicked_at: string | null
          created_at: string | null
          email_log_id: string | null
          id: string
          opened_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          clicked_at?: string | null
          created_at?: string | null
          email_log_id?: string | null
          id?: string
          opened_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          clicked_at?: string | null
          created_at?: string | null
          email_log_id?: string | null
          id?: string
          opened_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_analytics_email_log_id_fkey"
            columns: ["email_log_id"]
            isOneToOne: false
            referencedRelation: "email_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaign_recipients: {
        Row: {
          campaign_id: string
          created_at: string | null
          email: string
          error_message: string | null
          id: string
          resend_message_id: string | null
          sent_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          email: string
          error_message?: string | null
          id?: string
          resend_message_id?: string | null
          sent_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          email?: string
          error_message?: string | null
          id?: string
          resend_message_id?: string | null
          sent_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          campaign_name: string
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          email_type: string | null
          failed_count: number | null
          id: string
          metadata: Json | null
          recipient_count: number | null
          scheduled_for: string | null
          sent_count: number | null
          started_at: string | null
          status: string | null
          subject: string
          template_html: string
          updated_at: string | null
        }
        Insert: {
          campaign_name: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          email_type?: string | null
          failed_count?: number | null
          id?: string
          metadata?: Json | null
          recipient_count?: number | null
          scheduled_for?: string | null
          sent_count?: number | null
          started_at?: string | null
          status?: string | null
          subject: string
          template_html: string
          updated_at?: string | null
        }
        Update: {
          campaign_name?: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          email_type?: string | null
          failed_count?: number | null
          id?: string
          metadata?: Json | null
          recipient_count?: number | null
          scheduled_for?: string | null
          sent_count?: number | null
          started_at?: string | null
          status?: string | null
          subject?: string
          template_html?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          clicked_at: string | null
          email_type: string
          error_message: string | null
          id: string
          metadata: Json | null
          opened_at: string | null
          recipient_email: string
          resend_message_id: string | null
          sent_at: string | null
          status: string
          subject: string
          user_id: string | null
        }
        Insert: {
          clicked_at?: string | null
          email_type: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipient_email: string
          resend_message_id?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          user_id?: string | null
        }
        Update: {
          clicked_at?: string | null
          email_type?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipient_email?: string
          resend_message_id?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          user_id?: string | null
        }
        Relationships: []
      }
      email_queue: {
        Row: {
          attempts: number | null
          created_at: string | null
          email_type: string
          error_message: string | null
          id: string
          max_attempts: number | null
          payload: Json
          recipient_email: string
          scheduled_at: string | null
          sent_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          email_type: string
          error_message?: string | null
          id?: string
          max_attempts?: number | null
          payload: Json
          recipient_email: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          email_type?: string
          error_message?: string | null
          id?: string
          max_attempts?: number | null
          payload?: Json
          recipient_email?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_unsubscribes: {
        Row: {
          email: string
          id: string
          reason: string | null
          unsubscribed_at: string | null
          user_id: string | null
        }
        Insert: {
          email: string
          id?: string
          reason?: string | null
          unsubscribed_at?: string | null
          user_id?: string | null
        }
        Update: {
          email?: string
          id?: string
          reason?: string | null
          unsubscribed_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          checked_in: boolean
          checked_in_at: string | null
          created_at: string
          email: string
          email_sent: boolean
          event_id: string
          first_name: string
          id: string
          last_name: string
          qr_code: string
          registration_type: string
          user_id: string | null
        }
        Insert: {
          checked_in?: boolean
          checked_in_at?: string | null
          created_at?: string
          email: string
          email_sent?: boolean
          event_id: string
          first_name: string
          id?: string
          last_name: string
          qr_code: string
          registration_type: string
          user_id?: string | null
        }
        Update: {
          checked_in?: boolean
          checked_in_at?: string | null
          created_at?: string
          email?: string
          email_sent?: boolean
          event_id?: string
          first_name?: string
          id?: string
          last_name?: string
          qr_code?: string
          registration_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          badge: string | null
          color_gradient: string | null
          created_at: string
          description: string
          event_date: string | null
          id: string
          image_url: string | null
          is_active: boolean
          location: string | null
          max_attendees: number | null
          subtitle: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          badge?: string | null
          color_gradient?: string | null
          created_at?: string
          description: string
          event_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string | null
          max_attendees?: number | null
          subtitle?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          badge?: string | null
          color_gradient?: string | null
          created_at?: string
          description?: string
          event_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string | null
          max_attendees?: number | null
          subtitle?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      glucose_logs: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string
          exercise: string | null
          fat: number | null
          food: string | null
          glucose_level: number | null
          glucose_measurement_method: string | null
          id: string
          meal_context: string | null
          medication: string | null
          notes: string | null
          protein: number | null
          timestamp: string
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          exercise?: string | null
          fat?: number | null
          food?: string | null
          glucose_level?: number | null
          glucose_measurement_method?: string | null
          id?: string
          meal_context?: string | null
          medication?: string | null
          notes?: string | null
          protein?: number | null
          timestamp?: string
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          exercise?: string | null
          fat?: number | null
          food?: string | null
          glucose_level?: number | null
          glucose_measurement_method?: string | null
          id?: string
          meal_context?: string | null
          medication?: string | null
          notes?: string | null
          protein?: number | null
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      health_data: {
        Row: {
          age: string | null
          birthdate: string | null
          completed_onboarding: boolean | null
          created_at: string | null
          diabetes_type: string | null
          gender: string | null
          glucose_unit: string | null
          height: string | null
          height_unit: string | null
          id: string
          updated_at: string | null
          user_id: string
          weight: string | null
          weight_unit: string | null
        }
        Insert: {
          age?: string | null
          birthdate?: string | null
          completed_onboarding?: boolean | null
          created_at?: string | null
          diabetes_type?: string | null
          gender?: string | null
          glucose_unit?: string | null
          height?: string | null
          height_unit?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          weight?: string | null
          weight_unit?: string | null
        }
        Update: {
          age?: string | null
          birthdate?: string | null
          completed_onboarding?: boolean | null
          created_at?: string | null
          diabetes_type?: string | null
          gender?: string | null
          glucose_unit?: string | null
          height?: string | null
          height_unit?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          weight?: string | null
          weight_unit?: string | null
        }
        Relationships: []
      }
      payment_receipts: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_method: string
          receipt_url: string
          reference_number: string | null
          rejection_reason: string | null
          subscription_id: string
          user_id: string
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_method: string
          receipt_url: string
          reference_number?: string | null
          rejection_reason?: string | null
          subscription_id: string
          user_id: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_method?: string
          receipt_url?: string
          reference_number?: string | null
          rejection_reason?: string | null
          subscription_id?: string
          user_id?: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_receipts_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_accounts: {
        Row: {
          created_at: string
          email: string
          event_registration_id: string | null
          expires_at: string
          first_name: string
          id: string
          last_name: string
          verification_token: string
        }
        Insert: {
          created_at?: string
          email: string
          event_registration_id?: string | null
          expires_at: string
          first_name: string
          id?: string
          last_name: string
          verification_token: string
        }
        Update: {
          created_at?: string
          email?: string
          event_registration_id?: string | null
          expires_at?: string
          first_name?: string
          id?: string
          last_name?: string
          verification_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_accounts_event_registration_id_fkey"
            columns: ["event_registration_id"]
            isOneToOne: false
            referencedRelation: "event_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_tiers: {
        Row: {
          created_at: string
          duration_days: number | null
          features: Json
          id: string
          is_active: boolean
          name: string
          price: number
          stripe_price_id: string | null
          stripe_price_id_discounted: string | null
        }
        Insert: {
          created_at?: string
          duration_days?: number | null
          features?: Json
          id?: string
          is_active?: boolean
          name: string
          price: number
          stripe_price_id?: string | null
          stripe_price_id_discounted?: string | null
        }
        Update: {
          created_at?: string
          duration_days?: number | null
          features?: Json
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          stripe_price_id?: string | null
          stripe_price_id_discounted?: string | null
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          action_target: string
          action_type: string
          id: string
          metadata: Json | null
          session_id: string | null
          timestamp: string
          user_id: string
        }
        Insert: {
          action_target: string
          action_type: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          timestamp?: string
          user_id: string
        }
        Update: {
          action_target?: string
          action_type?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          scheduled_for: string | null
          title: string
          trigger_condition: Json | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          scheduled_for?: string | null
          title: string
          trigger_condition?: Json | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          scheduled_for?: string | null
          title?: string
          trigger_condition?: Json | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_retention_cohorts: {
        Row: {
          created_at: string
          day_1_return: boolean | null
          day_30_return: boolean | null
          day_7_return: boolean | null
          id: string
          last_activity_date: string | null
          signup_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_1_return?: boolean | null
          day_30_return?: boolean | null
          day_7_return?: boolean | null
          id?: string
          last_activity_date?: string | null
          signup_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_1_return?: boolean | null
          day_30_return?: boolean | null
          day_7_return?: boolean | null
          id?: string
          last_activity_date?: string | null
          signup_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          browser: string | null
          created_at: string
          device_type: string | null
          id: string
          ip_address: unknown
          session_end: string | null
          session_start: string
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: unknown
          session_end?: string | null
          session_start?: string
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: unknown
          session_end?: string | null
          session_start?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          amount_paid: number | null
          created_at: string
          expires_at: string | null
          id: string
          payment_method: string | null
          starts_at: string | null
          status: string
          tier_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          payment_method?: string | null
          starts_at?: string | null
          status: string
          tier_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          payment_method?: string | null
          starts_at?: string | null
          status?: string
          tier_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      backfill_analytics_data: { Args: never; Returns: undefined }
      get_analytics_retention_data: { Args: never; Returns: Json }
      get_cohort_retention_data: {
        Args: never
        Returns: {
          cohort_week: string
          day_1_retention: number
          day_30_retention: number
          day_7_retention: number
          signup_count: number
        }[]
      }
      get_monthly_active_users: {
        Args: never
        Returns: {
          growth_percentage: number
          month: string
          total_users: number
        }[]
      }
      get_user_lifecycle_distribution: {
        Args: never
        Returns: {
          active_users: number
          at_risk_users: number
          churned_users: number
          new_users: number
        }[]
      }
      has_active_subscription: { Args: { _user_id: string }; Returns: boolean }
      has_feature_access: {
        Args: { _feature: string; _user_id: string }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      update_daily_active_users: { Args: never; Returns: undefined }
      update_daily_active_users_enhanced: { Args: never; Returns: undefined }
      update_retention_cohorts: { Args: never; Returns: undefined }
    }
    Enums: {
      user_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "user"],
    },
  },
} as const
