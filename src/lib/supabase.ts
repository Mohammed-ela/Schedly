import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserProfile = {
  id: string
  email: string
  role: 'admin' | 'user'
  full_name: string | null
  created_at: string
}

export type Slot = {
  id: string
  date: string
  start_time: string
  end_time: string
  title: string
  max_bookings: number
  created_by: string
  created_at: string
}

export type Booking = {
  id: string
  slot_id: string
  user_id: string
  user_email: string
  user_name: string | null
  status: 'confirmed' | 'cancelled'
  created_at: string
  slot?: Slot
}
