'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { LoginFormData } from '@/types/user'

export function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  })

  const handleChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  const validateForm = (): string | null => {
    if (!formData.email.trim()) return 'Email is required'
    if (!formData.password) return 'Password is required'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (signInError) {
        throw signInError
      }

      if (data?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', data.user.id)
          .single()

        const dashboardPath = profile?.user_type === 'host' ? '/dashboard/host' : '/dashboard/guest'
        router.push(dashboardPath)
        router.refresh()
      }
    } catch (err: any) {
      if (err.message === 'Invalid login credentials') {
        setError('Invalid email or password. Please try again.')
      } else if (err.message === 'Email not confirmed') {
        setError('Please check your email and click the confirmation link to verify your account.')
      } else {
        setError(err.message || 'An error occurred during login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!formData.email.trim()) {
      setError('Please enter your email address first')
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        throw error
      }

      setError('Password reset instructions have been sent to your email.')
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="text-center mb-8">
        <svg viewBox="0 0 32 32" className="w-12 h-12 text-[#FF385C] mx-auto mb-4" fill="currentColor">
          <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.666.06 2.932-.604 3.737-.357.435-.843.75-1.407.75a2.32 2.32 0 0 1-.928-.196l-.632-.318c-.065-.031-.126-.063-.192-.095l-.801-.407c-.65-.34-1.397-.729-2.166-1.155-.768-.426-1.559-.891-2.34-1.386-.781-.495-1.551-1.02-2.295-1.573a65.005 65.005 0 0 1-2.203-1.711l-.807-.662-.448-.386-.415.394-.688.655a65.457 65.457 0 0 1-2.105 1.673c-.744.552-1.513 1.076-2.295 1.571-.781.495-1.572.96-2.34 1.386-.543.302-1.077.587-1.594.853l-.572.302-.8.407c-.184.096-.361.193-.604.321l-.352.183a2.316 2.316 0 0 1-.928.196c-.564 0-1.05-.315-1.407-.75-.664-.805-1.271-2.071-.604-3.737l.145-.353c.986-2.297 5.147-11.006 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1z"/>
        </svg>
        <h1 className="text-2xl font-semibold text-[#222222]">Welcome back</h1>
        <p className="text-[#717171] mt-2">Log in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className={`px-4 py-3 rounded-lg text-sm ${
            error.includes('Password reset instructions') 
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-600'
          }`}>
            {error}
          </div>
        )}

        <div>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Email address"
            disabled={loading}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition-all text-[#222222] placeholder-[#717171]"
          />
        </div>

        <div>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="Password"
            disabled={loading}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition-all text-[#222222] placeholder-[#717171]"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) => handleChange('rememberMe', e.target.checked)}
              className="h-4 w-4 text-[#FF385C] focus:ring-[#FF385C] border-gray-300 rounded"
              disabled={loading}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-[#717171]">
              Remember me
            </label>
          </div>

          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={loading}
            className="text-sm text-[#222222] underline hover:text-[#FF385C] disabled:opacity-50 transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#FF385C] text-white py-3 rounded-lg font-semibold hover:bg-[#E31C5F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          ) : (
            'Continue'
          )}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-[#717171]">or</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-[#717171]">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('/auth/register')}
              className="text-[#222222] font-semibold underline hover:text-[#FF385C] transition-colors"
              disabled={loading}
            >
              Sign up
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}