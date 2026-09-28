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
      announcements: {
        Row: {
          athlete_id: string | null
          audience: Database["public"]["Enums"]["announcement_audience"]
          body: string
          category_id: string | null
          created_at: string
          created_by: string | null
          id: string
          image_url: string | null
          is_public_news: boolean
          published_at: string | null
          status: Database["public"]["Enums"]["announcement_status"]
          team_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          athlete_id?: string | null
          audience?: Database["public"]["Enums"]["announcement_audience"]
          body?: string
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          is_public_news?: boolean
          published_at?: string | null
          status?: Database["public"]["Enums"]["announcement_status"]
          team_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          athlete_id?: string | null
          audience?: Database["public"]["Enums"]["announcement_audience"]
          body?: string
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          is_public_news?: boolean
          published_at?: string | null
          status?: Database["public"]["Enums"]["announcement_status"]
          team_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_documents: {
        Row: {
          athlete_id: string
          athlete_visible: boolean
          created_at: string
          doc_type: string
          guardian_visible: boolean
          id: string
          name: string
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          athlete_id: string
          athlete_visible?: boolean
          created_at?: string
          doc_type?: string
          guardian_visible?: boolean
          id?: string
          name: string
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          athlete_id?: string
          athlete_visible?: boolean
          created_at?: string
          doc_type?: string
          guardian_visible?: boolean
          id?: string
          name?: string
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_documents_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_guardians: {
        Row: {
          athlete_id: string
          code_id: string | null
          created_at: string
          guardian_id: string
          id: string
          rejection_reason: string | null
          relationship: string
          requested_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          revoke_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          status: Database["public"]["Enums"]["link_status"]
        }
        Insert: {
          athlete_id: string
          code_id?: string | null
          created_at?: string
          guardian_id: string
          id?: string
          rejection_reason?: string | null
          relationship: string
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          revoke_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          status?: Database["public"]["Enums"]["link_status"]
        }
        Update: {
          athlete_id?: string
          code_id?: string | null
          created_at?: string
          guardian_id?: string
          id?: string
          rejection_reason?: string | null
          relationship?: string
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          revoke_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          status?: Database["public"]["Enums"]["link_status"]
        }
        Relationships: [
          {
            foreignKeyName: "athlete_guardians_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_guardians_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "guardian_link_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_guardians_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_medical: {
        Row: {
          allergies: string | null
          athlete_id: string
          blood_type: string | null
          conditions: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          medications: string | null
          sport_restrictions: string | null
          updated_at: string
        }
        Insert: {
          allergies?: string | null
          athlete_id: string
          blood_type?: string | null
          conditions?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          medications?: string | null
          sport_restrictions?: string | null
          updated_at?: string
        }
        Update: {
          allergies?: string | null
          athlete_id?: string
          blood_type?: string | null
          conditions?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          medications?: string | null
          sport_restrictions?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "athlete_medical_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: true
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_private: {
        Row: {
          address: string | null
          athlete_id: string
          id_number: string | null
          nationality: string | null
          phone: string | null
          school: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          athlete_id: string
          id_number?: string | null
          nationality?: string | null
          phone?: string | null
          school?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          athlete_id?: string
          id_number?: string | null
          nationality?: string | null
          phone?: string | null
          school?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "athlete_private_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: true
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      athletes: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          birth_date: string | null
          category_id: string | null
          created_at: string
          full_name: string
          gender: string | null
          id: string
          photo_url: string | null
          position: string | null
          process_number: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["account_status"]
          team_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          birth_date?: string | null
          category_id?: string | null
          created_at?: string
          full_name: string
          gender?: string | null
          id?: string
          photo_url?: string | null
          position?: string | null
          process_number?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          team_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          birth_date?: string | null
          category_id?: string | null
          created_at?: string
          full_name?: string
          gender?: string | null
          id?: string
          photo_url?: string | null
          position?: string | null
          process_number?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          team_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athletes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athletes_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athletes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          athlete_id: string
          id: string
          justification: string | null
          recorded_at: string
          recorded_by: string | null
          session_id: string
          status: Database["public"]["Enums"]["attendance_status"]
        }
        Insert: {
          athlete_id: string
          id?: string
          justification?: string | null
          recorded_at?: string
          recorded_by?: string | null
          session_id: string
          status: Database["public"]["Enums"]["attendance_status"]
        }
        Update: {
          athlete_id?: string
          id?: string
          justification?: string | null
          recorded_at?: string
          recorded_by?: string | null
          session_id?: string
          status?: Database["public"]["Enums"]["attendance_status"]
        }
        Relationships: [
          {
            foreignKeyName: "attendance_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          entity: string
          entity_id: string | null
          id: number
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity: string
          entity_id?: string | null
          id?: never
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity?: string
          entity_id?: string | null
          id?: never
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string | null
          id: string
          is_public: boolean
          kind: Database["public"]["Enums"]["event_kind"]
          location: string | null
          starts_at: string
          team_id: string | null
          title: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_public?: boolean
          kind?: Database["public"]["Enums"]["event_kind"]
          location?: string | null
          starts_at: string
          team_id?: string | null
          title: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_public?: boolean
          kind?: Database["public"]["Enums"]["event_kind"]
          location?: string | null
          starts_at?: string
          team_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          active: boolean
          age_range: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          position: number
        }
        Insert: {
          active?: boolean
          age_range?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          position?: number
        }
        Update: {
          active?: boolean
          age_range?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          position?: number
        }
        Relationships: []
      }
      coach_public_profiles: {
        Row: {
          bio: string | null
          created_at: string
          display_name: string
          id: string
          photo_url: string | null
          position: number
          role_title: string
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_name: string
          id?: string
          photo_url?: string | null
          position?: number
          role_title?: string
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          photo_url?: string | null
          position?: number
          role_title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_public_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          athlete_id: string
          category_id: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          season_id: string
          status: string
          team_id: string | null
        }
        Insert: {
          athlete_id: string
          category_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          season_id: string
          status?: string
          team_id?: string | null
        }
        Update: {
          athlete_id?: string
          category_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          season_id?: string
          status?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          athlete_id: string
          created_at: string
          discipline: number | null
          evaluated_on: string
          evaluator_id: string | null
          evolution: number | null
          id: string
          observations: string | null
          physical: number | null
          scale_max: number
          tactical: number | null
          teamwork: number | null
          technical: number | null
        }
        Insert: {
          athlete_id: string
          created_at?: string
          discipline?: number | null
          evaluated_on?: string
          evaluator_id?: string | null
          evolution?: number | null
          id?: string
          observations?: string | null
          physical?: number | null
          scale_max?: number
          tactical?: number | null
          teamwork?: number | null
          technical?: number | null
        }
        Update: {
          athlete_id?: string
          created_at?: string
          discipline?: number | null
          evaluated_on?: string
          evaluator_id?: string | null
          evolution?: number | null
          id?: string
          observations?: string | null
          physical?: number | null
          scale_max?: number
          tactical?: number | null
          teamwork?: number | null
          technical?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_items: {
        Row: {
          answer: string
          created_at: string
          id: string
          position: number
          question: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          position?: number
          question: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          position?: number
          question?: string
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          image_url: string | null
          kind: string
          position: number
          title: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          kind?: string
          position?: number
          title?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          kind?: string
          position?: number
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      game_players: {
        Row: {
          assists: number
          athlete_id: string
          called_up: boolean
          game_id: string
          goals: number
          id: string
          minutes: number
          notes: string | null
          red_cards: number
          started: boolean
          yellow_cards: number
        }
        Insert: {
          assists?: number
          athlete_id: string
          called_up?: boolean
          game_id: string
          goals?: number
          id?: string
          minutes?: number
          notes?: string | null
          red_cards?: number
          started?: boolean
          yellow_cards?: number
        }
        Update: {
          assists?: number
          athlete_id?: string
          called_up?: boolean
          game_id?: string
          goals?: number
          id?: string
          minutes?: number
          notes?: string | null
          red_cards?: number
          started?: boolean
          yellow_cards?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_players_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_players_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          competition: string | null
          created_at: string
          created_by: string | null
          goals_against: number | null
          goals_for: number | null
          id: string
          image_url: string | null
          is_home: boolean
          kind: string
          location: string | null
          notes: string | null
          opponent: string
          season_id: string | null
          starts_at: string
          status: Database["public"]["Enums"]["game_status"]
          team_id: string | null
        }
        Insert: {
          competition?: string | null
          created_at?: string
          created_by?: string | null
          goals_against?: number | null
          goals_for?: number | null
          id?: string
          image_url?: string | null
          is_home?: boolean
          kind?: string
          location?: string | null
          notes?: string | null
          opponent: string
          season_id?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["game_status"]
          team_id?: string | null
        }
        Update: {
          competition?: string | null
          created_at?: string
          created_by?: string | null
          goals_against?: number | null
          goals_for?: number | null
          id?: string
          image_url?: string | null
          is_home?: boolean
          kind?: string
          location?: string | null
          notes?: string | null
          opponent?: string
          season_id?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["game_status"]
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      guardian_link_codes: {
        Row: {
          athlete_id: string
          code_hash: string
          code_hint: string
          created_at: string
          created_by: string
          expires_at: string
          id: string
          revoked_at: string | null
          revoked_by: string | null
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          athlete_id: string
          code_hash: string
          code_hint: string
          created_at?: string
          created_by: string
          expires_at: string
          id?: string
          revoked_at?: string | null
          revoked_by?: string | null
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          athlete_id?: string
          code_hash?: string
          code_hint?: string
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          revoked_at?: string | null
          revoked_by?: string | null
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guardian_link_codes_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      guardians: {
        Row: {
          created_at: string
          default_relationship: string | null
          email: string | null
          full_name: string
          id: string
          phone: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          default_relationship?: string | null
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          default_relationship?: string | null
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guardians_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_statistics: {
        Row: {
          assists: number
          athlete_id: string
          games: number
          goals: number
          id: string
          minutes: number
          red_cards: number
          season_id: string | null
          updated_at: string
          yellow_cards: number
        }
        Insert: {
          assists?: number
          athlete_id: string
          games?: number
          goals?: number
          id?: string
          minutes?: number
          red_cards?: number
          season_id?: string | null
          updated_at?: string
          yellow_cards?: number
        }
        Update: {
          assists?: number
          athlete_id?: string
          games?: number
          goals?: number
          id?: string
          minutes?: number
          red_cards?: number
          season_id?: string | null
          updated_at?: string
          yellow_cards?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_statistics_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_statistics_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      process_counters: {
        Row: {
          last_value: number
          year: number
        }
        Insert: {
          last_value?: number
          year: number
        }
        Update: {
          last_value?: number
          year?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          phone?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Relationships: []
      }
      seasons: {
        Row: {
          created_at: string
          ends_on: string
          id: string
          is_current: boolean
          name: string
          starts_on: string
        }
        Insert: {
          created_at?: string
          ends_on: string
          id?: string
          is_current?: boolean
          name: string
          starts_on: string
        }
        Update: {
          created_at?: string
          ends_on?: string
          id?: string
          is_current?: boolean
          name?: string
          starts_on?: string
        }
        Relationships: []
      }
      site_content: {
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
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      team_coaches: {
        Row: {
          coach_id: string
          created_at: string
          team_id: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          team_id: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_coaches_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_coaches_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          active: boolean
          category_id: string
          created_at: string
          id: string
          name: string
          season_id: string | null
        }
        Insert: {
          active?: boolean
          category_id: string
          created_at?: string
          id?: string
          name: string
          season_id?: string | null
        }
        Update: {
          active?: boolean
          category_id?: string
          created_at?: string
          id?: string
          name?: string
          season_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sessions: {
        Row: {
          created_at: string
          created_by: string | null
          ends_at: string | null
          focus: string | null
          id: string
          location: string | null
          notes: string | null
          starts_at: string
          team_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          focus?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          starts_at: string
          team_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          focus?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          starts_at?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_account: { Args: { _profile: string }; Returns: string }
      athlete_safety_info: {
        Args: { _athlete: string }
        Returns: {
          allergies: string
          blood_type: string
          emergency_contact_name: string
          emergency_contact_phone: string
          sport_restrictions: string
        }[]
      }
      attendance_rate: { Args: { _athlete: string }; Returns: number }
      can_manage_athlete_sport: {
        Args: { _athlete: string; _uid: string }
        Returns: boolean
      }
      can_see_announcement: {
        Args: { _id: string; _uid: string }
        Returns: boolean
      }
      can_view_athlete: {
        Args: { _athlete: string; _uid: string }
        Returns: boolean
      }
      coach_can_see: {
        Args: { _athlete: string; _uid: string }
        Returns: boolean
      }
      coaches_team: { Args: { _team: string; _uid: string }; Returns: boolean }
      ensure_profile: {
        Args: never
        Returns: {
          account_type: Database["public"]["Enums"]["account_type"]
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      generate_link_code: { Args: { _athlete: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_active_user: { Args: { _uid: string }; Returns: boolean }
      is_guardian_of: {
        Args: { _athlete: string; _uid: string }
        Returns: boolean
      }
      is_staff: { Args: { _uid: string }; Returns: boolean }
      log_audit: {
        Args: {
          _action: string
          _details?: Json
          _entity: string
          _entity_id: string
        }
        Returns: undefined
      }
      my_athlete_id: { Args: { _uid: string }; Returns: string }
      next_process_number: { Args: never; Returns: string }
      notify: {
        Args: {
          _body: string
          _kind: string
          _link?: string
          _title: string
          _user: string
        }
        Returns: undefined
      }
      notify_athlete_circle: {
        Args: { _athlete: string; _body: string; _kind: string; _title: string }
        Returns: undefined
      }
      notify_staff: {
        Args: { _body: string; _kind: string; _title: string }
        Returns: undefined
      }
      redeem_link_code: {
        Args: { _code: string; _relationship: string }
        Returns: string
      }
      refresh_player_statistics: {
        Args: { _athlete: string }
        Returns: undefined
      }
      reject_account: {
        Args: { _profile: string; _reason: string }
        Returns: undefined
      }
      request_correction: {
        Args: { _message: string; _profile: string }
        Returns: undefined
      }
      review_guardian_link: {
        Args: { _approve: boolean; _link: string; _reason?: string }
        Returns: undefined
      }
      revoke_guardian_link: {
        Args: { _link: string; _reason: string }
        Returns: undefined
      }
      revoke_link_code: { Args: { _code_id: string }; Returns: undefined }
      set_account_status: {
        Args: {
          _profile: string
          _reason?: string
          _status: Database["public"]["Enums"]["account_status"]
        }
        Returns: undefined
      }
      set_user_role: {
        Args: {
          _grant: boolean
          _role: Database["public"]["Enums"]["app_role"]
          _user: string
        }
        Returns: undefined
      }
      staff_create_athlete: {
        Args: {
          _birth_date: string
          _category: string
          _full_name: string
          _gender: string
          _team: string
        }
        Returns: string
      }
      user_in_category: {
        Args: { _cat: string; _uid: string }
        Returns: boolean
      }
      user_in_team: { Args: { _team: string; _uid: string }; Returns: boolean }
      verify_card: {
        Args: { _athlete: string }
        Returns: {
          category: string
          full_name: string
          process_number: string
          status: Database["public"]["Enums"]["account_status"]
        }[]
      }
    }
    Enums: {
      account_status:
        | "PENDENTE"
        | "APROVADO"
        | "REJEITADO"
        | "SUSPENSO"
        | "INATIVO"
      account_type: "atleta" | "encarregado" | "staff"
      announcement_audience:
        | "GERAL"
        | "CATEGORIA"
        | "EQUIPA"
        | "ATLETA"
        | "ENCARREGADO"
      announcement_status: "RASCUNHO" | "PUBLICADO" | "ARQUIVADO"
      app_role: "admin" | "secretaria" | "mister" | "atleta" | "encarregado"
      attendance_status: "PRESENTE" | "AUSENTE" | "ATRASADO" | "JUSTIFICADA"
      event_kind:
        | "TREINO"
        | "JOGO"
        | "TORNEIO"
        | "REUNIAO"
        | "EVENTO"
        | "COMUNICADO"
      game_status: "AGENDADO" | "CONCLUIDO" | "CANCELADO"
      link_status: "PENDENTE" | "APROVADA" | "REJEITADA" | "REVOGADA"
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
      account_status: [
        "PENDENTE",
        "APROVADO",
        "REJEITADO",
        "SUSPENSO",
        "INATIVO",
      ],
      account_type: ["atleta", "encarregado", "staff"],
      announcement_audience: [
        "GERAL",
        "CATEGORIA",
        "EQUIPA",
        "ATLETA",
        "ENCARREGADO",
      ],
      announcement_status: ["RASCUNHO", "PUBLICADO", "ARQUIVADO"],
      app_role: ["admin", "secretaria", "mister", "atleta", "encarregado"],
      attendance_status: ["PRESENTE", "AUSENTE", "ATRASADO", "JUSTIFICADA"],
      event_kind: [
        "TREINO",
        "JOGO",
        "TORNEIO",
        "REUNIAO",
        "EVENTO",
        "COMUNICADO",
      ],
      game_status: ["AGENDADO", "CONCLUIDO", "CANCELADO"],
      link_status: ["PENDENTE", "APROVADA", "REJEITADA", "REVOGADA"],
    },
  },
} as const
