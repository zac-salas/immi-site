import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface PostcardRow {
  id:              string
  image_url:       string
  message:         string
  sender_name:     string
  recipient_name:  string 
  stamp_url:       string
  created_at:      string
  expires_at:      string
}