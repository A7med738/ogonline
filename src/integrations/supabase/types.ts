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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          admin_id: string | null
          created_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean
          login_at: string
          logout_at: string | null
          session_token: string
          user_agent: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          login_at?: string
          logout_at?: string | null
          session_token: string
          user_agent?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          login_at?: string
          logout_at?: string | null
          session_token?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "medical_center_admins"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          priority: number | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          priority?: number | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          priority?: number | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      appointment_analytics: {
        Row: {
          analytics_date: string
          average_waiting_time: number | null
          cancelled_appointments: number | null
          clinic_id: string | null
          completed_appointments: number | null
          created_at: string
          health_center_id: string | null
          id: string
          no_show_appointments: number | null
          patient_satisfaction_score: number | null
          total_appointments: number | null
          total_revenue: number | null
          updated_at: string
        }
        Insert: {
          analytics_date?: string
          average_waiting_time?: number | null
          cancelled_appointments?: number | null
          clinic_id?: string | null
          completed_appointments?: number | null
          created_at?: string
          health_center_id?: string | null
          id?: string
          no_show_appointments?: number | null
          patient_satisfaction_score?: number | null
          total_appointments?: number | null
          total_revenue?: number | null
          updated_at?: string
        }
        Update: {
          analytics_date?: string
          average_waiting_time?: number | null
          cancelled_appointments?: number | null
          clinic_id?: string | null
          completed_appointments?: number | null
          created_at?: string
          health_center_id?: string | null
          id?: string
          no_show_appointments?: number | null
          patient_satisfaction_score?: number | null
          total_appointments?: number | null
          total_revenue?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_analytics_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "book_service_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_analytics_health_center_id_fkey"
            columns: ["health_center_id"]
            isOneToOne: false
            referencedRelation: "book_service_health_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      atms: {
        Row: {
          accessibility_features: string[] | null
          address: string | null
          bank_name: string | null
          created_at: string | null
          fees: string | null
          google_maps_url: string | null
          id: string
          is_active: boolean | null
          languages: string[] | null
          location_lat: number | null
          location_lng: number | null
          name: string
          operating_hours: string | null
          phone: string | null
          services: string[] | null
          updated_at: string | null
        }
        Insert: {
          accessibility_features?: string[] | null
          address?: string | null
          bank_name?: string | null
          created_at?: string | null
          fees?: string | null
          google_maps_url?: string | null
          id?: string
          is_active?: boolean | null
          languages?: string[] | null
          location_lat?: number | null
          location_lng?: number | null
          name: string
          operating_hours?: string | null
          phone?: string | null
          services?: string[] | null
          updated_at?: string | null
        }
        Update: {
          accessibility_features?: string[] | null
          address?: string | null
          bank_name?: string | null
          created_at?: string | null
          fees?: string | null
          google_maps_url?: string | null
          id?: string
          is_active?: boolean | null
          languages?: string[] | null
          location_lat?: number | null
          location_lng?: number | null
          name?: string
          operating_hours?: string | null
          phone?: string | null
          services?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      auth_logs: {
        Row: {
          created_at: string | null
          id: string
          ip_address: unknown | null
          serial_number: string | null
          success: boolean | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          serial_number?: string | null
          success?: boolean | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          serial_number?: string | null
          success?: boolean | null
          user_agent?: string | null
        }
        Relationships: []
      }
      banks: {
        Row: {
          address: string | null
          atm_available: boolean | null
          created_at: string | null
          description: string | null
          email: string | null
          established_year: number | null
          google_maps_url: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          languages: string[] | null
          logo_url: string | null
          mobile_banking: boolean | null
          name: string
          online_banking: boolean | null
          operating_hours: string | null
          parking_available: boolean | null
          phone: string | null
          rating: number | null
          services: string[] | null
          type: string
          updated_at: string | null
          website: string | null
          wheelchair_accessible: boolean | null
        }
        Insert: {
          address?: string | null
          atm_available?: boolean | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          established_year?: number | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          languages?: string[] | null
          logo_url?: string | null
          mobile_banking?: boolean | null
          name: string
          online_banking?: boolean | null
          operating_hours?: string | null
          parking_available?: boolean | null
          phone?: string | null
          rating?: number | null
          services?: string[] | null
          type: string
          updated_at?: string | null
          website?: string | null
          wheelchair_accessible?: boolean | null
        }
        Update: {
          address?: string | null
          atm_available?: boolean | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          established_year?: number | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          languages?: string[] | null
          logo_url?: string | null
          mobile_banking?: boolean | null
          name?: string
          online_banking?: boolean | null
          operating_hours?: string | null
          parking_available?: boolean | null
          phone?: string | null
          rating?: number | null
          services?: string[] | null
          type?: string
          updated_at?: string | null
          website?: string | null
          wheelchair_accessible?: boolean | null
        }
        Relationships: []
      }
      book_service_appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          clinic_id: string | null
          created_at: string | null
          id: string
          medical_history: string | null
          notes: string | null
          patient_age: number | null
          patient_gender: string | null
          patient_name: string
          patient_phone: string
          queue_number: number | null
          queue_position: number | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          appointment_date?: string
          appointment_time?: string
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          medical_history?: string | null
          notes?: string | null
          patient_age?: number | null
          patient_gender?: string | null
          patient_name: string
          patient_phone: string
          queue_number?: number | null
          queue_position?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          medical_history?: string | null
          notes?: string | null
          patient_age?: number | null
          patient_gender?: string | null
          patient_name?: string
          patient_phone?: string
          queue_number?: number | null
          queue_position?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "book_service_appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "book_service_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      book_service_clinic_queues: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          current_queue_number: number | null
          id: string
          last_updated: string | null
          total_patients_today: number | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          current_queue_number?: number | null
          id?: string
          last_updated?: string | null
          total_patients_today?: number | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          current_queue_number?: number | null
          id?: string
          last_updated?: string | null
          total_patients_today?: number | null
        }
        Relationships: []
      }
      book_service_clinics: {
        Row: {
          consultation_fee: number
          created_at: string | null
          doctor_name: string
          email: string | null
          health_center_id: string | null
          id: string
          is_available: boolean | null
          max_patients_per_day: number | null
          name: string
          phone: string | null
          specialization: string
          updated_at: string | null
          waiting_patients: number | null
          working_hours: string | null
        }
        Insert: {
          consultation_fee: number
          created_at?: string | null
          doctor_name: string
          email?: string | null
          health_center_id?: string | null
          id?: string
          is_available?: boolean | null
          max_patients_per_day?: number | null
          name: string
          phone?: string | null
          specialization: string
          updated_at?: string | null
          waiting_patients?: number | null
          working_hours?: string | null
        }
        Update: {
          consultation_fee?: number
          created_at?: string | null
          doctor_name?: string
          email?: string | null
          health_center_id?: string | null
          id?: string
          is_available?: boolean | null
          max_patients_per_day?: number | null
          name?: string
          phone?: string | null
          specialization?: string
          updated_at?: string | null
          waiting_patients?: number | null
          working_hours?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "book_service_clinics_health_center_id_fkey"
            columns: ["health_center_id"]
            isOneToOne: false
            referencedRelation: "book_service_health_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      book_service_health_centers: {
        Row: {
          address: string
          created_at: string | null
          description: string | null
          email: string | null
          google_maps_url: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          rating: number | null
          services: string[] | null
          updated_at: string | null
          working_hours: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          rating?: number | null
          services?: string[] | null
          updated_at?: string | null
          working_hours?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          rating?: number | null
          services?: string[] | null
          updated_at?: string | null
          working_hours?: string | null
        }
        Relationships: []
      }
      book_service_queue_status: {
        Row: {
          clinic_id: string | null
          current_serving_queue_number: number | null
          id: string
          last_updated: string | null
          next_queue_number: number | null
          status: string | null
        }
        Insert: {
          clinic_id?: string | null
          current_serving_queue_number?: number | null
          id?: string
          last_updated?: string | null
          next_queue_number?: number | null
          status?: string | null
        }
        Update: {
          clinic_id?: string | null
          current_serving_queue_number?: number | null
          id?: string
          last_updated?: string | null
          next_queue_number?: number | null
          status?: string | null
        }
        Relationships: []
      }
      children_services: {
        Row: {
          address: string
          created_at: string | null
          description: string | null
          facebook_url: string | null
          google_maps_url: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          logo_url: string | null
          name: string
          phone: string | null
          phone2: string | null
          type: string
          updated_at: string | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          description?: string | null
          facebook_url?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          phone?: string | null
          phone2?: string | null
          type: string
          updated_at?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          description?: string | null
          facebook_url?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          phone2?: string | null
          type?: string
          updated_at?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      city_departments: {
        Row: {
          color: string
          created_at: string
          description: string | null
          email: string
          google_maps_url: string | null
          hours: string
          icon: string
          id: string
          latitude: number | null
          longitude: number | null
          order_priority: number | null
          phone: string
          show_location: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          email: string
          google_maps_url?: string | null
          hours: string
          icon?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          order_priority?: number | null
          phone: string
          show_location?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          email?: string
          google_maps_url?: string | null
          hours?: string
          icon?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          order_priority?: number | null
          phone?: string
          show_location?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      city_services_new: {
        Row: {
          address: string
          created_at: string | null
          description: string | null
          google_maps_url: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          operating_hours: string | null
          phone: string
          service_type: string
          services: string[] | null
          updated_at: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          description?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          operating_hours?: string | null
          phone: string
          service_type: string
          services?: string[] | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          description?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          operating_hours?: string | null
          phone?: string
          service_type?: string
          services?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      clinics: {
        Row: {
          address: string | null
          appointment_required: boolean | null
          consultation_fee: number | null
          created_at: string | null
          description: string | null
          doctor_name: string | null
          doctor_qualification: string | null
          doctor_specialization: string | null
          email: string | null
          equipment: string[] | null
          established_year: number | null
          facebook_url: string | null
          google_maps_url: string | null
          id: string
          image_url: string | null
          insurance_accepted: string[] | null
          is_active: boolean | null
          languages: string[] | null
          logo_url: string | null
          name: string
          operating_hours: string | null
          phone: string | null
          phone2: string | null
          rating: number | null
          services: string[] | null
          type: string
          updated_at: string | null
          walk_in_accepted: boolean | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          appointment_required?: boolean | null
          consultation_fee?: number | null
          created_at?: string | null
          description?: string | null
          doctor_name?: string | null
          doctor_qualification?: string | null
          doctor_specialization?: string | null
          email?: string | null
          equipment?: string[] | null
          established_year?: number | null
          facebook_url?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          insurance_accepted?: string[] | null
          is_active?: boolean | null
          languages?: string[] | null
          logo_url?: string | null
          name: string
          operating_hours?: string | null
          phone?: string | null
          phone2?: string | null
          rating?: number | null
          services?: string[] | null
          type: string
          updated_at?: string | null
          walk_in_accepted?: boolean | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          appointment_required?: boolean | null
          consultation_fee?: number | null
          created_at?: string | null
          description?: string | null
          doctor_name?: string | null
          doctor_qualification?: string | null
          doctor_specialization?: string | null
          email?: string | null
          equipment?: string[] | null
          established_year?: number | null
          facebook_url?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          insurance_accepted?: string[] | null
          is_active?: boolean | null
          languages?: string[] | null
          logo_url?: string | null
          name?: string
          operating_hours?: string | null
          phone?: string | null
          phone2?: string | null
          rating?: number | null
          services?: string[] | null
          type?: string
          updated_at?: string | null
          walk_in_accepted?: boolean | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      content_moderation: {
        Row: {
          action: string
          content_id: string
          content_type: string
          created_at: string
          id: string
          moderator_id: string | null
          reason: string | null
          updated_at: string
        }
        Insert: {
          action: string
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          moderator_id?: string | null
          reason?: string | null
          updated_at?: string
        }
        Update: {
          action?: string
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          moderator_id?: string | null
          reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      craftsmen: {
        Row: {
          address: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          profession: string
          rating: number | null
          services: string[] | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          profession: string
          rating?: number | null
          services?: string[] | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          profession?: string
          rating?: number | null
          services?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_queue_management: {
        Row: {
          average_waiting_time: number | null
          clinic_id: string | null
          created_at: string
          current_serving: number | null
          id: string
          is_active: boolean
          next_number: number | null
          notes: string | null
          queue_date: string
          queue_status: string
          total_patients: number | null
          updated_at: string
        }
        Insert: {
          average_waiting_time?: number | null
          clinic_id?: string | null
          created_at?: string
          current_serving?: number | null
          id?: string
          is_active?: boolean
          next_number?: number | null
          notes?: string | null
          queue_date?: string
          queue_status?: string
          total_patients?: number | null
          updated_at?: string
        }
        Update: {
          average_waiting_time?: number | null
          clinic_id?: string | null
          created_at?: string
          current_serving?: number | null
          id?: string
          is_active?: boolean
          next_number?: number | null
          notes?: string | null
          queue_date?: string
          queue_status?: string
          total_patients?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_queue_management_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "book_service_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_management: {
        Row: {
          clinic_id: string | null
          consultation_fee: number | null
          created_at: string
          doctor_name: string
          email: string | null
          experience_years: number | null
          id: string
          is_available: boolean
          notes: string | null
          on_vacation: boolean
          phone: string | null
          qualification: string | null
          specialization: string
          updated_at: string
          vacation_end: string | null
          vacation_start: string | null
          working_days: string[] | null
          working_hours: Json | null
        }
        Insert: {
          clinic_id?: string | null
          consultation_fee?: number | null
          created_at?: string
          doctor_name: string
          email?: string | null
          experience_years?: number | null
          id?: string
          is_available?: boolean
          notes?: string | null
          on_vacation?: boolean
          phone?: string | null
          qualification?: string | null
          specialization: string
          updated_at?: string
          vacation_end?: string | null
          vacation_start?: string | null
          working_days?: string[] | null
          working_hours?: Json | null
        }
        Update: {
          clinic_id?: string | null
          consultation_fee?: number | null
          created_at?: string
          doctor_name?: string
          email?: string | null
          experience_years?: number | null
          id?: string
          is_available?: boolean
          notes?: string | null
          on_vacation?: boolean
          phone?: string | null
          qualification?: string | null
          specialization?: string
          updated_at?: string
          vacation_end?: string | null
          vacation_start?: string | null
          working_days?: string[] | null
          working_hours?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "doctor_management_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "book_service_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      educational_centers: {
        Row: {
          address: string | null
          age_groups: string[] | null
          capacity: number | null
          class_schedule: string | null
          created_at: string | null
          description: string | null
          email: string | null
          established_year: number | null
          facilities: string[] | null
          fees_range: string | null
          google_maps_url: string | null
          group_sessions: boolean | null
          id: string
          image_url: string | null
          individual_sessions: boolean | null
          is_active: boolean | null
          logo_url: string | null
          name: string
          online_classes: boolean | null
          phone: string | null
          rating: number | null
          subjects: string[] | null
          type: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          age_groups?: string[] | null
          capacity?: number | null
          class_schedule?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          established_year?: number | null
          facilities?: string[] | null
          fees_range?: string | null
          google_maps_url?: string | null
          group_sessions?: boolean | null
          id?: string
          image_url?: string | null
          individual_sessions?: boolean | null
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          online_classes?: boolean | null
          phone?: string | null
          rating?: number | null
          subjects?: string[] | null
          type: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          age_groups?: string[] | null
          capacity?: number | null
          class_schedule?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          established_year?: number | null
          facilities?: string[] | null
          fees_range?: string | null
          google_maps_url?: string | null
          group_sessions?: boolean | null
          id?: string
          image_url?: string | null
          individual_sessions?: boolean | null
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          online_classes?: boolean | null
          phone?: string | null
          rating?: number | null
          subjects?: string[] | null
          type?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      electricity_company: {
        Row: {
          address: string
          created_at: string | null
          description: string | null
          google_maps_url: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          operating_hours: string | null
          phone: string | null
          services: string[] | null
          updated_at: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          description?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          operating_hours?: string | null
          phone?: string | null
          services?: string[] | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          description?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          operating_hours?: string | null
          phone?: string | null
          services?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      email_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
          subscribed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          subscribed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          subscribed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      embeddings: {
        Row: {
          content: string
          content_id: string
          content_type: string
          created_at: string
          embedding: string | null
          id: string
          metadata: Json | null
          updated_at: string
        }
        Insert: {
          content: string
          content_id: string
          content_type: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string
        }
        Update: {
          content?: string
          content_id?: string
          content_type?: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          available: boolean
          created_at: string
          description: string | null
          id: string
          number: string
          order_priority: number | null
          station_id: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          available?: boolean
          created_at?: string
          description?: string | null
          id?: string
          number: string
          order_priority?: number | null
          station_id?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          available?: boolean
          created_at?: string
          description?: string | null
          id?: string
          number?: string
          order_priority?: number | null
          station_id?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "police_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string | null
          age_restriction: string | null
          capacity: number | null
          created_at: string | null
          description: string | null
          end_date: string | null
          end_time: string | null
          event_type: string
          google_maps_url: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_free: boolean | null
          languages: string[] | null
          organizer: string | null
          organizer_email: string | null
          organizer_phone: string | null
          registration_deadline: string | null
          registration_required: boolean | null
          start_date: string | null
          start_time: string | null
          tags: string[] | null
          ticket_price: number | null
          title: string
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          address?: string | null
          age_restriction?: string | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_type: string
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_free?: boolean | null
          languages?: string[] | null
          organizer?: string | null
          organizer_email?: string | null
          organizer_phone?: string | null
          registration_deadline?: string | null
          registration_required?: boolean | null
          start_date?: string | null
          start_time?: string | null
          tags?: string[] | null
          ticket_price?: number | null
          title: string
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          address?: string | null
          age_restriction?: string | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_type?: string
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_free?: boolean | null
          languages?: string[] | null
          organizer?: string | null
          organizer_email?: string | null
          organizer_phone?: string | null
          registration_deadline?: string | null
          registration_required?: boolean | null
          start_date?: string | null
          start_time?: string | null
          tags?: string[] | null
          ticket_price?: number | null
          title?: string
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: []
      }
      gas_company: {
        Row: {
          address: string
          booking_url: string | null
          created_at: string | null
          description: string | null
          google_maps_url: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          operating_hours: string | null
          phone: string
          services: string[] | null
          updated_at: string | null
        }
        Insert: {
          address: string
          booking_url?: string | null
          created_at?: string | null
          description?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          operating_hours?: string | null
          phone: string
          services?: string[] | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          booking_url?: string | null
          created_at?: string | null
          description?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          operating_hours?: string | null
          phone?: string
          services?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gas_stations: {
        Row: {
          address: string
          created_at: string | null
          description: string | null
          google_maps_url: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          operating_hours: string | null
          services: string[] | null
          updated_at: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          description?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          operating_hours?: string | null
          services?: string[] | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          description?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          operating_hours?: string | null
          services?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      health_units: {
        Row: {
          address: string | null
          capacity: number | null
          child_health: boolean | null
          chronic_disease_management: boolean | null
          created_at: string | null
          description: string | null
          email: string | null
          established_year: number | null
          facebook_url: string | null
          family_planning: boolean | null
          free_services: boolean | null
          google_maps_url: string | null
          health_education: boolean | null
          id: string
          image_url: string | null
          is_active: boolean | null
          logo_url: string | null
          name: string
          operating_hours: string | null
          phone: string | null
          phone2: string | null
          prenatal_care: boolean | null
          rating: number | null
          services: string[] | null
          target_groups: string[] | null
          type: string
          updated_at: string | null
          vaccination_available: boolean | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          child_health?: boolean | null
          chronic_disease_management?: boolean | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          established_year?: number | null
          facebook_url?: string | null
          family_planning?: boolean | null
          free_services?: boolean | null
          google_maps_url?: string | null
          health_education?: boolean | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          operating_hours?: string | null
          phone?: string | null
          phone2?: string | null
          prenatal_care?: boolean | null
          rating?: number | null
          services?: string[] | null
          target_groups?: string[] | null
          type: string
          updated_at?: string | null
          vaccination_available?: boolean | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          capacity?: number | null
          child_health?: boolean | null
          chronic_disease_management?: boolean | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          established_year?: number | null
          facebook_url?: string | null
          family_planning?: boolean | null
          free_services?: boolean | null
          google_maps_url?: string | null
          health_education?: boolean | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          operating_hours?: string | null
          phone?: string | null
          phone2?: string | null
          prenatal_care?: boolean | null
          rating?: number | null
          services?: string[] | null
          target_groups?: string[] | null
          type?: string
          updated_at?: string | null
          vaccination_available?: boolean | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      hospital_ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          hospital_id: string | null
          id: string
          rating: number
          updated_at: string | null
          user_id: string | null
          user_name: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          hospital_id?: string | null
          id?: string
          rating: number
          updated_at?: string | null
          user_id?: string | null
          user_name: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          hospital_id?: string | null
          id?: string
          rating?: number
          updated_at?: string | null
          user_id?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "hospital_ratings_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          address: string | null
          ambulance_available: boolean | null
          average_rating: number | null
          bed_capacity: number | null
          cardiology_available: boolean | null
          created_at: string | null
          description: string | null
          email: string | null
          emergency_phone: string | null
          emergency_services: boolean | null
          established_year: number | null
          facebook_url: string | null
          google_maps_url: string | null
          icu_available: boolean | null
          id: string
          image_url: string | null
          insurance_accepted: string[] | null
          is_active: boolean | null
          lab_services: boolean | null
          logo_url: string | null
          maternity_available: boolean | null
          name: string
          neurology_available: boolean | null
          oncology_available: boolean | null
          operating_hours: string | null
          parking_available: boolean | null
          pediatrics_available: boolean | null
          pharmacy_available: boolean | null
          phone: string | null
          phone2: string | null
          radiology_services: boolean | null
          rating: number | null
          specialties: string[] | null
          surgery_available: boolean | null
          total_ratings: number | null
          type: string
          updated_at: string | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          ambulance_available?: boolean | null
          average_rating?: number | null
          bed_capacity?: number | null
          cardiology_available?: boolean | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          emergency_phone?: string | null
          emergency_services?: boolean | null
          established_year?: number | null
          facebook_url?: string | null
          google_maps_url?: string | null
          icu_available?: boolean | null
          id?: string
          image_url?: string | null
          insurance_accepted?: string[] | null
          is_active?: boolean | null
          lab_services?: boolean | null
          logo_url?: string | null
          maternity_available?: boolean | null
          name: string
          neurology_available?: boolean | null
          oncology_available?: boolean | null
          operating_hours?: string | null
          parking_available?: boolean | null
          pediatrics_available?: boolean | null
          pharmacy_available?: boolean | null
          phone?: string | null
          phone2?: string | null
          radiology_services?: boolean | null
          rating?: number | null
          specialties?: string[] | null
          surgery_available?: boolean | null
          total_ratings?: number | null
          type: string
          updated_at?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          ambulance_available?: boolean | null
          average_rating?: number | null
          bed_capacity?: number | null
          cardiology_available?: boolean | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          emergency_phone?: string | null
          emergency_services?: boolean | null
          established_year?: number | null
          facebook_url?: string | null
          google_maps_url?: string | null
          icu_available?: boolean | null
          id?: string
          image_url?: string | null
          insurance_accepted?: string[] | null
          is_active?: boolean | null
          lab_services?: boolean | null
          logo_url?: string | null
          maternity_available?: boolean | null
          name?: string
          neurology_available?: boolean | null
          oncology_available?: boolean | null
          operating_hours?: string | null
          parking_available?: boolean | null
          pediatrics_available?: boolean | null
          pharmacy_available?: boolean | null
          phone?: string | null
          phone2?: string | null
          radiology_services?: boolean | null
          rating?: number | null
          specialties?: string[] | null
          surgery_available?: boolean | null
          total_ratings?: number | null
          type?: string
          updated_at?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      hotels: {
        Row: {
          address: string
          amenities: string[] | null
          check_in_time: string | null
          check_out_time: string | null
          created_at: string | null
          description: string | null
          email: string | null
          google_maps_url: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          phone: string
          price_range: string | null
          room_types: string[] | null
          star_rating: number | null
          updated_at: string | null
        }
        Insert: {
          address: string
          amenities?: string[] | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          phone: string
          price_range?: string | null
          room_types?: string[] | null
          star_rating?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          amenities?: string[] | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          phone?: string
          price_range?: string | null
          room_types?: string[] | null
          star_rating?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          contact_method: string
          created_at: string
          description: string | null
          employer_id: string
          expires_at: string | null
          id: string
          is_active: boolean
          job_type: string
          latitude: number | null
          location_description: string | null
          longitude: number | null
          moderation_status: string | null
          payment: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          contact_method: string
          created_at?: string
          description?: string | null
          employer_id: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          job_type: string
          latitude?: number | null
          location_description?: string | null
          longitude?: number | null
          moderation_status?: string | null
          payment?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          contact_method?: string
          created_at?: string
          description?: string | null
          employer_id?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          job_type?: string
          latitude?: number | null
          location_description?: string | null
          longitude?: number | null
          moderation_status?: string | null
          payment?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lost_and_found_items: {
        Row: {
          category: string
          contact_details: string
          contact_method: string
          created_at: string
          date_lost_found: string | null
          date_reported: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          latitude: number | null
          location_description: string | null
          longitude: number | null
          status: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          contact_details: string
          contact_method: string
          created_at?: string
          date_lost_found?: string | null
          date_reported?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          latitude?: number | null
          location_description?: string | null
          longitude?: number | null
          status?: string
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          contact_details?: string
          contact_method?: string
          created_at?: string
          date_lost_found?: string | null
          date_reported?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          latitude?: number | null
          location_description?: string | null
          longitude?: number | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mall_cinema: {
        Row: {
          created_at: string | null
          id: string
          mall_id: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mall_id?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mall_id?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "mall_cinema_mall_id_fkey"
            columns: ["mall_id"]
            isOneToOne: false
            referencedRelation: "malls"
            referencedColumns: ["id"]
          },
        ]
      }
      mall_events: {
        Row: {
          created_at: string | null
          event_date: string | null
          id: string
          image_url: string | null
          mall_id: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          event_date?: string | null
          id?: string
          image_url?: string | null
          mall_id?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          event_date?: string | null
          id?: string
          image_url?: string | null
          mall_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "mall_events_mall_id_fkey"
            columns: ["mall_id"]
            isOneToOne: false
            referencedRelation: "malls"
            referencedColumns: ["id"]
          },
        ]
      }
      mall_games: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          mall_id: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          mall_id?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          mall_id?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "mall_games_mall_id_fkey"
            columns: ["mall_id"]
            isOneToOne: false
            referencedRelation: "malls"
            referencedColumns: ["id"]
          },
        ]
      }
      mall_movies: {
        Row: {
          cinema_id: string | null
          created_at: string | null
          genre: string | null
          id: string
          image_url: string | null
          show_time: string | null
          title: string
        }
        Insert: {
          cinema_id?: string | null
          created_at?: string | null
          genre?: string | null
          id?: string
          image_url?: string | null
          show_time?: string | null
          title: string
        }
        Update: {
          cinema_id?: string | null
          created_at?: string | null
          genre?: string | null
          id?: string
          image_url?: string | null
          show_time?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "mall_movies_cinema_id_fkey"
            columns: ["cinema_id"]
            isOneToOne: false
            referencedRelation: "mall_cinema"
            referencedColumns: ["id"]
          },
        ]
      }
      mall_restaurants: {
        Row: {
          created_at: string | null
          cuisine: string | null
          id: string
          logo_url: string | null
          mall_id: string | null
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          cuisine?: string | null
          id?: string
          logo_url?: string | null
          mall_id?: string | null
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          cuisine?: string | null
          id?: string
          logo_url?: string | null
          mall_id?: string | null
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mall_restaurants_mall_id_fkey"
            columns: ["mall_id"]
            isOneToOne: false
            referencedRelation: "malls"
            referencedColumns: ["id"]
          },
        ]
      }
      mall_services: {
        Row: {
          created_at: string | null
          icon: string
          id: string
          mall_id: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          icon: string
          id?: string
          mall_id?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          icon?: string
          id?: string
          mall_id?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "mall_services_mall_id_fkey"
            columns: ["mall_id"]
            isOneToOne: false
            referencedRelation: "malls"
            referencedColumns: ["id"]
          },
        ]
      }
      mall_shops: {
        Row: {
          average_rating: number | null
          category: string | null
          created_at: string | null
          floor: string | null
          id: string
          logo_url: string | null
          mall_id: string | null
          name: string
          phone: string | null
          total_ratings: number | null
          view_count: number | null
        }
        Insert: {
          average_rating?: number | null
          category?: string | null
          created_at?: string | null
          floor?: string | null
          id?: string
          logo_url?: string | null
          mall_id?: string | null
          name: string
          phone?: string | null
          total_ratings?: number | null
          view_count?: number | null
        }
        Update: {
          average_rating?: number | null
          category?: string | null
          created_at?: string | null
          floor?: string | null
          id?: string
          logo_url?: string | null
          mall_id?: string | null
          name?: string
          phone?: string | null
          total_ratings?: number | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mall_shops_mall_id_fkey"
            columns: ["mall_id"]
            isOneToOne: false
            referencedRelation: "malls"
            referencedColumns: ["id"]
          },
        ]
      }
      malls: {
        Row: {
          about: string | null
          address: string | null
          closing_time: string | null
          created_at: string | null
          description: string | null
          google_maps_url: string | null
          id: string
          image_url: string | null
          is_open: boolean | null
          logo_url: string | null
          name: string
          phone: string | null
          rating: number | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          about?: string | null
          address?: string | null
          closing_time?: string | null
          created_at?: string | null
          description?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_open?: boolean | null
          logo_url?: string | null
          name: string
          phone?: string | null
          rating?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          about?: string | null
          address?: string | null
          closing_time?: string | null
          created_at?: string | null
          description?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_open?: boolean | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          rating?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      medical_center_admins: {
        Row: {
          created_at: string
          email: string
          full_name: string
          health_center_id: string | null
          id: string
          is_active: boolean
          permissions: string[] | null
          role: string
          serial_number: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          health_center_id?: string | null
          id?: string
          is_active?: boolean
          permissions?: string[] | null
          role?: string
          serial_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          health_center_id?: string | null
          id?: string
          is_active?: boolean
          permissions?: string[] | null
          role?: string
          serial_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_center_admins_health_center_id_fkey"
            columns: ["health_center_id"]
            isOneToOne: false
            referencedRelation: "book_service_health_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_centers: {
        Row: {
          address: string | null
          appointment_required: boolean | null
          capacity: number | null
          created_at: string | null
          description: string | null
          email: string | null
          equipment: string[] | null
          established_year: number | null
          facebook_url: string | null
          google_maps_url: string | null
          id: string
          image_url: string | null
          insurance_accepted: string[] | null
          is_active: boolean | null
          languages: string[] | null
          logo_url: string | null
          name: string
          operating_hours: string | null
          phone: string | null
          phone2: string | null
          rating: number | null
          services: string[] | null
          specialties: string[] | null
          type: string
          updated_at: string | null
          walk_in_accepted: boolean | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          appointment_required?: boolean | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          equipment?: string[] | null
          established_year?: number | null
          facebook_url?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          insurance_accepted?: string[] | null
          is_active?: boolean | null
          languages?: string[] | null
          logo_url?: string | null
          name: string
          operating_hours?: string | null
          phone?: string | null
          phone2?: string | null
          rating?: number | null
          services?: string[] | null
          specialties?: string[] | null
          type: string
          updated_at?: string | null
          walk_in_accepted?: boolean | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          appointment_required?: boolean | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          equipment?: string[] | null
          established_year?: number | null
          facebook_url?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          insurance_accepted?: string[] | null
          is_active?: boolean | null
          languages?: string[] | null
          logo_url?: string | null
          name?: string
          operating_hours?: string | null
          phone?: string | null
          phone2?: string | null
          rating?: number | null
          services?: string[] | null
          specialties?: string[] | null
          type?: string
          updated_at?: string | null
          walk_in_accepted?: boolean | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      new_admins: {
        Row: {
          created_at: string | null
          email: string
          id: string
          password: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          password: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          password?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      news: {
        Row: {
          category: string
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          moderation_status: string | null
          published_at: string
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          moderation_status?: string | null
          published_at?: string
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          moderation_status?: string | null
          published_at?: string
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          news_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          news_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          news_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_comments_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      news_likes: {
        Row: {
          created_at: string
          id: string
          news_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          news_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          news_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_likes_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      news_media: {
        Row: {
          created_at: string
          file_name: string | null
          file_size: number | null
          id: string
          media_type: string
          media_url: string
          news_id: string
          order_priority: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          id?: string
          media_type: string
          media_url: string
          news_id: string
          order_priority?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          id?: string
          media_type?: string
          media_url?: string
          news_id?: string
          order_priority?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_media_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          onesignal_response: Json | null
          sent_by: string | null
          sent_to: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          onesignal_response?: Json | null
          sent_by?: string | null
          sent_to: string
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          onesignal_response?: Json | null
          sent_by?: string | null
          sent_to?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      nurseries: {
        Row: {
          address: string | null
          age_groups: string[]
          capacity: number | null
          created_at: string | null
          description: string | null
          email: string | null
          established_year: number | null
          facilities: string[] | null
          fees_range: string | null
          google_maps_url: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          logo_url: string | null
          meals_included: boolean | null
          medical_care: boolean | null
          name: string
          operating_hours: string | null
          phone: string | null
          rating: number | null
          transportation: boolean | null
          type: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          age_groups: string[]
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          established_year?: number | null
          facilities?: string[] | null
          fees_range?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          meals_included?: boolean | null
          medical_care?: boolean | null
          name: string
          operating_hours?: string | null
          phone?: string | null
          rating?: number | null
          transportation?: boolean | null
          type: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          age_groups?: string[]
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          established_year?: number | null
          facilities?: string[] | null
          fees_range?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          meals_included?: boolean | null
          medical_care?: boolean | null
          name?: string
          operating_hours?: string | null
          phone?: string | null
          rating?: number | null
          transportation?: boolean | null
          type?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          otp_code: string
          type: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          otp_code: string
          type: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          otp_code?: string
          type?: string
          used_at?: string | null
        }
        Relationships: []
      }
      patient_status_tracking: {
        Row: {
          appointment_id: string | null
          changed_by: string | null
          consultation_duration: number | null
          created_at: string
          id: string
          notes: string | null
          previous_status: string | null
          status: string
          status_changed_at: string
          waiting_time: number | null
        }
        Insert: {
          appointment_id?: string | null
          changed_by?: string | null
          consultation_duration?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          previous_status?: string | null
          status?: string
          status_changed_at?: string
          waiting_time?: number | null
        }
        Update: {
          appointment_id?: string | null
          changed_by?: string | null
          consultation_duration?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          previous_status?: string | null
          status?: string
          status_changed_at?: string
          waiting_time?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_status_tracking_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "book_service_appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_status_tracking_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "medical_center_admins"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacies: {
        Row: {
          address: string
          created_at: string | null
          description: string | null
          email: string | null
          emergency_service: boolean | null
          established_year: number | null
          facebook_url: string | null
          google_maps_url: string | null
          home_delivery: boolean | null
          id: string
          image_url: string | null
          is_active: boolean | null
          languages: string[] | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          operating_hours: string
          parking_available: boolean | null
          phone: string
          phone2: string | null
          rating: number | null
          services: string[] | null
          updated_at: string | null
          whatsapp: string | null
          wheelchair_accessible: boolean | null
        }
        Insert: {
          address: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          emergency_service?: boolean | null
          established_year?: number | null
          facebook_url?: string | null
          google_maps_url?: string | null
          home_delivery?: boolean | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          operating_hours: string
          parking_available?: boolean | null
          phone: string
          phone2?: string | null
          rating?: number | null
          services?: string[] | null
          updated_at?: string | null
          whatsapp?: string | null
          wheelchair_accessible?: boolean | null
        }
        Update: {
          address?: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          emergency_service?: boolean | null
          established_year?: number | null
          facebook_url?: string | null
          google_maps_url?: string | null
          home_delivery?: boolean | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          operating_hours?: string
          parking_available?: boolean | null
          phone?: string
          phone2?: string | null
          rating?: number | null
          services?: string[] | null
          updated_at?: string | null
          whatsapp?: string | null
          wheelchair_accessible?: boolean | null
        }
        Relationships: []
      }
      police_stations: {
        Row: {
          address: string | null
          area: string
          created_at: string
          description: string | null
          google_maps_url: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          show_location: boolean | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          area: string
          created_at?: string
          description?: string | null
          google_maps_url?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          show_location?: boolean | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          area?: string
          created_at?: string
          description?: string | null
          google_maps_url?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          show_location?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      post_offices: {
        Row: {
          address: string | null
          atm_available: boolean | null
          created_at: string | null
          description: string | null
          email: string | null
          established_year: number | null
          google_maps_url: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          languages: string[] | null
          name: string
          operating_hours: string | null
          parking_available: boolean | null
          phone: string | null
          rating: number | null
          services: string[] | null
          updated_at: string | null
          wheelchair_accessible: boolean | null
        }
        Insert: {
          address?: string | null
          atm_available?: boolean | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          established_year?: number | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          languages?: string[] | null
          name: string
          operating_hours?: string | null
          parking_available?: boolean | null
          phone?: string | null
          rating?: number | null
          services?: string[] | null
          updated_at?: string | null
          wheelchair_accessible?: boolean | null
        }
        Update: {
          address?: string | null
          atm_available?: boolean | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          established_year?: number | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          languages?: string[] | null
          name?: string
          operating_hours?: string | null
          parking_available?: boolean | null
          phone?: string | null
          rating?: number | null
          services?: string[] | null
          updated_at?: string | null
          wheelchair_accessible?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          email_notifications: boolean | null
          first_name: string | null
          full_name: string | null
          gender: string | null
          id: string
          last_name: string | null
          phone: string | null
          preferred_language: string | null
          privacy_settings: Json | null
          push_notifications: boolean | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          email_notifications?: boolean | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          preferred_language?: string | null
          privacy_settings?: Json | null
          push_notifications?: boolean | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          email_notifications?: boolean | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          preferred_language?: string | null
          privacy_settings?: Json | null
          push_notifications?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string
          device_info: Json | null
          id: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          id?: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          id?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      queue_notifications: {
        Row: {
          clinic_id: string | null
          created_at: string
          created_for: string | null
          id: string
          is_read: boolean
          message: string
          notification_type: string
          read_at: string | null
          severity: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          created_for?: string | null
          id?: string
          is_read?: boolean
          message: string
          notification_type: string
          read_at?: string | null
          severity?: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          created_for?: string | null
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: string
          read_at?: string | null
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "queue_notifications_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "book_service_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_notifications_created_for_fkey"
            columns: ["created_for"]
            isOneToOne: false
            referencedRelation: "medical_center_admins"
            referencedColumns: ["id"]
          },
        ]
      }
      school_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name_ar: string
          name_en: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_ar: string
          name_en: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string
          name_en?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      school_transport_matches: {
        Row: {
          created_at: string
          id: string
          offer_id: string
          request_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          offer_id: string
          request_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          offer_id?: string
          request_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_transport_matches_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "safe_transport_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_transport_matches_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "school_transport_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_transport_matches_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "safe_transport_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_transport_matches_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "school_transport_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      school_transport_requests: {
        Row: {
          contact_number: string
          created_at: string
          description: string | null
          from_location: string
          id: string
          number_of_children: number
          price: number | null
          status: string
          to_location: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_number: string
          created_at?: string
          description?: string | null
          from_location: string
          id?: string
          number_of_children: number
          price?: number | null
          status?: string
          to_location: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_number?: string
          created_at?: string
          description?: string | null
          from_location?: string
          id?: string
          number_of_children?: number
          price?: number | null
          status?: string
          to_location?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      schools: {
        Row: {
          address: string | null
          boarding: boolean | null
          capacity: number | null
          category_id: string | null
          created_at: string | null
          curriculum: string | null
          description: string | null
          email: string | null
          established_year: number | null
          facilities: string[] | null
          fees_range: string | null
          google_maps_url: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          languages: string[] | null
          level: string
          logo_url: string | null
          name: string
          phone: string | null
          rating: number | null
          special_needs: boolean | null
          transportation: boolean | null
          type: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          boarding?: boolean | null
          capacity?: number | null
          category_id?: string | null
          created_at?: string | null
          curriculum?: string | null
          description?: string | null
          email?: string | null
          established_year?: number | null
          facilities?: string[] | null
          fees_range?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          languages?: string[] | null
          level: string
          logo_url?: string | null
          name: string
          phone?: string | null
          rating?: number | null
          special_needs?: boolean | null
          transportation?: boolean | null
          type: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          boarding?: boolean | null
          capacity?: number | null
          category_id?: string | null
          created_at?: string | null
          curriculum?: string | null
          description?: string | null
          email?: string | null
          established_year?: number | null
          facilities?: string[] | null
          fees_range?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          languages?: string[] | null
          level?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          rating?: number | null
          special_needs?: boolean | null
          transportation?: boolean | null
          type?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schools_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "school_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      serial_auth: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          serial_number: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          serial_number: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          serial_number?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      shop_ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          shop_id: string | null
          updated_at: string | null
          user_id: string | null
          user_name: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          shop_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_name: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          shop_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_ratings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "mall_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_views: {
        Row: {
          id: string
          session_id: string | null
          shop_id: string | null
          user_agent: string | null
          user_ip: string | null
          viewed_at: string | null
        }
        Insert: {
          id?: string
          session_id?: string | null
          shop_id?: string | null
          user_agent?: string | null
          user_ip?: string | null
          viewed_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string | null
          shop_id?: string | null
          user_agent?: string | null
          user_ip?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_views_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "mall_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          address: string | null
          age_groups: string[] | null
          available_hours: string | null
          created_at: string | null
          description: string | null
          education_level: string
          email: string | null
          experience_years: number | null
          google_maps_url: string | null
          hourly_rate: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          name: string
          phone: string | null
          qualifications: string[] | null
          rating: number | null
          specialization: string
          subjects: string[]
          teaching_methods: string[] | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          age_groups?: string[] | null
          available_hours?: string | null
          created_at?: string | null
          description?: string | null
          education_level: string
          email?: string | null
          experience_years?: number | null
          google_maps_url?: string | null
          hourly_rate?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          name: string
          phone?: string | null
          qualifications?: string[] | null
          rating?: number | null
          specialization: string
          subjects: string[]
          teaching_methods?: string[] | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          age_groups?: string[] | null
          available_hours?: string | null
          created_at?: string | null
          description?: string | null
          education_level?: string
          email?: string | null
          experience_years?: number | null
          google_maps_url?: string | null
          hourly_rate?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          name?: string
          phone?: string | null
          qualifications?: string[] | null
          rating?: number | null
          specialization?: string
          subjects?: string[]
          teaching_methods?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      trip_passengers: {
        Row: {
          dropoff_station_id: string | null
          id: string
          notes: string | null
          passenger_id: string | null
          passenger_name: string
          passenger_phone: string
          pickup_station_id: string | null
          registered_at: string
          status: string
          trip_id: string
        }
        Insert: {
          dropoff_station_id?: string | null
          id?: string
          notes?: string | null
          passenger_id?: string | null
          passenger_name: string
          passenger_phone: string
          pickup_station_id?: string | null
          registered_at?: string
          status?: string
          trip_id: string
        }
        Update: {
          dropoff_station_id?: string | null
          id?: string
          notes?: string | null
          passenger_id?: string | null
          passenger_name?: string
          passenger_phone?: string
          pickup_station_id?: string | null
          registered_at?: string
          status?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_passengers_dropoff_station_id_fkey"
            columns: ["dropoff_station_id"]
            isOneToOne: false
            referencedRelation: "trip_stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_passengers_pickup_station_id_fkey"
            columns: ["pickup_station_id"]
            isOneToOne: false
            referencedRelation: "trip_stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_passengers_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          review_type: string
          reviewee_id: string
          reviewer_id: string
          trip_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          review_type: string
          reviewee_id: string
          reviewer_id: string
          trip_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          review_type?: string
          reviewee_id?: string
          reviewer_id?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_reviews_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_stations: {
        Row: {
          created_at: string
          dropoff_time: string | null
          id: string
          is_dropoff_only: boolean | null
          is_pickup_only: boolean | null
          latitude: number | null
          longitude: number | null
          pickup_time: string | null
          station_name: string
          station_order: number
          trip_id: string
        }
        Insert: {
          created_at?: string
          dropoff_time?: string | null
          id?: string
          is_dropoff_only?: boolean | null
          is_pickup_only?: boolean | null
          latitude?: number | null
          longitude?: number | null
          pickup_time?: string | null
          station_name: string
          station_order: number
          trip_id: string
        }
        Update: {
          created_at?: string
          dropoff_time?: string | null
          id?: string
          is_dropoff_only?: boolean | null
          is_pickup_only?: boolean | null
          latitude?: number | null
          longitude?: number | null
          pickup_time?: string | null
          station_name?: string
          station_order?: number
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_stations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          arrival_time: string | null
          contact_number: string
          created_at: string
          current_passengers: number | null
          departure_time: string | null
          description: string | null
          driver_id: string
          from_location: string
          id: string
          max_passengers: number | null
          price: number | null
          status: string
          title: string
          to_location: string
          trip_type: string
          updated_at: string
          vehicle_type: string | null
        }
        Insert: {
          arrival_time?: string | null
          contact_number: string
          created_at?: string
          current_passengers?: number | null
          departure_time?: string | null
          description?: string | null
          driver_id: string
          from_location: string
          id?: string
          max_passengers?: number | null
          price?: number | null
          status?: string
          title: string
          to_location: string
          trip_type?: string
          updated_at?: string
          vehicle_type?: string | null
        }
        Update: {
          arrival_time?: string | null
          contact_number?: string
          created_at?: string
          current_passengers?: number | null
          departure_time?: string | null
          description?: string | null
          driver_id?: string
          from_location?: string
          id?: string
          max_passengers?: number | null
          price?: number | null
          status?: string
          title?: string
          to_location?: string
          trip_type?: string
          updated_at?: string
          vehicle_type?: string | null
        }
        Relationships: []
      }
      universities: {
        Row: {
          accreditation: string | null
          address: string | null
          admission_requirements: string[] | null
          created_at: string | null
          description: string | null
          email: string | null
          established_year: number | null
          faculties: string[] | null
          google_maps_url: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          logo_url: string | null
          name: string
          phone: string | null
          programs: string[] | null
          rating: number | null
          tuition_fees: Json | null
          type: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          accreditation?: string | null
          address?: string | null
          admission_requirements?: string[] | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          established_year?: number | null
          faculties?: string[] | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          phone?: string | null
          programs?: string[] | null
          rating?: number | null
          tuition_fees?: Json | null
          type: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          accreditation?: string | null
          address?: string | null
          admission_requirements?: string[] | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          established_year?: number | null
          faculties?: string[] | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          programs?: string[] | null
          rating?: number | null
          tuition_fees?: Json | null
          type?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      user_news_activity: {
        Row: {
          created_at: string
          id: string
          last_visited_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_visited_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_visited_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          report_reason: string
          reported_content_id: string
          reported_content_type: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          report_reason: string
          reported_content_id: string
          reported_content_type: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          report_reason?: string
          reported_content_id?: string
          reported_content_type?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
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
      visitor_counter: {
        Row: {
          counter_value: number
          created_at: string | null
          id: number
          last_updated: string | null
        }
        Insert: {
          counter_value?: number
          created_at?: string | null
          id?: number
          last_updated?: string | null
        }
        Update: {
          counter_value?: number
          created_at?: string | null
          id?: number
          last_updated?: string | null
        }
        Relationships: []
      }
      worship_place_events: {
        Row: {
          created_at: string | null
          description: string | null
          event_date: string | null
          event_time: string | null
          id: string
          image_url: string | null
          title: string
          worship_place_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          event_time?: string | null
          id?: string
          image_url?: string | null
          title: string
          worship_place_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          event_time?: string | null
          id?: string
          image_url?: string | null
          title?: string
          worship_place_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "worship_place_events_worship_place_id_fkey"
            columns: ["worship_place_id"]
            isOneToOne: false
            referencedRelation: "worship_places"
            referencedColumns: ["id"]
          },
        ]
      }
      worship_place_services: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          worship_place_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          worship_place_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          worship_place_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "worship_place_services_worship_place_id_fkey"
            columns: ["worship_place_id"]
            isOneToOne: false
            referencedRelation: "worship_places"
            referencedColumns: ["id"]
          },
        ]
      }
      worship_places: {
        Row: {
          address: string | null
          capacity: number | null
          created_at: string | null
          description: string | null
          google_maps_url: string | null
          id: string
          image_url: string | null
          images: string[] | null
          imam_name: string | null
          is_accessible: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          phone: string | null
          prayer_times: Json | null
          services: Json | null
          type: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          imam_name?: string | null
          is_accessible?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          phone?: string | null
          prayer_times?: Json | null
          services?: Json | null
          type: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          imam_name?: string | null
          is_accessible?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          phone?: string | null
          prayer_times?: Json | null
          services?: Json | null
          type?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      youth_clubs: {
        Row: {
          activities: string[] | null
          address: string | null
          age_groups: string[] | null
          capacity: number | null
          created_at: string | null
          description: string | null
          email: string | null
          established_year: number | null
          facilities: string[] | null
          free_activities: boolean | null
          google_maps_url: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          languages: string[] | null
          logo_url: string | null
          membership_fee: number | null
          membership_required: boolean | null
          name: string
          operating_hours: string | null
          phone: string | null
          rating: number | null
          type: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          activities?: string[] | null
          address?: string | null
          age_groups?: string[] | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          established_year?: number | null
          facilities?: string[] | null
          free_activities?: boolean | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          languages?: string[] | null
          logo_url?: string | null
          membership_fee?: number | null
          membership_required?: boolean | null
          name: string
          operating_hours?: string | null
          phone?: string | null
          rating?: number | null
          type: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          activities?: string[] | null
          address?: string | null
          age_groups?: string[] | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          established_year?: number | null
          facilities?: string[] | null
          free_activities?: boolean | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          languages?: string[] | null
          logo_url?: string | null
          membership_fee?: number | null
          membership_required?: boolean | null
          name?: string
          operating_hours?: string | null
          phone?: string | null
          rating?: number | null
          type?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      safe_transport_requests: {
        Row: {
          created_at: string | null
          description: string | null
          from_location: string | null
          id: string | null
          number_of_children: number | null
          price: number | null
          status: string | null
          to_location: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          from_location?: string | null
          id?: string | null
          number_of_children?: number | null
          price?: number | null
          status?: string | null
          to_location?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          from_location?: string | null
          id?: string | null
          number_of_children?: number | null
          price?: number | null
          status?: string | null
          to_location?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_doctor: {
        Args: {
          p_admin_id?: string
          p_consultation_fee?: number
          p_doctor_name: string
          p_email?: string
          p_health_center_id: string
          p_phone?: string
          p_specialization: string
          p_working_hours?: string
        }
        Returns: Json
      }
      add_patient_to_queue: {
        Args: {
          p_appointment_time?: string
          p_clinic_id: string
          p_medical_history?: string
          p_notes?: string
          p_patient_age?: number
          p_patient_gender?: string
          p_patient_name: string
          p_patient_phone: string
          p_user_id?: string
        }
        Returns: Json
      }
      admin_logout: {
        Args: { p_session_token: string }
        Returns: Json
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      calculate_queue_position: {
        Args: { appointment_uuid: string; clinic_uuid: string }
        Returns: number
      }
      call_next_patient: {
        Args: { p_admin_id?: string; p_clinic_id: string }
        Returns: Json
      }
      call_specific_patient: {
        Args: {
          p_admin_id?: string
          p_clinic_id: string
          p_queue_number: number
        }
        Returns: Json
      }
      check_admin_exists: {
        Args: { admin_email: string }
        Returns: boolean
      }
      check_admin_permissions: {
        Args: { admin_email: string; required_permission: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: { limit_count?: number; operation: string; time_window?: unknown }
        Returns: boolean
      }
      cleanup_expired_otps: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      confirm_delete_all_patients: {
        Args: {
          p_admin_id?: string
          p_clinic_id: string
          p_confirmation_code?: string
        }
        Returns: Json
      }
      create_safe_transport_match: {
        Args: { _offer_id: string; _request_id: string }
        Returns: string
      }
      delete_all_patients_from_queue: {
        Args: { p_admin_id?: string; p_clinic_id: string }
        Returns: Json
      }
      delete_doctor: {
        Args: { p_admin_id?: string; p_clinic_id: string }
        Returns: Json
      }
      get_center_doctors: {
        Args: { p_health_center_id: string }
        Returns: {
          clinic_id: string
          consultation_fee: number
          created_at: string
          current_queue_number: number
          doctor_name: string
          email: string
          is_available: boolean
          phone: string
          specialization: string
          total_patients_today: number
          updated_at: string
          working_hours: string
        }[]
      }
      get_daily_queues: {
        Args: { center_id?: string }
        Returns: {
          clinic_id: string
          clinic_name: string
          completed_patients: number
          current_serving: number
          doctor_name: string
          in_progress_patients: number
          is_active: boolean
          next_number: number
          queue_status: string
          specialization: string
          total_patients: number
          waiting_patients: number
        }[]
      }
      get_doctors_statistics: {
        Args: { p_health_center_id?: string }
        Returns: {
          active_doctors: number
          average_queue_length: number
          inactive_doctors: number
          total_appointments_today: number
          total_doctors: number
          total_patients_today: number
        }[]
      }
      get_lost_found_contact: {
        Args: { item_id: string }
        Returns: {
          contact_details: string
          contact_method: string
        }[]
      }
      get_most_viewed_shops: {
        Args: { p_limit?: number; p_mall_id?: string }
        Returns: {
          mall_name: string
          shop_id: string
          shop_name: string
          view_count: number
        }[]
      }
      get_next_queue_number: {
        Args: { clinic_uuid: string }
        Returns: number
      }
      get_patients_count_before_delete: {
        Args: { p_clinic_id: string }
        Returns: {
          clinic_name: string
          completed_patients: number
          in_progress_patients: number
          pending_patients: number
          total_patients: number
        }[]
      }
      get_queue_details: {
        Args: { p_clinic_id: string }
        Returns: {
          appointment_time: string
          created_at: string
          patient_id: string
          patient_name: string
          queue_number: number
          status: string
          waiting_time_minutes: number
        }[]
      }
      get_queue_patients: {
        Args: { clinic_uuid: string; queue_date?: string }
        Returns: {
          appointment_id: string
          appointment_time: string
          created_at: string
          medical_history: string
          notes: string
          patient_age: number
          patient_gender: string
          patient_name: string
          patient_phone: string
          queue_number: number
          queue_position: number
          status: string
        }[]
      }
      get_queue_statistics: {
        Args: { p_clinic_id: string; p_queue_date?: string }
        Returns: {
          average_waiting_time: number
          cancelled_patients: number
          completed_patients: number
          current_serving: number
          in_progress_patients: number
          next_number: number
          total_patients: number
          waiting_patients: number
        }[]
      }
      get_shop_view_stats: {
        Args: { p_shop_id: string }
        Returns: {
          this_month_views: number
          this_week_views: number
          today_views: number
          total_views: number
        }[]
      }
      get_status_statistics: {
        Args: { p_clinic_id?: string; p_date?: string }
        Returns: {
          count: number
          percentage: number
          status: string
        }[]
      }
      get_transport_contact: {
        Args: { request_id: string }
        Returns: {
          contact_details: string
          contact_method: string
        }[]
      }
      get_verified_users_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_visitor_counter: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      increment_shop_view: {
        Args: {
          p_session_id?: string
          p_shop_id: string
          p_user_agent?: string
          p_user_ip?: string
        }
        Returns: number
      }
      increment_visitor_counter: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      is_medical_admin: {
        Args: { user_email?: string }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      log_sensitive_access: {
        Args: {
          access_type: string
          accessed_id: string
          accessed_table: string
        }
        Returns: undefined
      }
      mark_patient_examined: {
        Args: {
          p_admin_id?: string
          p_appointment_id: string
          p_consultation_duration?: number
          p_notes?: string
        }
        Returns: Json
      }
      match_embeddings: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          content_id: string
          content_type: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      medical_admin_login: {
        Args: { admin_email: string }
        Returns: Json
      }
      remove_patient_from_queue: {
        Args: {
          p_admin_id?: string
          p_appointment_id: string
          p_reason?: string
        }
        Returns: Json
      }
      reorganize_queue_numbers: {
        Args: { p_admin_id?: string; p_clinic_id: string }
        Returns: Json
      }
      reset_daily_queue: {
        Args: { p_admin_id?: string; p_clinic_id: string }
        Returns: Json
      }
      reset_queue_completely: {
        Args: { p_admin_id?: string; p_clinic_id: string }
        Returns: Json
      }
      simple_admin_login: {
        Args: { admin_email: string }
        Returns: Json
      }
      simple_delete_all_patients: {
        Args: { p_admin_id?: string; p_clinic_id: string }
        Returns: Json
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      update_admin_info: {
        Args: {
          admin_email: string
          new_active?: boolean
          new_name?: string
          new_permissions?: string[]
        }
        Returns: Json
      }
      update_doctor: {
        Args: {
          p_admin_id?: string
          p_clinic_id: string
          p_consultation_fee?: number
          p_doctor_name?: string
          p_email?: string
          p_is_available?: boolean
          p_phone?: string
          p_specialization?: string
          p_working_hours?: string
        }
        Returns: Json
      }
      update_doctor_availability: {
        Args: {
          clinic_uuid: string
          is_available: boolean
          vacation_end?: string
          vacation_start?: string
        }
        Returns: boolean
      }
      update_patient_status: {
        Args: {
          p_admin_id?: string
          p_appointment_id: string
          p_new_status: string
        }
        Returns: Json
      }
      update_patient_status_with_tracking: {
        Args: {
          p_admin_id?: string
          p_appointment_id: string
          p_consultation_duration?: number
          p_new_status: string
          p_notes?: string
          p_waiting_time?: number
        }
        Returns: Json
      }
      update_queue_statistics: {
        Args: { p_clinic_id: string }
        Returns: Json
      }
      update_serial_usage: {
        Args: { serial_num: string }
        Returns: boolean
      }
      upsert_medical_admin: {
        Args: {
          admin_active?: boolean
          admin_email: string
          admin_name: string
          admin_permissions?: string[]
          admin_role?: string
        }
        Returns: Json
      }
      validate_admin_session: {
        Args: { p_session_token: string }
        Returns: Json
      }
      validate_serial: {
        Args: { serial_num: string }
        Returns: boolean
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    },
  },
} as const
