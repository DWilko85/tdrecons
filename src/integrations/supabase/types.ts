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
      data_sources: {
        Row: {
          created_at: string
          data: Json
          fields: string[]
          id: string
          key_field: string
          name: string
          type: string
        }
        Insert: {
          created_at?: string
          data: Json
          fields: string[]
          id?: string
          key_field: string
          name: string
          type: string
        }
        Update: {
          created_at?: string
          data?: Json
          fields?: string[]
          id?: string
          key_field?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      field_mappings: {
        Row: {
          created_at: string
          file_a_id: string | null
          file_b_id: string | null
          id: string
          mapping: Json
          name: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          file_a_id?: string | null
          file_b_id?: string | null
          id?: string
          mapping: Json
          name?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          file_a_id?: string | null
          file_b_id?: string | null
          id?: string
          mapping?: Json
          name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "field_mappings_file_a_id_fkey"
            columns: ["file_a_id"]
            isOneToOne: false
            referencedRelation: "file_uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_mappings_file_b_id_fkey"
            columns: ["file_b_id"]
            isOneToOne: false
            referencedRelation: "file_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      file_uploads: {
        Row: {
          created_at: string
          data: Json
          file_name: string
          file_type: string
          headers: string[]
          id: string
          label: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          data: Json
          file_name: string
          file_type: string
          headers: string[]
          id?: string
          label?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          data?: Json
          file_name?: string
          file_type?: string
          headers?: string[]
          id?: string
          label?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      reconciliation_history: {
        Row: {
          created_at: string
          description: string | null
          different_records: number
          id: string
          matching_records: number
          missing_a_records: number
          missing_b_records: number
          name: string
          results: Json
          source_a_name: string
          source_b_name: string
          total_records: number
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          different_records: number
          id?: string
          matching_records: number
          missing_a_records: number
          missing_b_records: number
          name: string
          results: Json
          source_a_name: string
          source_b_name: string
          total_records: number
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          different_records?: number
          id?: string
          matching_records?: number
          missing_a_records?: number
          missing_b_records?: number
          name?: string
          results?: Json
          source_a_name?: string
          source_b_name?: string
          total_records?: number
          user_id?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          config: Json
          created_at: string
          description: string | null
          id: string
          name: string
          source_a_id: string | null
          source_b_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          config: Json
          created_at?: string
          description?: string | null
          id?: string
          name: string
          source_a_id?: string | null
          source_b_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          source_a_id?: string | null
          source_b_id?: string | null
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
      create_data_sources_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      initialize_data_sources_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
    Enums: {},
  },
} as const
