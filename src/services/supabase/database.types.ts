// Generated from the Supabase schema. Regenerate after every migration.
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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      daily_interview_questions: {
        Row: {
          answer: string
          answer_origin: string
          created_at: string
          difficulty: string | null
          digest_date: string
          ingestion_run_id: string | null
          question: string
          source_repository: string
          source_url: string
          topic: string
          updated_at: string
        }
        Insert: {
          answer: string
          answer_origin: string
          created_at?: string
          difficulty?: string | null
          digest_date: string
          ingestion_run_id?: string | null
          question: string
          source_repository: string
          source_url: string
          topic: string
          updated_at?: string
        }
        Update: {
          answer?: string
          answer_origin?: string
          created_at?: string
          difficulty?: string | null
          digest_date?: string
          ingestion_run_id?: string | null
          question?: string
          source_repository?: string
          source_url?: string
          topic?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_interview_questions_ingestion_run_id_fkey"
            columns: ["ingestion_run_id"]
            isOneToOne: false
            referencedRelation: "ingestion_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      de_topics: {
        Row: {
          created_at: string
          digest_date: string
          explanation: string
          ingestion_run_id: string | null
          practical_example: string
          reference_urls: string[]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          digest_date: string
          explanation: string
          ingestion_run_id?: string | null
          practical_example: string
          reference_urls?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          digest_date?: string
          explanation?: string
          ingestion_run_id?: string | null
          practical_example?: string
          reference_urls?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "de_topics_ingestion_run_id_fkey"
            columns: ["ingestion_run_id"]
            isOneToOne: false
            referencedRelation: "ingestion_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      ingestion_runs: {
        Row: {
          digest_date: string
          error: Json | null
          id: string
          items_count: number
          received_at: string
          section: string
          status: string
        }
        Insert: {
          digest_date: string
          error?: Json | null
          id?: string
          items_count?: number
          received_at?: string
          section: string
          status: string
        }
        Update: {
          digest_date?: string
          error?: Json | null
          id?: string
          items_count?: number
          received_at?: string
          section?: string
          status?: string
        }
        Relationships: []
      }
      news_items: {
        Row: {
          category: string
          content_hash: string
          created_at: string
          digest_date: string
          id: string
          ingestion_run_id: string | null
          position: number
          published_at: string
          publisher: string
          summary: string
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          category: string
          content_hash: string
          created_at?: string
          digest_date: string
          id?: string
          ingestion_run_id?: string | null
          position: number
          published_at: string
          publisher: string
          summary: string
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          category?: string
          content_hash?: string
          created_at?: string
          digest_date?: string
          id?: string
          ingestion_run_id?: string | null
          position?: number
          published_at?: string
          publisher?: string
          summary?: string
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_items_ingestion_run_id_fkey"
            columns: ["ingestion_run_id"]
            isOneToOne: false
            referencedRelation: "ingestion_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      trending_repos: {
        Row: {
          created_at: string
          description: string | null
          digest_date: string
          full_name: string
          ingestion_run_id: string | null
          language: string | null
          rank: number
          stars: number
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          digest_date: string
          full_name: string
          ingestion_run_id?: string | null
          language?: string | null
          rank: number
          stars: number
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          digest_date?: string
          full_name?: string
          ingestion_run_id?: string | null
          language?: string | null
          rank?: number
          stars?: number
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "trending_repos_ingestion_run_id_fkey"
            columns: ["ingestion_run_id"]
            isOneToOne: false
            referencedRelation: "ingestion_runs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      digest_dates: {
        Row: {
          digest_date: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      ingest_section: {
        Args: { p_digest_date: string; p_items: Json; p_section: string }
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
