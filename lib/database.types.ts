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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      folder_items: {
        Row: {
          created_at: string
          folder_id: string
          item_id: string
          position: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          folder_id: string
          item_id: string
          position?: number | null
          user_id?: string
        }
        Update: {
          created_at?: string
          folder_id?: string
          item_id?: string
          position?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "folder_items_folder_fkey"
            columns: ["folder_id", "user_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "folder_items_item_fkey"
            columns: ["item_id", "user_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      folders: {
        Row: {
          cover_item_id: string | null
          cover_path: string | null
          created_at: string
          id: string
          is_hidden: boolean
          name: string
          parent_id: string | null
          position: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_item_id?: string | null
          cover_path?: string | null
          created_at?: string
          id?: string
          is_hidden?: boolean
          name: string
          parent_id?: string | null
          position?: number | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          cover_item_id?: string | null
          cover_path?: string | null
          created_at?: string
          id?: string
          is_hidden?: boolean
          name?: string
          parent_id?: string | null
          position?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "folders_cover_item_fkey"
            columns: ["cover_item_id", "user_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "folders_parent_fkey"
            columns: ["parent_id", "user_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      item_photos: {
        Row: {
          created_at: string
          id: string
          is_hero: boolean
          item_id: string
          position: number
          storage_path: string
          thumb_path: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_hero?: boolean
          item_id: string
          position?: number
          storage_path: string
          thumb_path?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_hero?: boolean
          item_id?: string
          position?: number
          storage_path?: string
          thumb_path?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_photos_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          acquired_from: string | null
          acquired_month: number | null
          acquired_year: number | null
          archived_month: number | null
          archived_year: number | null
          asking_price: number | null
          brand: string | null
          category: string | null
          colour: string | null
          colour_hex: string | null
          condition: string | null
          created_at: string
          for_sale: boolean
          id: string
          is_hidden: boolean
          left_via: string | null
          material: string | null
          measurements: Json
          name: string | null
          notes: string | null
          price: number | null
          sale_note: string | null
          size_label: string | null
          sort_position: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          acquired_from?: string | null
          acquired_month?: number | null
          acquired_year?: number | null
          archived_month?: number | null
          archived_year?: number | null
          asking_price?: number | null
          brand?: string | null
          category?: string | null
          colour?: string | null
          colour_hex?: string | null
          condition?: string | null
          created_at?: string
          for_sale?: boolean
          id?: string
          is_hidden?: boolean
          left_via?: string | null
          material?: string | null
          measurements?: Json
          name?: string | null
          notes?: string | null
          price?: number | null
          sale_note?: string | null
          size_label?: string | null
          sort_position?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          acquired_from?: string | null
          acquired_month?: number | null
          acquired_year?: number | null
          archived_month?: number | null
          archived_year?: number | null
          asking_price?: number | null
          brand?: string | null
          category?: string | null
          colour?: string | null
          colour_hex?: string | null
          condition?: string | null
          created_at?: string
          for_sale?: boolean
          id?: string
          is_hidden?: boolean
          left_via?: string | null
          material?: string | null
          measurements?: Json
          name?: string | null
          notes?: string | null
          price?: number | null
          sale_note?: string | null
          size_label?: string | null
          sort_position?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      look_items: {
        Row: {
          created_at: string
          item_id: string
          layer: number
          look_id: string
          rotation: number
          user_id: string
          width: number
          x: number
          y: number
        }
        Insert: {
          created_at?: string
          item_id: string
          layer?: number
          look_id: string
          rotation?: number
          user_id?: string
          width: number
          x: number
          y: number
        }
        Update: {
          created_at?: string
          item_id?: string
          layer?: number
          look_id?: string
          rotation?: number
          user_id?: string
          width?: number
          x?: number
          y?: number
        }
        Relationships: [
          {
            foreignKeyName: "look_items_item_fkey"
            columns: ["item_id", "user_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "look_items_look_fkey"
            columns: ["look_id", "user_id"]
            isOneToOne: false
            referencedRelation: "looks"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      looks: {
        Row: {
          created_at: string
          id: string
          is_hidden: boolean
          name: string
          note: string | null
          position: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_hidden?: boolean
          name: string
          note?: string | null
          position?: number | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_hidden?: boolean
          name?: string
          note?: string | null
          position?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          closet_categories: string[] | null
          created_at: string
          for_sale_only: boolean
          id: string
          is_public: boolean
          measurement_unit: string
          onboarding_step: number
          sale_contact: string | null
          updated_at: string
          username: string | null
          usual_sizes: Json
        }
        Insert: {
          closet_categories?: string[] | null
          created_at?: string
          for_sale_only?: boolean
          id?: string
          is_public?: boolean
          measurement_unit?: string
          onboarding_step?: number
          sale_contact?: string | null
          updated_at?: string
          username?: string | null
          usual_sizes?: Json
        }
        Update: {
          closet_categories?: string[] | null
          created_at?: string
          for_sale_only?: boolean
          id?: string
          is_public?: boolean
          measurement_unit?: string
          onboarding_step?: number
          sale_contact?: string | null
          updated_at?: string
          username?: string | null
          usual_sizes?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      arrange_folder: {
        Args: { p_folder_id: string; p_item_ids: string[] }
        Returns: undefined
      }
      arrange_items: { Args: { p_item_ids: string[] }; Returns: undefined }
      is_public_photo: { Args: { p_path: string }; Returns: boolean }
      public_folders: {
        Args: { p_username: string }
        Returns: {
          cover_item_id: string
          cover_path: string
          created_at: string
          id: string
          items: Json
          name: string
          parent_id: string
          position: number
        }[]
      }
      public_items: {
        Args: { p_username: string }
        Returns: {
          acquired_month: number
          acquired_year: number
          asking_price: number
          brand: string
          category: string
          colour: string
          colour_hex: string
          condition: string
          created_at: string
          for_sale: boolean
          id: string
          is_archived: boolean
          material: string
          measurements: Json
          name: string
          photos: Json
          sale_note: string
          size_label: string
          sort_position: number
        }[]
      }
      public_looks: {
        Args: { p_username: string }
        Returns: {
          created_at: string
          id: string
          name: string
          note: string
          pieces: Json
          position: number
        }[]
      }
      public_owner: { Args: { p_username: string }; Returns: string }
      public_profile: {
        Args: { p_username: string }
        Returns: {
          closet_name: string
          for_sale_only: boolean
          sale_contact: string
          username: string
        }[]
      }
      reorder_item_photos: {
        Args: { p_item_id: string; p_photo_ids: string[] }
        Returns: undefined
      }
      save_look_board: {
        Args: { p_look_id: string; p_pieces: Json }
        Returns: undefined
      }
      username_available: { Args: { p_username: string }; Returns: boolean }
      visible_folder_ids: { Args: { p_owner: string }; Returns: string[] }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
