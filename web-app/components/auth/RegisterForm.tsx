'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { RegisterFormData, UserType } from '@/types/user'

export function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    user_type: 'guest',
    acceptTerms: false
  })

  const handleChange = (field: keyof RegisterFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  const validateForm = (): string | null => {
    if (!formData.full_name.trim()) return 'Full name is required'
    if (!formData.email.trim()) return 'Email is required'
    if (!formData.password) return 'Password is required'
    if (formData.password.length < 6) return 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match'
    if (!formData.acceptTerms) return 'You must accept the terms of service'
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

      const { data: existingProfiles } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', formData.email)
        .limit(1)

      if (existingProfiles && existingProfiles.length > 0) {
        setError('An account with this email already exists')
        setLoading(false)
        return
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            user_type: formData.user_type
          }
        }
      })

      if (signUpError) {
        throw signUpError
      }

      if (data?.user && !data?.user?.email_confirmed_at) {
        setError('Please check your email and click the confirmation link to complete your registration.')
        setLoading(false)
        return
      }

      if (data?.user?.email_confirmed_at) {
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            placeholder="Full name"
            disabled={loading}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition-all text-[#222222] placeholder-[#717171]"
          />
        </div>

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
            placeholder="Password (min. 6 characters)"
            disabled={loading}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition-all text-[#222222] placeholder-[#717171]"
          />
        </div>

        <div>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            placeholder="Confirm password"
            disabled={loading}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition-all text-[#222222] placeholder-[#717171]"
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-[#222222]">I want to:</p>
          <div className="space-y-2">
            <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-[#222222] transition-colors">
              <input
                type="radio"
                name="user_type"
                value="guest"
                checked={formData.user_type === 'guest'}
                onChange={(e) => handleChange('user_type', e.target.value as UserType)}
                className="text-[#FF385C] focus:ring-[#FF385C]"
                disabled={loading}
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-[#222222]">Book places to stay</p>
                <p className="text-xs text-[#717171]">Find and book unique accommodations</p>
              </div>
            </label>
            
            <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-[#222222] transition-colors">
              <input
                type="radio"
                name="user_type"
                value="host"
                checked={formData.user_type === 'host'}
                onChange={(e) => handleChange('user_type', e.target.value as UserType)}
                className="text-[#FF385C] focus:ring-[#FF385C]"
                disabled={loading}
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-[#222222]">Host my property</p>
                <p className="text-xs text-[#717171]">List your space and welcome guests</p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-start">
          <input
            id="accept-terms"
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={(e) => handleChange('acceptTerms', e.target.checked)}
            className="h-4 w-4 text-[#FF385C] focus:ring-[#FF385C] border-gray-300 rounded mt-0.5"
            disabled={loading}
            required
          />
          <label htmlFor="accept-terms" className="ml-2 block text-xs text-[#717171]">
            I agree to PaxBnb's{' '}
            <a href="/terms" className="text-[#222222] underline hover:text-[#FF385C]">
              Terms of Service
            </a>
            ,{' '}
            <a href="/privacy" className="text-[#222222] underline hover:text-[#FF385C]">
              Privacy Policy
            </a>
            , and{' '}
            <a href="/nondiscrimination" className="text-[#222222] underline hover:text-[#FF385C]">
              Nondiscrimination Policy
            </a>
          </label>
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
              Creating account...
            </span>
          ) : (
            'Agree and continue'
          )}
        </button>

        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-[#717171]">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('/auth/login')}
              className="text-[#222222] font-semibold underline hover:text-[#FF385C] transition-colors"
              disabled={loading}
            >
              Log in
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}