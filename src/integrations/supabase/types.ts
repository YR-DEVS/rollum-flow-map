export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      app_profiles: {
        Row: {
          auth_date: number | null
          created_at: string | null
          first_name: string | null
          hash: string | null
          id: string
          last_name: string | null
          photo_url: string | null
          supabase_user_id: string | null
          telegram_id: string
          telegram_username: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          auth_date?: number | null
          created_at?: string | null
          first_name?: string | null
          hash?: string | null
          id?: string
          last_name?: string | null
          photo_url?: string | null
          supabase_user_id?: string | null
          telegram_id: string
          telegram_username?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          auth_date?: number | null
          created_at?: string | null
          first_name?: string | null
          hash?: string | null
          id?: string
          last_name?: string | null
          photo_url?: string | null
          supabase_user_id?: string | null
          telegram_id?: string
          telegram_username?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      forum_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      forum_replies: {
        Row: {
          app_user_id: string | null
          author_id: string | null
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          media_urls: string[] | null
          reply_to_id: string | null
          topic_id: string | null
          updated_at: string | null
        }
        Insert: {
          app_user_id?: string | null
          author_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          media_urls?: string[] | null
          reply_to_id?: string | null
          topic_id?: string | null
          updated_at?: string | null
        }
        Update: {
          app_user_id?: string | null
          author_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          media_urls?: string[] | null
          reply_to_id?: string | null
          topic_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_app_user_id_fkey"
            columns: ["app_user_id"]
            isOneToOne: false
            referencedRelation: "app_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_replies_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_replies_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_reply_likes: {
        Row: {
          app_user_id: string | null
          created_at: string | null
          id: string
          reply_id: string | null
          user_id: string | null
        }
        Insert: {
          app_user_id?: string | null
          created_at?: string | null
          id?: string
          reply_id?: string | null
          user_id?: string | null
        }
        Update: {
          app_user_id?: string | null
          created_at?: string | null
          id?: string
          reply_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_reply_likes_app_user_id_fkey"
            columns: ["app_user_id"]
            isOneToOne: false
            referencedRelation: "app_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_reply_likes_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topic_likes: {
        Row: {
          app_user_id: string | null
          created_at: string | null
          id: string
          topic_id: string | null
          user_id: string | null
        }
        Insert: {
          app_user_id?: string | null
          created_at?: string | null
          id?: string
          topic_id?: string | null
          user_id?: string | null
        }
        Update: {
          app_user_id?: string | null
          created_at?: string | null
          id?: string
          topic_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_topic_likes_app_user_id_fkey"
            columns: ["app_user_id"]
            isOneToOne: false
            referencedRelation: "app_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_topic_likes_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topics: {
        Row: {
          app_user_id: string | null
          author_id: string | null
          category_id: string | null
          content: string
          created_at: string | null
          id: string
          is_locked: boolean | null
          is_pinned: boolean | null
          likes_count: number | null
          media_urls: string[] | null
          replies_count: number | null
          route_id: string | null
          spot_id: string | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          app_user_id?: string | null
          author_id?: string | null
          category_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          replies_count?: number | null
          route_id?: string | null
          spot_id?: string | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          app_user_id?: string | null
          author_id?: string | null
          category_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          replies_count?: number | null
          route_id?: string | null
          spot_id?: string | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_topics_app_user_id_fkey"
            columns: ["app_user_id"]
            isOneToOne: false
            referencedRelation: "app_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_topics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_topics_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_topics_spot_id_fkey"
            columns: ["spot_id"]
            isOneToOne: false
            referencedRelation: "spots"
            referencedColumns: ["id"]
          },
        ]
      }
      route_comments: {
        Row: {
          app_user_id: string | null
          content: string
          created_at: string | null
          id: string
          media_urls: string[] | null
          route_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          app_user_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          media_urls?: string[] | null
          route_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          app_user_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          media_urls?: string[] | null
          route_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "route_comments_app_user_id_fkey"
            columns: ["app_user_id"]
            isOneToOne: false
            referencedRelation: "app_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_comments_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      route_likes: {
        Row: {
          app_user_id: string | null
          created_at: string | null
          id: string
          route_id: string
          user_id: string | null
        }
        Insert: {
          app_user_id?: string | null
          created_at?: string | null
          id?: string
          route_id: string
          user_id?: string | null
        }
        Update: {
          app_user_id?: string | null
          created_at?: string | null
          id?: string
          route_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "route_likes_app_user_id_fkey"
            columns: ["app_user_id"]
            isOneToOne: false
            referencedRelation: "app_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_likes_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          app_user_id: string | null
          average_speed: number | null
          comments_count: number | null
          created_at: string | null
          description: string | null
          distance: number | null
          duration_minutes: number | null
          end_latitude: number | null
          end_longitude: number | null
          id: string
          likes_count: number | null
          media_urls: string[] | null
          name: string
          route_points: Json | null
          start_latitude: number | null
          start_longitude: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          app_user_id?: string | null
          average_speed?: number | null
          comments_count?: number | null
          created_at?: string | null
          description?: string | null
          distance?: number | null
          duration_minutes?: number | null
          end_latitude?: number | null
          end_longitude?: number | null
          id?: string
          likes_count?: number | null
          media_urls?: string[] | null
          name: string
          route_points?: Json | null
          start_latitude?: number | null
          start_longitude?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          app_user_id?: string | null
          average_speed?: number | null
          comments_count?: number | null
          created_at?: string | null
          description?: string | null
          distance?: number | null
          duration_minutes?: number | null
          end_latitude?: number | null
          end_longitude?: number | null
          id?: string
          likes_count?: number | null
          media_urls?: string[] | null
          name?: string
          route_points?: Json | null
          start_latitude?: number | null
          start_longitude?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_app_user_id_fkey"
            columns: ["app_user_id"]
            isOneToOne: false
            referencedRelation: "app_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      spot_comments: {
        Row: {
          app_user_id: string | null
          content: string
          created_at: string | null
          id: string
          media_urls: string[] | null
          spot_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          app_user_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          media_urls?: string[] | null
          spot_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          app_user_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          media_urls?: string[] | null
          spot_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spot_comments_app_user_id_fkey"
            columns: ["app_user_id"]
            isOneToOne: false
            referencedRelation: "app_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spot_comments_spot_id_fkey"
            columns: ["spot_id"]
            isOneToOne: false
            referencedRelation: "spots"
            referencedColumns: ["id"]
          },
        ]
      }
      spot_likes: {
        Row: {
          app_user_id: string | null
          created_at: string | null
          id: string
          spot_id: string
          user_id: string | null
        }
        Insert: {
          app_user_id?: string | null
          created_at?: string | null
          id?: string
          spot_id: string
          user_id?: string | null
        }
        Update: {
          app_user_id?: string | null
          created_at?: string | null
          id?: string
          spot_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spot_likes_app_user_id_fkey"
            columns: ["app_user_id"]
            isOneToOne: false
            referencedRelation: "app_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spot_likes_spot_id_fkey"
            columns: ["spot_id"]
            isOneToOne: false
            referencedRelation: "spots"
            referencedColumns: ["id"]
          },
        ]
      }
      spots: {
        Row: {
          app_user_id: string | null
          comments_count: number | null
          created_at: string | null
          description: string | null
          id: string
          latitude: number
          likes_count: number | null
          longitude: number
          media_urls: string[] | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          app_user_id?: string | null
          comments_count?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          latitude: number
          likes_count?: number | null
          longitude: number
          media_urls?: string[] | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          app_user_id?: string | null
          comments_count?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          latitude?: number
          likes_count?: number | null
          longitude?: number
          media_urls?: string[] | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spots_app_user_id_fkey"
            columns: ["app_user_id"]
            isOneToOne: false
            referencedRelation: "app_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_or_create_app_profile: {
        Args: {
          p_telegram_id: string
          p_first_name?: string
          p_last_name?: string
          p_username?: string
          p_telegram_username?: string
          p_photo_url?: string
          p_auth_date?: number
          p_hash?: string
          p_supabase_user_id?: string
        }
        Returns: string
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
