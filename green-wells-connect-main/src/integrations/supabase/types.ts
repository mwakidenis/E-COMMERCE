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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sender_type: string
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender_type: string
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender_type?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          language: string
          session_type: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string
          session_type?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          session_type?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      content_translations: {
        Row: {
          content_key: string
          content_type: string
          created_at: string
          id: string
          language: string
          translated_text: string
          updated_at: string
        }
        Insert: {
          content_key: string
          content_type: string
          created_at?: string
          id?: string
          language: string
          translated_text: string
          updated_at?: string
        }
        Update: {
          content_key?: string
          content_type?: string
          created_at?: string
          id?: string
          language?: string
          translated_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_feedback: {
        Row: {
          category: string
          comment: string | null
          created_at: string
          id: string
          order_id: string | null
          rating: number
          sentiment: string
          user_id: string
        }
        Insert: {
          category: string
          comment?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          rating: number
          sentiment: string
          user_id: string
        }
        Update: {
          category?: string
          comment?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          rating?: number
          sentiment?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_feedback_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_articles: {
        Row: {
          answer: string
          category: string
          created_at: string
          helpful_count: number
          id: string
          is_published: boolean
          language: string
          not_helpful_count: number
          question: string
          view_count: number
        }
        Insert: {
          answer: string
          category: string
          created_at?: string
          helpful_count?: number
          id?: string
          is_published?: boolean
          language?: string
          not_helpful_count?: number
          question: string
          view_count?: number
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          helpful_count?: number
          id?: string
          is_published?: boolean
          language?: string
          not_helpful_count?: number
          question?: string
          view_count?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_tracking: {
        Row: {
          created_at: string
          driver_latitude: number
          driver_longitude: number
          estimated_time: string | null
          id: string
          order_id: string
          status: string
        }
        Insert: {
          created_at?: string
          driver_latitude: number
          driver_longitude: number
          estimated_time?: string | null
          id?: string
          order_id: string
          status: string
        }
        Update: {
          created_at?: string
          driver_latitude?: number
          driver_longitude?: number
          estimated_time?: string | null
          id?: string
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          cylinder_size: string
          delivery_address: string
          delivery_status: string
          id: string
          latitude: number | null
          longitude: number | null
          mpesa_transaction_id: string | null
          payment_status: string
          preferred_time_slot: string | null
          total_cost: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cylinder_size: string
          delivery_address: string
          delivery_status?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          mpesa_transaction_id?: string | null
          payment_status?: string
          preferred_time_slot?: string | null
          total_cost: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          cylinder_size?: string
          delivery_address?: string
          delivery_status?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          mpesa_transaction_id?: string | null
          payment_status?: string
          preferred_time_slot?: string | null
          total_cost?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reward_redemptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          points_spent: number
          redeemed_at: string
          redemption_code: string
          reward_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          points_spent: number
          redeemed_at?: string
          redemption_code: string
          reward_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          points_spent?: number
          redeemed_at?: string
          redemption_code?: string
          reward_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          available_quantity: number
          category: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          name: string
          points_required: number
        }
        Insert: {
          available_quantity?: number
          category: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          name: string
          points_required: number
        }
        Update: {
          available_quantity?: number
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          name?: string
          points_required?: number
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          language: string
          priority: string
          status: string
          subject: string
          ticket_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          language?: string
          priority: string
          status?: string
          subject: string
          ticket_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          language?: string
          priority?: string
          status?: string
          subject?: string
          ticket_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_challenge_progress: {
        Row: {
          challenge_id: string
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          progress: number
          team_id: string
          updated_at: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          progress?: number
          team_id: string
          updated_at?: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          progress?: number
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "team_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_challenge_progress_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_challenges: {
        Row: {
          category: string
          created_at: string
          description: string
          end_date: string | null
          id: string
          is_active: boolean
          points: number
          start_date: string
          title: string
          total_required: number
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          points: number
          start_date?: string
          title: string
          total_required: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          points?: number
          start_date?: string
          title?: string
          total_required?: number
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          joined_at: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          avatar_url: string | null
          created_at: string
          creator_id: string
          description: string | null
          id: string
          member_count: number
          name: string
          total_points: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          member_count?: number
          name: string
          total_points?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          member_count?: number
          name?: string
          total_points?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_recommendations: {
        Row: {
          created_at: string
          description: string
          id: string
          priority: string
          recommendation_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          priority?: string
          recommendation_type: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          priority?: string
          recommendation_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      youth_challenges: {
        Row: {
          challenge_type: string
          completed: boolean
          created_at: string
          id: string
          progress: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_type: string
          completed?: boolean
          created_at?: string
          id?: string
          progress?: number
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_type?: string
          completed?: boolean
          created_at?: string
          id?: string
          progress?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      youth_user_stats: {
        Row: {
          badges: Json | null
          created_at: string
          id: string
          level: number
          points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          badges?: Json | null
          created_at?: string
          id?: string
          level?: number
          points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          badges?: Json | null
          created_at?: string
          id?: string
          level?: number
          points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_ticket_number: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
