'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AvatarUpload } from '@/components/ui/AvatarUpload'
import type { Profile } from '@/types/user'

interface ProfileClientProps {
  user: Profile
}

interface ValidationErrors {
  phone?: string
  bio?: string
}

export function ProfileClient({ user: initialUser }: ProfileClientProps) {
  const [user, setUser] = useState(initialUser)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isMobile, setIsMobile] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    phone: user.phone || '',
    bio: user.bio || ''
  })

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const validateField = (name: keyof typeof formData, value: string): string | undefined => {
    switch (name) {
      case 'phone':
        if (value && value.trim().length < 10) return 'Phone number must be at least 10 digits'
        if (value && value.trim().length > 20) return 'Phone number must be less than 20 characters'
        break
      
      case 'bio':
        if (value && value.trim().length > 500) return 'Bio must be less than 500 characters'
        break
    }
    return undefined
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}
    
    newErrors.phone = validateField('phone', formData.phone)
    newErrors.bio = validateField('bio', formData.bio)
    
    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== undefined)
  }

  const handleFieldChange = (name: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error for this field
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setLoading(true)
    const supabase = createClient()

    try {
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({
          phone: formData.phone.trim() || null,
          bio: formData.bio.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setUser(updatedProfile)
      setIsEditing(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)

    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      phone: user.phone || '',
      bio: user.bio || ''
    })
    setErrors({})
    setIsEditing(false)
  }

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    setUser(prev => ({ ...prev, avatar_url: newAvatarUrl }))
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <p className="text-green-800 text-sm font-medium">Profile updated successfully!</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#222222] mb-2">Profile</h1>
        <p className="text-[#717171]">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Avatar Section */}
        <div className={`${isMobile ? 'p-6' : 'p-8'} border-b border-gray-200`}>
          <div className="flex items-start space-x-6">
            <AvatarUpload
              currentAvatarUrl={user.avatar_url}
              userId={user.id}
              onAvatarUpdate={handleAvatarUpdate}
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-[#222222] mb-1">{user.full_name}</h2>
              <p className="text-[#717171] mb-2">{user.email}</p>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FF385C] bg-opacity-10 text-[#FF385C] capitalize">
                {user.user_type}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className={`${isMobile ? 'p-6' : 'p-8'}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#222222]">Personal Information</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#FF385C] hover:bg-[#FF385C] hover:bg-opacity-10 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Full Name - Read Only */}
            <div>
              <label className="block text-sm font-medium text-[#222222] mb-2">
                Full name
              </label>
              <div className="flex items-center justify-between">
                <p className="text-[#717171] py-3">{user.full_name}</p>
                <span className="text-xs text-[#717171] bg-gray-100 px-2 py-1 rounded">Read only</span>
              </div>
            </div>

            {/* Email - Read Only */}
            <div>
              <label className="block text-sm font-medium text-[#222222] mb-2">
                Email address
              </label>
              <div className="flex items-center justify-between">
                <p className="text-[#717171] py-3">{user.email}</p>
                <span className="text-xs text-[#717171] bg-gray-100 px-2 py-1 rounded">Read only</span>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-[#222222] mb-2">
                Phone number
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    className={`
                      w-full border rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition-colors
                      ${isMobile ? 'px-4 py-3 text-base' : 'px-4 py-3'}
                      ${errors.phone ? 'border-red-500' : 'border-gray-300'}
                    `}
                    placeholder="Enter your phone number (optional)"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              ) : (
                <p className="text-[#717171] py-3">{user.phone || 'Not provided'}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-[#222222] mb-2">
                About you
              </label>
              {isEditing ? (
                <div>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => handleFieldChange('bio', e.target.value)}
                    className={`
                      w-full border rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition-colors
                      ${isMobile ? 'px-4 py-3 text-base' : 'px-4 py-3'}
                      ${errors.bio ? 'border-red-500' : 'border-gray-300'}
                    `}
                    placeholder="Tell us about yourself (optional)"
                  />
                  {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio}</p>}
                  <p className="text-gray-500 text-xs mt-1">{formData.bio.length}/500 characters</p>
                </div>
              ) : (
                <p className="text-[#717171] py-3">{user.bio || 'No bio provided'}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className={`flex pt-6 ${isMobile ? 'flex-col gap-3' : 'justify-end space-x-3'}`}>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className={`px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 ${isMobile ? 'w-full order-2' : ''}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className={`px-6 py-2 text-sm font-medium text-white bg-[#FF385C] rounded-lg hover:bg-[#E31C5F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF385C] disabled:opacity-50 ${isMobile ? 'w-full order-1 min-h-[44px]' : 'min-w-[80px]'}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}