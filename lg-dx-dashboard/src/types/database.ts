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
      users: {
        Row: {
          id: string
          email: string
          name: string
          github_username: string | null
          avatar_url: string | null
          timezone: string | null
          preferences: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          name: string
          github_username?: string | null
          avatar_url?: string | null
          timezone?: string | null
          preferences?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          github_username?: string | null
          avatar_url?: string | null
          timezone?: string | null
          preferences?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      daily_reflections: {
        Row: {
          id: string
          user_id: string | null
          date: string
          time_part: 'morning' | 'afternoon' | 'evening'
          understanding_score: number | null
          concentration_score: number | null
          achievement_score: number | null
          condition: '좋음' | '보통' | '나쁨' | null
          total_score: number | null
          subjects: Json | null
          achievements: string[] | null
          challenges: string[] | null
          tomorrow_goals: string[] | null
          notes: string | null
          github_commits: number | null
          github_issues: number | null
          github_prs: number | null
          github_reviews: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          date: string
          time_part: 'morning' | 'afternoon' | 'evening'
          understanding_score?: number | null
          concentration_score?: number | null
          achievement_score?: number | null
          condition?: '좋음' | '보통' | '나쁨' | null
          subjects?: Json | null
          achievements?: string[] | null
          challenges?: string[] | null
          tomorrow_goals?: string[] | null
          notes?: string | null
          github_commits?: number | null
          github_issues?: number | null
          github_prs?: number | null
          github_reviews?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          date?: string
          time_part?: 'morning' | 'afternoon' | 'evening'
          understanding_score?: number | null
          concentration_score?: number | null
          achievement_score?: number | null
          condition?: '좋음' | '보통' | '나쁨' | null
          subjects?: Json | null
          achievements?: string[] | null
          challenges?: string[] | null
          tomorrow_goals?: string[] | null
          notes?: string | null
          github_commits?: number | null
          github_issues?: number | null
          github_prs?: number | null
          github_reviews?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      subjects: {
        Row: {
          id: string
          name: string
          category: string
          subcategory: string | null
          description: string | null
          color_code: string | null
          icon: string | null
          difficulty_level: number | null
          estimated_hours: number | null
          prerequisites: string[] | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          category: string
          subcategory?: string | null
          description?: string | null
          color_code?: string | null
          icon?: string | null
          difficulty_level?: number | null
          estimated_hours?: number | null
          prerequisites?: string[] | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          category?: string
          subcategory?: string | null
          description?: string | null
          color_code?: string | null
          icon?: string | null
          difficulty_level?: number | null
          estimated_hours?: number | null
          prerequisites?: string[] | null
          is_active?: boolean | null
          created_at?: string | null
        }
      }
      daily_statistics: {
        Row: {
          id: string
          user_id: string | null
          date: string
          reflections_completed: number | null
          total_reflection_score: number | null
          average_reflection_score: number | null
          calculated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          date: string
          reflections_completed?: number | null
          total_reflection_score?: number | null
          average_reflection_score?: number | null
          calculated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          date?: string
          reflections_completed?: number | null
          total_reflection_score?: number | null
          average_reflection_score?: number | null
          calculated_at?: string | null
        }
      }
      github_activities: {
        Row: {
          id: string
          user_id: string
          date: string
          commits_count: number
          repositories_count: number
          repositories: string[]
          languages: string[]
          additions: number
          deletions: number
          files_changed: number
          activity_level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          commits_count?: number
          repositories_count?: number
          repositories?: string[]
          languages?: string[]
          additions?: number
          deletions?: number
          files_changed?: number
          activity_level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          commits_count?: number
          repositories_count?: number
          repositories?: string[]
          languages?: string[]
          additions?: number
          deletions?: number
          files_changed?: number
          activity_level?: number
          created_at?: string
          updated_at?: string
        }
      }
      github_integrations: {
        Row: {
          id: string
          user_id: string
          github_username: string
          github_user_id: number
          access_token: string | null
          refresh_token: string | null
          scope: string
          connected_at: string
          last_sync_at: string | null
          is_active: boolean
          sync_enabled: boolean
          webhook_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          github_username: string
          github_user_id: number
          access_token?: string | null
          refresh_token?: string | null
          scope?: string
          connected_at?: string
          last_sync_at?: string | null
          is_active?: boolean
          sync_enabled?: boolean
          webhook_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          github_username?: string
          github_user_id?: number
          access_token?: string | null
          refresh_token?: string | null
          scope?: string
          connected_at?: string
          last_sync_at?: string | null
          is_active?: boolean
          sync_enabled?: boolean
          webhook_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      github_activity_records: {
        Row: {
          id: string
          user_id: string
          date: string
          repository_name: string
          commit_sha: string | null
          commit_message: string | null
          commits_count: number
          additions: number
          deletions: number
          files_changed: number
          languages: string[]
          event_type: 'push' | 'pull_request' | 'issues' | 'create' | 'delete'
          created_at: string
        }
        Insert: {
          id: string
          user_id: string
          date: string
          repository_name: string
          commit_sha?: string | null
          commit_message?: string | null
          commits_count?: number
          additions?: number
          deletions?: number
          files_changed?: number
          languages?: string[]
          event_type: 'push' | 'pull_request' | 'issues' | 'create' | 'delete'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          repository_name?: string
          commit_sha?: string | null
          commit_message?: string | null
          commits_count?: number
          additions?: number
          deletions?: number
          files_changed?: number
          languages?: string[]
          event_type?: 'push' | 'pull_request' | 'issues' | 'create' | 'delete'
          created_at?: string
        }
      }
      github_sync_status: {
        Row: {
          id: string
          user_id: string
          sync_status: 'idle' | 'syncing' | 'error' | 'completed'
          sync_progress: number
          last_sync_at: string | null
          next_sync_at: string | null
          total_repositories: number
          synced_repositories: number
          total_commits: number
          synced_commits: number
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          sync_status?: 'idle' | 'syncing' | 'error' | 'completed'
          sync_progress?: number
          last_sync_at?: string | null
          next_sync_at?: string | null
          total_repositories?: number
          synced_repositories?: number
          total_commits?: number
          synced_commits?: number
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          sync_status?: 'idle' | 'syncing' | 'error' | 'completed'
          sync_progress?: number
          last_sync_at?: string | null
          next_sync_at?: string | null
          total_repositories?: number
          synced_repositories?: number
          total_commits?: number
          synced_commits?: number
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      github_settings: {
        Row: {
          id: string
          user_id: string
          auto_sync: boolean
          sync_interval: number
          include_private_repos: boolean
          track_languages: string[]
          exclude_repositories: string[]
          webhook_enabled: boolean
          notifications_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          auto_sync?: boolean
          sync_interval?: number
          include_private_repos?: boolean
          track_languages?: string[]
          exclude_repositories?: string[]
          webhook_enabled?: boolean
          notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          auto_sync?: boolean
          sync_interval?: number
          include_private_repos?: boolean
          track_languages?: string[]
          exclude_repositories?: string[]
          webhook_enabled?: boolean
          notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      github_webhook_logs: {
        Row: {
          id: string
          delivery_id: string | null
          event_type: string
          repository_name: string | null
          sender: string | null
          success: boolean
          error_message: string | null
          processed_at: string
        }
        Insert: {
          id?: string
          delivery_id?: string | null
          event_type: string
          repository_name?: string | null
          sender?: string | null
          success?: boolean
          error_message?: string | null
          processed_at?: string
        }
        Update: {
          id?: string
          delivery_id?: string | null
          event_type?: string
          repository_name?: string | null
          sender?: string | null
          success?: boolean
          error_message?: string | null
          processed_at?: string
        }
      }
    }
    Views: {
      github_activity_stats: {
        Row: {
          user_id: string
          total_days: number
          total_commits: number
          avg_commits_per_day: number
          max_commits_per_day: number
          active_days: number
          activity_rate: number
          all_repositories: string[]
          all_languages: string[]
        }
      }
      recent_github_activities: {
        Row: {
          id: string
          user_id: string
          date: string
          commits_count: number
          repositories_count: number
          repositories: string[]
          languages: string[]
          additions: number
          deletions: number
          files_changed: number
          activity_level: number
          created_at: string
          updated_at: string
          github_username: string
        }
      }
    }
    Functions: {
      calculate_github_activity_level: {
        Args: {
          commits_count: number
        }
        Returns: number
      }
      cleanup_old_github_records: {
        Args: {}
        Returns: number
      }
      calculate_daily_statistics: {
        Args: {
          target_user_id: string
          target_date: string
        }
        Returns: void
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