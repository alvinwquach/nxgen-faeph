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
      _backup_bookings_20260905: {
        Row: {
          amount: number | null
          balance_paid: number | null
          booker_name: string | null
          channel: string | null
          contact: string | null
          court_id: string | null
          created_at: string | null
          date: string | null
          deposit_paid: number | null
          event_name: string | null
          hours: number | null
          id: string | null
          is_event: boolean | null
          member_id: string | null
          purpose: string | null
          ref: string | null
          sport: string | null
          start_hour: number | null
          status: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          amount?: number | null
          balance_paid?: number | null
          booker_name?: string | null
          channel?: string | null
          contact?: string | null
          court_id?: string | null
          created_at?: string | null
          date?: string | null
          deposit_paid?: number | null
          event_name?: string | null
          hours?: number | null
          id?: string | null
          is_event?: boolean | null
          member_id?: string | null
          purpose?: string | null
          ref?: string | null
          sport?: string | null
          start_hour?: number | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          amount?: number | null
          balance_paid?: number | null
          booker_name?: string | null
          channel?: string | null
          contact?: string | null
          court_id?: string | null
          created_at?: string | null
          date?: string | null
          deposit_paid?: number | null
          event_name?: string | null
          hours?: number | null
          id?: string | null
          is_event?: boolean | null
          member_id?: string | null
          purpose?: string | null
          ref?: string | null
          sport?: string | null
          start_hour?: number | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      activity_log: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string | null
          before_after: string | null
          booking_id: string | null
          created_at: string | null
          details: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string | null
          before_after?: string | null
          booking_id?: string | null
          created_at?: string | null
          details?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string | null
          before_after?: string | null
          booking_id?: string | null
          created_at?: string | null
          details?: string | null
          id?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      booking_payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          id: string
          kind: string
          method: string
          note: string | null
          proof_path: string | null
          reference: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_by: string | null
          submitted_by_name: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          id?: string
          kind: string
          method: string
          note?: string | null
          proof_path?: string | null
          reference?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_by?: string | null
          submitted_by_name?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          id?: string
          kind?: string
          method?: string
          note?: string | null
          proof_path?: string | null
          reference?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_by?: string | null
          submitted_by_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          amount: number
          balance_paid: number
          booker_name: string | null
          channel: string | null
          contact: string | null
          court_id: string
          created_at: string | null
          date: string
          deposit_paid: number
          event_name: string | null
          hours: number
          id: string
          is_event: boolean
          member_id: string | null
          notified_event: string | null
          purpose: string | null
          ref: string | null
          reminder_sent: boolean
          reserved_until: string | null
          sport: string
          start_hour: number
          status: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          amount: number
          balance_paid?: number
          booker_name?: string | null
          channel?: string | null
          contact?: string | null
          court_id: string
          created_at?: string | null
          date: string
          deposit_paid?: number
          event_name?: string | null
          hours?: number
          id?: string
          is_event?: boolean
          member_id?: string | null
          notified_event?: string | null
          purpose?: string | null
          ref?: string | null
          reminder_sent?: boolean
          reserved_until?: string | null
          sport: string
          start_hour: number
          status?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          amount?: number
          balance_paid?: number
          booker_name?: string | null
          channel?: string | null
          contact?: string | null
          court_id?: string
          created_at?: string | null
          date?: string
          deposit_paid?: number
          event_name?: string | null
          hours?: number
          id?: string
          is_event?: boolean
          member_id?: string | null
          notified_event?: string | null
          purpose?: string | null
          ref?: string | null
          reminder_sent?: boolean
          reserved_until?: string | null
          sport?: string
          start_hour?: number
          status?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_court_fk"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "court_rates"
            referencedColumns: ["court_id"]
          },
          {
            foreignKeyName: "bookings_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      cafe_booking_slots: {
        Row: {
          booking_id: string
          created_at: string
          date: string
          hour: number
          id: string
          station_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          date: string
          hour: number
          id?: string
          station_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          date?: string
          hour?: number
          id?: string
          station_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cafe_booking_slots_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "cafe_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cafe_booking_slots_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "cafe_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      cafe_bookings: {
        Row: {
          amount: number
          channel: string
          created_at: string
          date: string
          hours: number
          id: string
          member_id: string
          ref: string
          start_hour: number
          station_id: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          amount: number
          channel?: string
          created_at?: string
          date: string
          hours: number
          id?: string
          member_id: string
          ref: string
          start_hour: number
          station_id: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          amount?: number
          channel?: string
          created_at?: string
          date?: string
          hours?: number
          id?: string
          member_id?: string
          ref?: string
          start_hour?: number
          station_id?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cafe_bookings_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cafe_bookings_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "cafe_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      cafe_stations: {
        Row: {
          active: boolean
          code: string
          created_at: string
          hourly_rate: number
          id: string
          name: string
          sort_order: number
          specs: Json
          station_type: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          hourly_rate: number
          id?: string
          name: string
          sort_order?: number
          specs?: Json
          station_type: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          hourly_rate?: number
          id?: string
          name?: string
          sort_order?: number
          specs?: Json
          station_type?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      court_rates: {
        Row: {
          active: boolean
          court_id: string
          member_rate: number
          name: string
          non_member_rate: number
          sort_order: number
          sport: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active?: boolean
          court_id: string
          member_rate: number
          name: string
          non_member_rate: number
          sort_order?: number
          sport: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          active?: boolean
          court_id?: string
          member_rate?: number
          name?: string
          non_member_rate?: number
          sort_order?: number
          sport?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      incidents: {
        Row: {
          category: string
          created_at: string
          description: string | null
          evidence_urls: string[]
          filed_by: string | null
          filed_by_name: string | null
          id: string
          member_id: string | null
          notes: string | null
          resolved_at: string | null
          severity: string
          status: string
          subject_name: string
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          evidence_urls?: string[]
          filed_by?: string | null
          filed_by_name?: string | null
          id?: string
          member_id?: string | null
          notes?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          subject_name: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          evidence_urls?: string[]
          filed_by?: string | null
          filed_by_name?: string | null
          id?: string
          member_id?: string | null
          notes?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          subject_name?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          category: string
          id: string
          name: string
          par_level: number | null
          price: number
          sku: string
          stock: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          id?: string
          name: string
          par_level?: number | null
          price: number
          sku: string
          stock?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          id?: string
          name?: string
          par_level?: number | null
          price?: number
          sku?: string
          stock?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      members: {
        Row: {
          band_id: string | null
          email: string
          id: string
          joined_at: string | null
          name: string
          phone: string | null
          provider: string | null
          role: string | null
          sport: string | null
          tier: string | null
          user_id: string | null
        }
        Insert: {
          band_id?: string | null
          email: string
          id?: string
          joined_at?: string | null
          name: string
          phone?: string | null
          provider?: string | null
          role?: string | null
          sport?: string | null
          tier?: string | null
          user_id?: string | null
        }
        Update: {
          band_id?: string | null
          email?: string
          id?: string
          joined_at?: string | null
          name?: string
          phone?: string | null
          provider?: string | null
          role?: string | null
          sport?: string | null
          tier?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notify_config: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          id: string
          item_id: string | null
          member_id: string | null
          name: string
          qty: number
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          id?: string
          item_id?: string | null
          member_id?: string | null
          name: string
          qty?: number
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          id?: string
          item_id?: string | null
          member_id?: string | null
          name?: string
          qty?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_pulse: {
        Row: {
          id: number
          updated_at: string
        }
        Insert: {
          id: number
          updated_at?: string
        }
        Update: {
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      tabs: {
        Row: {
          created_at: string | null
          id: string
          items: Json | null
          member_id: string | null
          settled: boolean | null
          total: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          items?: Json | null
          member_id?: string | null
          settled?: boolean | null
          total?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          items?: Json | null
          member_id?: string | null
          settled?: boolean | null
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tabs_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      tryouts: {
        Row: {
          created_at: string | null
          id: string
          member_id: string
          sport: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          member_id: string
          sport: string
        }
        Update: {
          created_at?: string | null
          id?: string
          member_id?: string
          sport?: string
        }
        Relationships: [
          {
            foreignKeyName: "tryouts_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wifi_orders: {
        Row: {
          activated_at: string | null
          amount: number
          buyer_name: string | null
          code: string
          created_at: string | null
          devices: number
          expires_at: string | null
          id: string
          member_id: string | null
          minutes: number
          payment_method: string | null
          plan_id: string | null
          plan_name: string
          status: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          activated_at?: string | null
          amount: number
          buyer_name?: string | null
          code: string
          created_at?: string | null
          devices?: number
          expires_at?: string | null
          id?: string
          member_id?: string | null
          minutes: number
          payment_method?: string | null
          plan_id?: string | null
          plan_name: string
          status?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          activated_at?: string | null
          amount?: number
          buyer_name?: string | null
          code?: string
          created_at?: string | null
          devices?: number
          expires_at?: string | null
          id?: string
          member_id?: string | null
          minutes?: number
          payment_method?: string | null
          plan_id?: string | null
          plan_name?: string
          status?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wifi_orders_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wifi_orders_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "wifi_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      wifi_plans: {
        Row: {
          active: boolean
          created_at: string | null
          description: string | null
          devices: number
          id: string
          minutes: number
          name: string
          price: number
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          description?: string | null
          devices?: number
          id?: string
          minutes: number
          name: string
          price: number
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string | null
          description?: string | null
          devices?: number
          id?: string
          minutes?: number
          name?: string
          price?: number
          sort_order?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_cafe_booking: { Args: { _booking_id: string }; Returns: boolean }
      claim_admin_if_first: { Args: never; Returns: boolean }
      create_cafe_booking: {
        Args: { _date: string; _hours: number[]; _station_id: string }
        Returns: {
          amount: number
          channel: string
          created_at: string
          date: string
          hours: number
          id: string
          member_id: string
          ref: string
          start_hour: number
          station_id: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "cafe_bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_staff_access: { Args: { _user_id: string }; Returns: boolean }
      notify_booking_email: {
        Args: { _booking_id: string; _event: string }
        Returns: undefined
      }
      release_lapsed_holds: {
        Args: {
          _court_id: string
          _date: string
          _grace_minutes?: number
          _hours: number
          _start_hour: number
        }
        Returns: number
      }
      release_lapsed_reserves: { Args: never; Returns: number }
      send_reserve_expiry_reminders: { Args: never; Returns: number }
      slot_states: {
        Args: { _from: string; _to: string }
        Returns: {
          booking_id: string
          court_id: string
          day: string
          hour: number
          member_id: string
          reserved_until: string
          state: string
        }[]
      }
      taken_hours: {
        Args: { _court_id: string; _date: string }
        Returns: {
          hours: number
          start_hour: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "member"
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
    Enums: {
      app_role: ["admin", "staff", "member"],
    },
  },
} as const
