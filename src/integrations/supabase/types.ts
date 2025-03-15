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
      ai_prompts: {
        Row: {
          created_at: string
          id: string
          prompt: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          prompt: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          prompt?: string
          type?: string
        }
        Relationships: []
      }
      appliances: {
        Row: {
          consumption: number | null
          created_at: string
          id: string
          is_on: boolean | null
          name: string
          status: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          consumption?: number | null
          created_at?: string
          id?: string
          is_on?: boolean | null
          name: string
          status?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          consumption?: number | null
          created_at?: string
          id?: string
          is_on?: boolean | null
          name?: string
          status?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      energy_history: {
        Row: {
          appliance_id: string | null
          consumption: number | null
          cost: number | null
          id: string
          recorded_at: string | null
          user_id: string
        }
        Insert: {
          appliance_id?: string | null
          consumption?: number | null
          cost?: number | null
          id?: string
          recorded_at?: string | null
          user_id: string
        }
        Update: {
          appliance_id?: string | null
          consumption?: number | null
          cost?: number | null
          id?: string
          recorded_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "energy_history_appliance_id_fkey"
            columns: ["appliance_id"]
            isOneToOne: false
            referencedRelation: "appliances"
            referencedColumns: ["id"]
          },
        ]
      }
      insights: {
        Row: {
          created_at: string
          description: string
          id: string
          impact: string | null
          title: string
          type: string
          user_id: string
          value: string | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          impact?: string | null
          title: string
          type: string
          user_id: string
          value?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          impact?: string | null
          title?: string
          type?: string
          user_id?: string
          value?: string | null
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          burn_after_reading: boolean | null
          content: string | null
          created_at: string
          id: string
          is_rant: boolean | null
          mood: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          burn_after_reading?: boolean | null
          content?: string | null
          created_at?: string
          id?: string
          is_rant?: boolean | null
          mood?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          burn_after_reading?: boolean | null
          content?: string | null
          created_at?: string
          id?: string
          is_rant?: boolean | null
          mood?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          metadata: Json | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          metadata?: Json | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          metadata?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      user_energy_data: {
        Row: {
          active_appliances: number | null
          created_at: string
          currency: string | null
          id: string
          metadata: Json | null
          monthly_bill: number | null
          rate_per_kwh: number | null
          total_consumption: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active_appliances?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          monthly_bill?: number | null
          rate_per_kwh?: number | null
          total_consumption?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active_appliances?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          monthly_bill?: number | null
          rate_per_kwh?: number | null
          total_consumption?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          daily_reminder_enabled: boolean | null
          dark_mode: boolean | null
          font_size: string | null
          notification_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_reminder_enabled?: boolean | null
          dark_mode?: boolean | null
          font_size?: string | null
          notification_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_reminder_enabled?: boolean | null
          dark_mode?: boolean | null
          font_size?: string | null
          notification_enabled?: boolean | null
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
