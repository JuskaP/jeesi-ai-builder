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
      agent_functions: {
        Row: {
          agent_id: string
          config: Json
          created_at: string
          description: string | null
          execution_order: number
          function_type: string
          id: string
          is_enabled: boolean
          name: string
          trigger_keywords: string[] | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          config?: Json
          created_at?: string
          description?: string | null
          execution_order?: number
          function_type: string
          id?: string
          is_enabled?: boolean
          name: string
          trigger_keywords?: string[] | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          config?: Json
          created_at?: string
          description?: string | null
          execution_order?: number
          function_type?: string
          id?: string
          is_enabled?: boolean
          name?: string
          trigger_keywords?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_functions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_issues: {
        Row: {
          agent_id: string | null
          created_at: string
          id: string
          issue_description: string | null
          issue_type: string
          occurrence_count: number
          resolved: boolean
          sample_prompts: Json | null
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          id?: string
          issue_description?: string | null
          issue_type: string
          occurrence_count?: number
          resolved?: boolean
          sample_prompts?: Json | null
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          id?: string
          issue_description?: string | null
          issue_type?: string
          occurrence_count?: number
          resolved?: boolean
          sample_prompts?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_issues_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          ai_model: string | null
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_heavy: boolean | null
          is_published: boolean | null
          knowledge_base: Json | null
          max_tokens: number | null
          name: string
          purpose: string
          railway_url: string | null
          status: string | null
          system_prompt: string | null
          tech_stack: Json | null
          temperature: number | null
          updated_at: string | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          ai_model?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_heavy?: boolean | null
          is_published?: boolean | null
          knowledge_base?: Json | null
          max_tokens?: number | null
          name: string
          purpose: string
          railway_url?: string | null
          status?: string | null
          system_prompt?: string | null
          tech_stack?: Json | null
          temperature?: number | null
          updated_at?: string | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          ai_model?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_heavy?: boolean | null
          is_published?: boolean | null
          knowledge_base?: Json | null
          max_tokens?: number | null
          name?: string
          purpose?: string
          railway_url?: string | null
          status?: string | null
          system_prompt?: string | null
          tech_stack?: Json | null
          temperature?: number | null
          updated_at?: string | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_name: string
          key_prefix: string
          last_used_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_name: string
          key_prefix: string
          last_used_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_name?: string
          key_prefix?: string
          last_used_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          agent_id: string | null
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_balances: {
        Row: {
          created_at: string | null
          credits_remaining: number
          credits_used_this_month: number
          id: string
          plan_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_remaining?: number
          credits_used_this_month?: number
          id?: string
          plan_type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_remaining?: number
          credits_used_this_month?: number
          id?: string
          plan_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credit_usage: {
        Row: {
          agent_id: string | null
          created_at: string | null
          credits_used: number
          id: string
          metadata: Json | null
          operation_type: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          credits_used: number
          id?: string
          metadata?: Json | null
          operation_type: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          credits_used?: number
          id?: string
          metadata?: Json | null
          operation_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_usage_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_analytics: {
        Row: {
          agent_id: string | null
          created_at: string
          error_message: string | null
          error_type: string | null
          event_type: string
          id: string
          metadata: Json | null
          prompt_text: string | null
          response_preview: string | null
          response_time_ms: number | null
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          error_message?: string | null
          error_type?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          prompt_text?: string | null
          response_preview?: string | null
          response_time_ms?: number | null
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          error_message?: string | null
          error_type?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          prompt_text?: string | null
          response_preview?: string | null
          response_time_ms?: number | null
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_analytics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_consent: {
        Row: {
          consent_version: string
          consented_at: string | null
          created_at: string
          error_tracking: boolean
          id: string
          metadata_collection: boolean
          prompt_analysis: boolean
          updated_at: string
          usage_analytics: boolean
          user_id: string
        }
        Insert: {
          consent_version?: string
          consented_at?: string | null
          created_at?: string
          error_tracking?: boolean
          id?: string
          metadata_collection?: boolean
          prompt_analysis?: boolean
          updated_at?: string
          usage_analytics?: boolean
          user_id: string
        }
        Update: {
          consent_version?: string
          consented_at?: string | null
          created_at?: string
          error_tracking?: boolean
          id?: string
          metadata_collection?: boolean
          prompt_analysis?: boolean
          updated_at?: string
          usage_analytics?: boolean
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workspace_invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["workspace_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          token: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["workspace_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_invitations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string
          role: Database["public"]["Enums"]["workspace_role"]
          user_id: string
          workspace_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          user_id: string
          workspace_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          owner_id: string
          shared_credits: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          owner_id: string
          shared_credits?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          owner_id?: string
          shared_credits?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      deduct_credits: {
        Args: { p_credits: number; p_user_id: string }
        Returns: undefined
      }
      get_admin_stats: {
        Args: never
        Returns: {
          active_users: number
          agents_this_month: number
          agents_this_week: number
          credits_used_this_week: number
          expert_subscribers: number
          pro_subscribers: number
          total_agents: number
          total_credits_used: number
          total_users: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_workspace_admin: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
      is_workspace_member: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      invitation_status: "pending" | "accepted" | "declined" | "expired"
      workspace_role: "owner" | "admin" | "editor" | "viewer"
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
      app_role: ["admin", "moderator", "user"],
      invitation_status: ["pending", "accepted", "declined", "expired"],
      workspace_role: ["owner", "admin", "editor", "viewer"],
    },
  },
} as const
