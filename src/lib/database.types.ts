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
      log_files: {
        Row: {
          id: string
          name: string
          size: number
          type: string
          uploaded_at: string
          line_count: number
          status: 'uploaded' | 'parsing' | 'parsed' | 'error'
        }
        Insert: {
          id?: string
          name: string
          size: number
          type?: string
          uploaded_at?: string
          line_count?: number
          status?: 'uploaded' | 'parsing' | 'parsed' | 'error'
        }
        Update: {
          id?: string
          name?: string
          size?: number
          type?: string
          uploaded_at?: string
          line_count?: number
          status?: 'uploaded' | 'parsing' | 'parsed' | 'error'
        }
      }
      log_entries: {
        Row: {
          id: string
          log_file_id: string
          line_number: number
          timestamp: string | null
          level: string | null
          source: string | null
          message: string
          parsed_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          log_file_id: string
          line_number: number
          timestamp?: string | null
          level?: string | null
          source?: string | null
          message: string
          parsed_data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          log_file_id?: string
          line_number?: number
          timestamp?: string | null
          level?: string | null
          source?: string | null
          message?: string
          parsed_data?: Json
          created_at?: string
        }
      }
      security_alerts: {
        Row: {
          id: string
          log_entry_id: string | null
          alert_type: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          log_entry_id?: string | null
          alert_type: string
          severity?: 'low' | 'medium' | 'high' | 'critical'
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          log_entry_id?: string | null
          alert_type?: string
          severity?: 'low' | 'medium' | 'high' | 'critical'
          description?: string
          created_at?: string
        }
      }
      analysis_sessions: {
        Row: {
          id: string
          name: string
          created_at: string
          last_accessed: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          last_accessed?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          last_accessed?: string
        }
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
  }
}
