import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './info'

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
)

export type User = {
  id: string
  email: string
  name: string
}

export type AuthState = {
  user: User | null
  loading: boolean
}