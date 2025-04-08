export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string | null
          date: string
          doctor_id: string
          id: string
          patient_id: string
          status: string
          time: string
          type: string
        }
        Insert: {
          created_at?: string | null
          date: string
          doctor_id: string
          id?: string
          patient_id: string
          status: string
          time: string
          type: string
        }
        Update: {
          created_at?: string | null
          date?: string
          doctor_id?: string
          id?: string
          patient_id?: string
          status?: string
          time?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      doctors: {
        Row: {
          available: boolean
          created_at: string | null
          education: string
          email: string
          experience: string
          gender: string
          id: string
          image_url: string
          languages: string[]
          name: string
          phone: string
          rating: number
          specialization: string
          user_id: string
        }
        Insert: {
          available?: boolean
          created_at?: string | null
          education: string
          email: string
          experience: string
          gender: string
          id?: string
          image_url: string
          languages: string[]
          name: string
          phone: string
          rating?: number
          specialization: string
          user_id: string
        }
        Update: {
          available?: boolean
          created_at?: string | null
          education?: string
          email?: string
          experience?: string
          gender?: string
          id?: string
          image_url?: string
          languages?: string[]
          name?: string
          phone?: string
          rating?: number
          specialization?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctors_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: string
          image_url: string
          name: string
          price: number
          rating: number
          stock: number
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          id?: string
          image_url: string
          name: string
          price: number
          rating?: number
          stock: number
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string
          name?: string
          price?: number
          rating?: number
          stock?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          phone: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      discussions: {
        Row: {
          id: string
          title: string
          content: string
          user_id: string
          created_at: string
          updated_at: string
          topic_id: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          user_id: string
          created_at?: string
          updated_at?: string
          topic_id: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussions_topic_id_fkey"
            columns: ["topic_id"]
            referencedRelation: "health_topics"
            referencedColumns: ["id"]
          }
        ]
      }
      discussion_comments: {
        Row: {
          id: string
          content: string
          user_id: string
          discussion_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          user_id: string
          discussion_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          user_id?: string
          discussion_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_comments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_comments_discussion_id_fkey"
            columns: ["discussion_id"]
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          }
        ]
      }
      health_topics: {
        Row: {
          id: string
          name: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          created_at?: string
        }
        Relationships: []
      }
      // New tables for blood donation feature
      donation_centers: {
        Row: {
          id: string
          name: string
          address: string
          city: string
          state: string
          postal_code: string
          phone: string
          email: string
          operating_hours: string
          image_url: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          city: string
          state: string
          postal_code: string
          phone: string
          email: string
          operating_hours: string
          image_url: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          city?: string
          state?: string
          postal_code?: string
          phone?: string
          email?: string
          operating_hours?: string
          image_url?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      donor_profiles: {
        Row: {
          id: string
          user_id: string
          blood_type: string
          last_donation_date?: string
          donation_count: number
          eligible_to_donate: boolean
          next_eligible_date?: string
          medical_conditions?: string[]
          notifications_enabled: boolean
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          blood_type: string
          last_donation_date?: string
          donation_count?: number
          eligible_to_donate?: boolean
          next_eligible_date?: string
          medical_conditions?: string[]
          notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          blood_type?: string
          last_donation_date?: string
          donation_count?: number
          eligible_to_donate?: boolean
          next_eligible_date?: string
          medical_conditions?: string[]
          notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donor_profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      blood_requests: {
        Row: {
          id: string
          patient_name: string
          blood_type: string
          hospital: string
          urgency: string
          date_needed: string
          reason?: string
          status: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          patient_name: string
          blood_type: string
          hospital: string
          urgency: string
          date_needed: string
          reason?: string
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_name?: string
          blood_type?: string
          hospital?: string
          urgency?: string
          date_needed?: string
          reason?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      donation_slots: {
        Row: {
          id: string
          center_id: string
          slot_date: string
          slot_time: string
          capacity: number
          booked: number
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          center_id: string
          slot_date: string
          slot_time: string
          capacity: number
          booked?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          center_id?: string
          slot_date?: string
          slot_time?: string
          capacity?: number
          booked?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donation_slots_center_id_fkey"
            columns: ["center_id"]
            referencedRelation: "donation_centers"
            referencedColumns: ["id"]
          }
        ]
      }
      donation_appointments: {
        Row: {
          id: string
          user_id: string
          center_id: string
          slot_id: string
          blood_type: string
          status: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          center_id: string
          slot_id: string
          blood_type: string
          status: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          center_id?: string
          slot_id?: string
          blood_type?: string
          status?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donation_appointments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_appointments_center_id_fkey"
            columns: ["center_id"]
            referencedRelation: "donation_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_appointments_slot_id_fkey"
            columns: ["slot_id"]
            referencedRelation: "donation_slots"
            referencedColumns: ["id"]
          }
        ]
      }
      blood_needs: {
        Row: {
          id: string
          center_id: string
          blood_type: string
          urgency: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          center_id: string
          blood_type: string
          urgency: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          center_id?: string
          blood_type?: string
          urgency?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blood_needs_center_id_fkey"
            columns: ["center_id"]
            referencedRelation: "donation_centers"
            referencedColumns: ["id"]
          }
        ]
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
