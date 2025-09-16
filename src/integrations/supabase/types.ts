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
      city_departments: {
        Row: {
          color: string
          created_at: string
          description: string | null
          email: string
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
        Relationships: [
          {
            foreignKeyName: "lost_and_found_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
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
        }
        Insert: {
          created_at?: string | null
          cuisine?: string | null
          id?: string
          logo_url?: string | null
          mall_id?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          cuisine?: string | null
          id?: string
          logo_url?: string | null
          mall_id?: string | null
          name?: string
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
          category: string | null
          created_at: string | null
          floor: string | null
          id: string
          logo_url: string | null
          mall_id: string | null
          name: string
          view_count: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          floor?: string | null
          id?: string
          logo_url?: string | null
          mall_id?: string | null
          name: string
          view_count?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          floor?: string | null
          id?: string
          logo_url?: string | null
          mall_id?: string | null
          name?: string
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
      shop_views: {
        Row: {
          id: string
          shop_id: string | null
          user_ip: string | null
          user_agent: string | null
          viewed_at: string | null
          session_id: string | null
        }
        Insert: {
          id?: string
          shop_id?: string | null
          user_ip?: string | null
          user_agent?: string | null
          viewed_at?: string | null
          session_id?: string | null
        }
        Update: {
          id?: string
          shop_id?: string | null
          user_ip?: string | null
          user_agent?: string | null
          viewed_at?: string | null
          session_id?: string | null
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
          {
            foreignKeyName: "news_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
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
      police_stations: {
        Row: {
          address: string | null
          area: string
          created_at: string
          description: string | null
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
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          show_location?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string
          full_name: string
          gender: string | null
          id: string
          job_title: string | null
          location_details: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          full_name: string
          gender?: string | null
          id?: string
          job_title?: string | null
          location_details?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          gender?: string | null
          id?: string
          job_title?: string | null
          location_details?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          area: number | null
          bathrooms: number | null
          bedrooms: number | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          features: Json | null
          floors: number | null
          id: string
          images: Json | null
          latitude: number | null
          likes_count: number | null
          location: string
          longitude: number | null
          owner_id: string | null
          price: number
          property_type: string
          status: string | null
          title: string
          transaction_type: string
          updated_at: string | null
          views_count: number | null
          year_built: number | null
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json | null
          floors?: number | null
          id?: string
          images?: Json | null
          latitude?: number | null
          likes_count?: number | null
          location: string
          longitude?: number | null
          owner_id?: string | null
          price: number
          property_type: string
          status?: string | null
          title: string
          transaction_type: string
          updated_at?: string | null
          views_count?: number | null
          year_built?: number | null
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json | null
          floors?: number | null
          id?: string
          images?: Json | null
          latitude?: number | null
          likes_count?: number | null
          location?: string
          longitude?: number | null
          owner_id?: string | null
          price?: number
          property_type?: string
          status?: string | null
          title?: string
          transaction_type?: string
          updated_at?: string | null
          views_count?: number | null
          year_built?: number | null
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
      user_real_estate_preferences: {
        Row: {
          created_at: string | null
          id: string
          preferences: Json | null
          updated_at: string | null
          user_id: string | null
          user_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string | null
          user_id?: string | null
          user_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string | null
          user_id?: string | null
          user_type?: string
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
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      check_rate_limit: {
        Args: { limit_count?: number; operation: string; time_window?: unknown }
        Returns: boolean
      }
      create_safe_transport_match: {
        Args: { _offer_id: string; _request_id: string }
        Returns: string
      }
      get_lost_found_contact: {
        Args: { item_id: string }
        Returns: {
          contact_details: string
          contact_method: string
        }[]
      }
      get_property_contact: {
        Args: { property_id: string }
        Returns: {
          contact_details: string
          contact_method: string
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
      increment_property_likes: {
        Args: { property_id: string }
        Returns: undefined
      }
      increment_property_views: {
        Args: { property_id: string }
        Returns: undefined
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
        Returns: string
      }
      log_sensitive_access: {
        Args: {
          access_type: string
          accessed_id: string
          accessed_table: string
        }
        Returns: undefined
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
