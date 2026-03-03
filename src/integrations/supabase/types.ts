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
      ledger_entries: {
        Row: {
          actor_id: string
          actor_name: string | null
          commission_paise: number
          created_at: string | null
          gross_paise: number
          id: string
          net_paise: number
          order_id: string
          role: string
          status: string
        }
        Insert: {
          actor_id: string
          actor_name?: string | null
          commission_paise: number
          created_at?: string | null
          gross_paise: number
          id?: string
          net_paise: number
          order_id: string
          role: string
          status?: string
        }
        Update: {
          actor_id?: string
          actor_name?: string | null
          commission_paise?: number
          created_at?: string | null
          gross_paise?: number
          id?: string
          net_paise?: number
          order_id?: string
          role?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_state_logs: {
        Row: {
          changed_by_name: string | null
          changed_by_user_id: string | null
          client_action_id: string | null
          id: string
          new_state: string
          order_id: string
          payload: Json | null
          previous_state: string | null
          timestamp: string | null
        }
        Insert: {
          changed_by_name?: string | null
          changed_by_user_id?: string | null
          client_action_id?: string | null
          id?: string
          new_state: string
          order_id: string
          payload?: Json | null
          previous_state?: string | null
          timestamp?: string | null
        }
        Update: {
          changed_by_name?: string | null
          changed_by_user_id?: string | null
          client_action_id?: string | null
          id?: string
          new_state?: string
          order_id?: string
          payload?: Json | null
          previous_state?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_state_logs_changed_by_user_id_fkey"
            columns: ["changed_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_state_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          assigned_logistics_id: string | null
          assigned_logistics_name: string | null
          assigned_processor_id: string | null
          assigned_processor_name: string | null
          assigned_producer_id: string | null
          assigned_producer_name: string | null
          commission_bps: number
          created_at: string | null
          id: string
          product_id: string | null
          product_name: string | null
          quantity: number
          retailer_id: string
          retailer_name: string | null
          status: string
          total_value_paise: number
          updated_at: string | null
        }
        Insert: {
          assigned_logistics_id?: string | null
          assigned_logistics_name?: string | null
          assigned_processor_id?: string | null
          assigned_processor_name?: string | null
          assigned_producer_id?: string | null
          assigned_producer_name?: string | null
          commission_bps?: number
          created_at?: string | null
          id?: string
          product_id?: string | null
          product_name?: string | null
          quantity: number
          retailer_id: string
          retailer_name?: string | null
          status?: string
          total_value_paise?: number
          updated_at?: string | null
        }
        Update: {
          assigned_logistics_id?: string | null
          assigned_logistics_name?: string | null
          assigned_processor_id?: string | null
          assigned_processor_name?: string | null
          assigned_producer_id?: string | null
          assigned_producer_name?: string | null
          commission_bps?: number
          created_at?: string | null
          id?: string
          product_id?: string | null
          product_name?: string | null
          quantity?: number
          retailer_id?: string
          retailer_name?: string | null
          status?: string
          total_value_paise?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_assigned_logistics_id_fkey"
            columns: ["assigned_logistics_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_assigned_processor_id_fkey"
            columns: ["assigned_processor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_assigned_producer_id_fkey"
            columns: ["assigned_producer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          category: string
          created_at: string | null
          description: string | null
          id: string
          unit: string
          variety: string
        }
        Insert: {
          active?: boolean | null
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          unit: string
          variety: string
        }
        Update: {
          active?: boolean | null
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          unit?: string
          variety?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          kyc_status: boolean | null
          name: string
          phone: string | null
          role: string
          subscription_status: boolean | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          kyc_status?: boolean | null
          name: string
          phone?: string | null
          role: string
          subscription_status?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          kyc_status?: boolean | null
          name?: string
          phone?: string | null
          role?: string
          subscription_status?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      transition_order: {
        Args: {
          p_client_action_id?: string
          p_next_status: string
          p_order_id: string
        }
        Returns: Json
      }
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
