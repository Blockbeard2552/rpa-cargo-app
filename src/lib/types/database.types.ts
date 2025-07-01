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
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          note: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          note?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          note?: string | null
        }
        Relationships: []
      }
      models: {
        Row: {
          axle: string
          axle_value: number
          created_at: string
          mfg_base_cost: number | null
          mfg_total_cost: number
          mfg_surcharge: number | null
          height: string
          hitch: string | null
          id: string
          length: number
          standard_axle: string
          standard_axle_load: string
          standard_exterior_walls: string
          standard_jack: string
          standard_mainframe: string
          standard_tires: string
          starting_price: number | null
          width: number
        }
        Insert: {
          axle: string
          axle_value: number
          created_at?: string
          mfg_base_cost?: number | null
          mfg_total_cost: number
          mfg_surcharge?: number | null
          height: string
          hitch?: string | null
          id?: string
          length: number
          standard_axle: string
          standard_axle_load: string
          standard_exterior_walls: string
          standard_jack: string
          standard_mainframe: string
          standard_tires: string
          starting_price?: number | null
          width: number
        }
        Update: {
          axle?: string
          axle_value?: number
          created_at?: string
          mfg_base_cost?: number | null
          mfg_total_cost?: number
          mfg_surcharge?: number | null
          height?: string
          hitch?: string | null
          id?: string
          length?: number
          standard_axle?: string
          standard_axle_load?: string
          standard_exterior_walls?: string
          standard_jack?: string
          standard_mainframe?: string
          standard_tires?: string
          starting_price?: number | null
          width?: number
        }
        Relationships: []
      }
      options: {
        Row: {
          color_options: string[] | null
          cost: string
          cost_mod: string | null
          created_at: string
          for_axle_load: string | null
          for_axle_value: number | null
          for_lengths: number[] | null
          for_mainframe: string | null
          for_widths: number[] | null
          hitch: string | null
          id: number
          include_height: boolean | null
          include_location: boolean | null
          include_width: boolean | null
          must_include: string | null
          must_upgrade: string | null
          name: string
          note: string | null
          subcategory_id: string
        }
        Insert: {
          color_options?: string[] | null
          cost: string
          cost_mod?: string | null
          created_at?: string
          for_axle_load?: string | null
          for_axle_value?: number | null
          for_lengths?: number[] | null
          for_mainframe?: string | null
          for_widths?: number[] | null
          hitch?: string | null
          id?: number
          include_height?: boolean | null
          include_location?: boolean | null
          include_width?: boolean | null
          must_include?: string | null
          must_upgrade?: string | null
          name: string
          note?: string | null
          subcategory_id?: string
        }
        Update: {
          color_options?: string[] | null
          cost?: string
          cost_mod?: string | null
          created_at?: string
          for_axle_load?: string | null
          for_axle_value?: number | null
          for_lengths?: number[] | null
          for_mainframe?: string | null
          for_widths?: number[] | null
          hitch?: string | null
          id?: number
          include_height?: boolean | null
          include_location?: boolean | null
          include_width?: boolean | null
          must_include?: string | null
          must_upgrade?: string | null
          name?: string
          note?: string | null
          subcategory_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "options_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          delivery_charge: number | null
          id: number
          model: string
          options: string | null
          order_closed_on: string | null
          sales_tax: number | null
          started_processing_on: string | null
          sub_total: number
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_charge?: number | null
          id?: number
          model: string
          options?: string | null
          order_closed_on?: string | null
          sales_tax?: number | null
          started_processing_on?: string | null
          sub_total: number
          total: number
          user_id?: string
        }
        Update: {
          created_at?: string
          delivery_charge?: number | null
          id?: number
          model?: string
          options?: string | null
          order_closed_on?: string | null
          sales_tax?: number | null
          started_processing_on?: string | null
          sub_total?: number
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          multiple: boolean
          name: string
        }
        Insert: {
          category_id?: string
          created_at?: string
          id?: string
          multiple: boolean
          name: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          multiple?: boolean
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_names: {
        Row: {
          created_at: string
          id: number
          name: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
          user_id?: string | null
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
