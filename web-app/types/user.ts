import { Tables } from './database'

export type UserType = 'host' | 'guest'

export type Profile = Tables<'profiles'>

export interface User {
  id: string
  email: string
  full_name: string
  user_type: UserType
  phone?: string | null
  avatar_url?: string | null
  bio?: string | null
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    user_type?: UserType
  }
}

export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  full_name: string
  user_type: UserType
  acceptTerms: boolean
}

export interface LoginFormData {
  email: string
  password: string
  rememberMe?: boolean
}

export interface AuthError {
  message: string
  field?: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: AuthError | null
}