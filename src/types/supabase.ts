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
          created_at: string
          date: string
          doctor_id: string
          id: string
          patient_id: string
          status: string
          time: string
          type: string
        }
        Insert: {
          created_at?: string
          date: string
          doctor_id: string
          id?: string
          patient_id: string
          status: string
          time: string
          type: string
        }
        Update: {
          created_at?: string
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
      discussions: {
        Row: {
          id: string
          author_id: string
          author_name: string
          author_type: string
          avatar_url: string | null
          topic: string
          title: string
          content: string
          created_at: string
          likes: number
          comments: number
          verified: boolean
        }
        Insert: {
          id?: string
          author_id: string
          author_name: string
          author_type: string
          avatar_url?: string | null
          topic: string
          title: string
          content: string
          created_at?: string
          likes?: number
          comments?: number
          verified?: boolean
        }
        Update: {
          id?: string
          author_id?: string
          author_name?: string
          author_type?: string
          avatar_url?: string | null
          topic?: string
          title?: string
          content?: string
          created_at?: string
          likes?: number
          comments?: number
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "discussions_author_id_fkey"
            columns: ["author_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      discussion_comments: {
        Row: {
          id: string
          discussion_id: string
          author_id: string
          author_name: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          discussion_id: string
          author_id: string
          author_name: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          discussion_id?: string
          author_id?: string
          author_name?: string
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_comments_author_id_fkey"
            columns: ["author_id"]
            referencedRelation: "profiles"
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
      doctors: {
        Row: {
          available: boolean
          created_at: string
          education: string
          experience: string
          fee: number
          hospital: string
          id: string
          image: string
          location: string
          name: string
          next_available: string
          online: boolean
          rating: number
          reviews: number
          specialty: string
          user_id: string
        }
        Insert: {
          available?: boolean
          created_at?: string
          education?: string
          experience?: string
          fee?: number
          hospital?: string
          id?: string
          image?: string
          location?: string
          name: string
          next_available?: string
          online?: boolean
          rating?: number
          reviews?: number
          specialty: string
          user_id?: string
        }
        Update: {
          available?: boolean
          created_at?: string
          education?: string
          experience?: string
          fee?: number
          hospital?: string
          id?: string
          image?: string
          location?: string
          name?: string
          next_available?: string
          online?: boolean
          rating?: number
          reviews?: number
          specialty?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctors_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      health_topics: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image: string
          name: string
          price: number
          stock: number
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          image: string
          name: string
          price: number
          stock: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image?: string
          name?: string
          price?: number
          stock?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          role: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          role?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          role?: string
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
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}
