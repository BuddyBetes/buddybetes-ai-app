export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
          avg_session_duration: unknown | null
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
          avg_session_duration?: unknown | null
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
          avg_session_duration?: unknown | null
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
        }
        Insert: {
          created_at?: string
          duration_days?: number | null
          features?: Json
          id?: string
          is_active?: boolean
          name: string
          price: number
        }
        Update: {
          created_at?: string
          duration_days?: number | null
          features?: Json
          id?: string
          is_active?: boolean
          name?: string
          price?: number
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
          ip_address: unknown | null
          session_end: string | null
          session_start: string
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: unknown | null
          session_end?: string | null
          session_start?: string
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: unknown | null
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
      backfill_analytics_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_analytics_retention_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      has_active_subscription: {
        Args: { _user_id: string }
        Returns: boolean
      }
      has_feature_access: {
        Args: { _user_id: string; _feature: string }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      update_daily_active_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_daily_active_users_enhanced: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_retention_cohorts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      user_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
