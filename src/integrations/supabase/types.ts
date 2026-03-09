export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      contact_settings: {
        Row: {
          form_enabled: boolean
          id: string
          notification_email: string | null
          page_description: string | null
          page_title: string
          success_message: string | null
          updated_at: string
        }
        Insert: {
          form_enabled?: boolean
          id?: string
          notification_email?: string | null
          page_description?: string | null
          page_title?: string
          success_message?: string | null
          updated_at?: string
        }
        Update: {
          form_enabled?: boolean
          id?: string
          notification_email?: string | null
          page_description?: string | null
          page_title?: string
          success_message?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          email: string
          id: string
          message: string
          name: string
          subject: string | null
          submitted_at: string
        }
        Insert: {
          email: string
          id?: string
          message: string
          name: string
          subject?: string | null
          submitted_at?: string
        }
        Update: {
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string | null
          submitted_at?: string
        }
        Relationships: []
      }
      booking_requests: {
        Row: {
          id: string
          client_name: string
          client_email: string
          client_phone: string | null
          company_organization: string | null
          event_type: string
          event_date: string | null
          event_location: string | null
          event_duration: string | null
          estimated_audience_size: string | null
          talent_requested: string | null
          budget_range: string | null
          additional_details: string | null
          status: string
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_name: string
          client_email: string
          client_phone?: string | null
          company_organization?: string | null
          event_type: string
          event_date?: string | null
          event_location?: string | null
          event_duration?: string | null
          estimated_audience_size?: string | null
          talent_requested?: string | null
          budget_range?: string | null
          additional_details?: string | null
          status?: string
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_name?: string
          client_email?: string
          client_phone?: string | null
          company_organization?: string | null
          event_type?: string
          event_date?: string | null
          event_location?: string | null
          event_duration?: string | null
          estimated_audience_size?: string | null
          talent_requested?: string | null
          budget_range?: string | null
          additional_details?: string | null
          status?: string
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      home_content: {
        Row: {
          about_description: string | null
          about_title: string | null
          countdown_enabled: boolean
          cta_offset_top: string | null
          cta_primary_text: string | null
          cta_primary_url: string | null
          cta_secondary_text: string | null
          cta_secondary_url: string | null
          featured_content_description: string | null
          featured_content_title: string | null
          hero_image_url: string | null
          hero_mode: string | null
          hero_subtitle: string | null
          hero_subtitle_image_url: string | null
          hero_text_visible: boolean
          hero_title: string
          hero_video_url: string | null
          id: string
          updated_at: string
        }
        Insert: {
          about_description?: string | null
          about_title?: string | null
          countdown_enabled?: boolean
          cta_offset_top?: string | null
          cta_primary_text?: string | null
          cta_primary_url?: string | null
          cta_secondary_text?: string | null
          cta_secondary_url?: string | null
          featured_content_description?: string | null
          featured_content_title?: string | null
          hero_image_url?: string | null
          hero_mode?: string | null
          hero_subtitle?: string | null
          hero_subtitle_image_url?: string | null
          hero_text_visible?: boolean
          hero_title?: string
          hero_video_url?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          about_description?: string | null
          about_title?: string | null
          countdown_enabled?: boolean
          cta_offset_top?: string | null
          cta_primary_text?: string | null
          cta_primary_url?: string | null
          cta_secondary_text?: string | null
          cta_secondary_url?: string | null
          featured_content_description?: string | null
          featured_content_title?: string | null
          hero_image_url?: string | null
          hero_mode?: string | null
          hero_subtitle?: string | null
          hero_subtitle_image_url?: string | null
          hero_text_visible?: boolean
          hero_title?: string
          hero_video_url?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_library: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          height: number | null
          id: string
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          height?: number | null
          id?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          height?: number | null
          id?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      navigation_items: {
        Row: {
          created_at: string
          id: string
          is_external: boolean
          label: string
          sort_order: number
          url: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          is_external?: boolean
          label: string
          sort_order?: number
          url: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          is_external?: boolean
          label?: string
          sort_order?: number
          url?: string
          visible?: boolean
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          contact_address: string | null
          contact_email: string | null
          contact_phone: string | null
          discord_url: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          site_description: string | null
          site_name: string
          theme: string
          tiktok_url: string | null
          twitter_url: string | null
          updated_at: string
        }
        Insert: {
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          discord_url?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          site_description?: string | null
          site_name?: string
          theme?: string
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
        }
        Update: {
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          discord_url?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          site_description?: string | null
          site_name?: string
          theme?: string
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      talents: {
        Row: {
          bio: string | null
          created_at: string
          featured: boolean
          headshot_url: string | null
          id: string
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          featured?: boolean
          headshot_url?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          featured?: boolean
          headshot_url?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      talent_images: {
        Row: {
          caption: string | null
          id: string
          image_url: string
          sort_order: number
          talent_id: string
        }
        Insert: {
          caption?: string | null
          id?: string
          image_url: string
          sort_order?: number
          talent_id: string
        }
        Update: {
          caption?: string | null
          id?: string
          image_url?: string
          sort_order?: number
          talent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_images_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "talents"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_roles: {
        Row: {
          bg_image_url: string | null
          character_name: string
          id: string
          image_url: string | null
          role_name: string
          role_type: string
          show_color: string | null
          talent_id: string
        }
        Insert: {
          bg_image_url?: string | null
          character_name: string
          id?: string
          image_url?: string | null
          role_name: string
          role_type?: string
          talent_id: string
          show_color?: string | null
        }
        Update: {
          bg_image_url?: string | null
          character_name?: string
          id?: string
          image_url?: string | null
          role_name?: string
          role_type?: string
          show_color?: string | null
          talent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_roles_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "talents"
            referencedColumns: ["id"]
          },
        ]
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
          role?: Database["public"]["Enums"]["app_role"]
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
      upcoming_events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string | null
          event_time: string | null
          event_schedule: Json | null
          id: string
          image_url: string | null
          link_url: string | null
          location: string | null
          sort_order: number
          title: string
          updated_at: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date?: string | null
          event_time?: string | null
          event_schedule?: Json | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          location?: string | null
          sort_order?: number
          title: string
          updated_at?: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string | null
          event_time?: string | null
          event_schedule?: Json | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          location?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      about_content: {
        Row: {
          id: string
          page_title: string
          page_description: string | null
          hero_image_url: string | null
          sections: Json | null
          updated_at: string
        }
        Insert: {
          id?: string
          page_title?: string
          page_description?: string | null
          hero_image_url?: string | null
          sections?: Json | null
          updated_at?: string
        }
        Update: {
          id?: string
          page_title?: string
          page_description?: string | null
          hero_image_url?: string | null
          sections?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      book_content: {
        Row: {
          id: string
          page_title: string
          page_description: string | null
          hero_image_url: string | null
          sections: Json | null
          updated_at: string
        }
        Insert: {
          id?: string
          page_title?: string
          page_description?: string | null
          hero_image_url?: string | null
          sections?: Json | null
          updated_at?: string
        }
        Update: {
          id?: string
          page_title?: string
          page_description?: string | null
          hero_image_url?: string | null
          sections?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      ui_effect_overrides: {
        Row: {
          effect_id: string
          props: Json | null
          updated_at: string
        }
        Insert: {
          effect_id: string
          props?: Json | null
          updated_at?: string
        }
        Update: {
          effect_id?: string
          props?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      admin_profiles: {
        Row: {
          user_id: string
          first_name: string
          last_name: string
          email: string
          display_password: string
          is_super_admin: boolean
          created_at: string
        }
        Insert: {
          user_id: string
          first_name: string
          last_name: string
          email: string
          display_password: string
          is_super_admin?: boolean
          created_at?: string
        }
        Update: {
          user_id?: string
          first_name?: string
          last_name?: string
          email?: string
          display_password?: string
          is_super_admin?: boolean
          created_at?: string
        }
        Relationships: []
      }
      contact_attachments: {
        Row: {
          id: string
          submission_type: string
          submission_id: string
          file_name: string
          file_size: number
          file_type: string | null
          storage_path: string
          public_url: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          submission_type: string
          submission_id: string
          file_name: string
          file_size: number
          file_type?: string | null
          storage_path: string
          public_url: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          submission_type?: string
          submission_id?: string
          file_name?: string
          file_size?: number
          file_type?: string | null
          storage_path?: string
          public_url?: string
          uploaded_at?: string
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      create_admin_user: {
        Args: {
          _email: string
          _password: string
          _first_name: string
          _last_name: string
        }
        Returns: string
      }
      update_admin_profile: {
        Args: {
          _target_user_id: string
          _first_name: string
          _last_name: string
        }
        Returns: void
      }
      update_admin_password: {
        Args: {
          _target_user_id: string
          _new_password: string
        }
        Returns: void
      }
      delete_admin_user: {
        Args: {
          _target_user_id: string
        }
        Returns: void
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = Database[Extract<keyof DatabaseWithoutInternals, string>]

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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
