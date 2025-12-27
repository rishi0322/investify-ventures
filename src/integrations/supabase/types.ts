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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_recommendations: {
        Row: {
          created_at: string
          id: string
          match_score: number
          reasoning: string | null
          startup_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_score: number
          reasoning?: string | null
          startup_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_score?: number
          reasoning?: string | null
          startup_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_recommendations_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      blockchain_transactions: {
        Row: {
          amount: number
          confirmed_at: string | null
          created_at: string
          crypto_currency: string
          id: string
          startup_id: string | null
          status: string
          transaction_hash: string | null
          transaction_type: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          amount: number
          confirmed_at?: string | null
          created_at?: string
          crypto_currency?: string
          id?: string
          startup_id?: string | null
          status?: string
          transaction_hash?: string | null
          transaction_type: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          amount?: number
          confirmed_at?: string | null
          created_at?: string
          crypto_currency?: string
          id?: string
          startup_id?: string | null
          status?: string
          transaction_hash?: string | null
          transaction_type?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blockchain_transactions_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          amount: number
          created_at: string
          id: string
          investor_id: string
          startup_id: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          investor_id: string
          startup_id: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          investor_id?: string
          startup_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          receiver_id: string
          sender_id: string
          startup_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          receiver_id: string
          sender_id: string
          startup_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          receiver_id?: string
          sender_id?: string
          startup_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      startups: {
        Row: {
          amount_raised: number
          created_at: string
          description: string
          founded_year: number | null
          founder_id: string
          funding_goal: number
          funding_stage: Database["public"]["Enums"]["funding_stage"]
          id: string
          location: string | null
          logo_url: string | null
          min_investment: number
          name: string
          pitch_deck_url: string | null
          pitch_video_url: string | null
          rejection_reason: string | null
          sector: Database["public"]["Enums"]["startup_sector"]
          tagline: string
          team_size: number | null
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
          verified_at: string | null
          verified_by: string | null
          website_url: string | null
        }
        Insert: {
          amount_raised?: number
          created_at?: string
          description: string
          founded_year?: number | null
          founder_id: string
          funding_goal: number
          funding_stage?: Database["public"]["Enums"]["funding_stage"]
          id?: string
          location?: string | null
          logo_url?: string | null
          min_investment?: number
          name: string
          pitch_deck_url?: string | null
          pitch_video_url?: string | null
          rejection_reason?: string | null
          sector: Database["public"]["Enums"]["startup_sector"]
          tagline: string
          team_size?: number | null
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
          verified_by?: string | null
          website_url?: string | null
        }
        Update: {
          amount_raised?: number
          created_at?: string
          description?: string
          founded_year?: number | null
          founder_id?: string
          funding_goal?: number
          funding_stage?: Database["public"]["Enums"]["funding_stage"]
          id?: string
          location?: string | null
          logo_url?: string | null
          min_investment?: number
          name?: string
          pitch_deck_url?: string | null
          pitch_video_url?: string | null
          rejection_reason?: string | null
          sector?: Database["public"]["Enums"]["startup_sector"]
          tagline?: string
          team_size?: number | null
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
          verified_by?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      watchlist: {
        Row: {
          created_at: string
          id: string
          startup_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          startup_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          startup_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "investor" | "startup"
      funding_stage: "pre_seed" | "seed" | "series_a" | "series_b" | "series_c"
      startup_sector:
        | "technology"
        | "healthcare"
        | "fintech"
        | "edtech"
        | "ecommerce"
        | "green_energy"
        | "real_estate"
        | "consumer"
        | "manufacturing"
        | "agriculture"
        | "logistics"
        | "media_entertainment"
      verification_status: "pending" | "approved" | "rejected"
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
      app_role: ["admin", "investor", "startup"],
      funding_stage: ["pre_seed", "seed", "series_a", "series_b", "series_c"],
      startup_sector: [
        "technology",
        "healthcare",
        "fintech",
        "edtech",
        "ecommerce",
        "green_energy",
        "real_estate",
        "consumer",
        "manufacturing",
        "agriculture",
        "logistics",
        "media_entertainment",
      ],
      verification_status: ["pending", "approved", "rejected"],
    },
  },
} as const
