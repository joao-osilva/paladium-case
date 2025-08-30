'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'

interface AddPropertyModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  userId: string
}

interface ValidationErrors {
  title?: string
  description?: string
  price_per_night?: string
  max_guests?: string
  bedrooms?: string
  beds?: string
  bathrooms?: string
  address?: string
  city?: string
  country?: string
  images?: string
}

export function AddPropertyModal({ isOpen, onClose, onSuccess, userId }: AddPropertyModalProps) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [images, setImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_per_night: '',
    max_guests: '2',
    bedrooms: '1',
    beds: '1',
    bathrooms: '1',
    address: '',
    city: '',
    country: ''
  })

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Validation functions based on schema constraints
  const validateField = (name: keyof typeof formData, value: string): string | undefined => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'Title is required'
        if (value.trim().length < 10) return 'Title must be at least 10 characters'
        if (value.trim().length > 100) return 'Title must be less than 100 characters'
        break
      
      case 'description':
        if (!value.trim()) return 'Description is required'
        if (value.trim().length < 20) return 'Description must be at least 20 characters'
        if (value.trim().length > 500) return 'Description must be less than 500 characters'
        break
      
      case 'price_per_night':
        if (!value) return 'Price is required'
        const price = parseFloat(value)
        if (isNaN(price) || price <= 0) return 'Price must be greater than $0'
        if (price > 10000) return 'Price must be less than $10,000 per night'
        break
      
      case 'max_guests':
        const guests = parseInt(value)
        if (isNaN(guests) || guests <= 0) return 'Must accommodate at least 1 guest'
        if (guests > 20) return 'Maximum 20 guests allowed'
        break
      
      case 'bedrooms':
        const bedrooms = parseInt(value)
        if (isNaN(bedrooms) || bedrooms < 0) return 'Bedrooms cannot be negative'
        if (bedrooms > 10) return 'Maximum 10 bedrooms allowed'
        break
      
      case 'beds':
        const beds = parseInt(value)
        if (isNaN(beds) || beds <= 0) return 'Must have at least 1 bed'
        if (beds > 20) return 'Maximum 20 beds allowed'
        break
      
      case 'bathrooms':
        const bathrooms = parseFloat(value)
        if (isNaN(bathrooms) || bathrooms <= 0) return 'Must have at least 0.5 bathrooms'
        if (bathrooms > 10) return 'Maximum 10 bathrooms allowed'
        break
      
      case 'address':
        if (!value.trim()) return 'Address is required'
        if (value.trim().length < 5) return 'Please enter a complete address'
        break
      
      case 'city':
        if (!value.trim()) return 'City is required'
        if (value.trim().length < 2) return 'City name must be at least 2 characters'
        break
      
      case 'country':
        if (!value.trim()) return 'Country is required'
        if (value.trim().length < 2) return 'Country name must be at least 2 characters'
        break
    }
    return undefined
  }

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: ValidationErrors = {}
    
    if (stepNumber === 1) {
      newErrors.title = validateField('title', formData.title)
      newErrors.description = validateField('description', formData.description)
      newErrors.price_per_night = validateField('price_per_night', formData.price_per_night)
    } else if (stepNumber === 2) {
      newErrors.max_guests = validateField('max_guests', formData.max_guests)
      newErrors.bedrooms = validateField('bedrooms', formData.bedrooms)
      newErrors.beds = validateField('beds', formData.beds)
      newErrors.bathrooms = validateField('bathrooms', formData.bathrooms)
    } else if (stepNumber === 3) {
      newErrors.address = validateField('address', formData.address)
      newErrors.city = validateField('city', formData.city)
      newErrors.country = validateField('country', formData.country)
    } else if (stepNumber === 4) {
      if (images.length === 0) {
        newErrors.images = 'At least one photo is required'
      }
    }
    
    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== undefined)
  }

  const handleFieldChange = (name: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }

  const handleFieldBlur = (name: keyof typeof formData) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    const error = validateField(name, formData[name])
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price_per_night: '',
      max_guests: '2',
      bedrooms: '1',
      beds: '1',
      bathrooms: '1',
      address: '',
      city: '',
      country: ''
    })
    setImages([])
    setPreviewUrls([])
    setStep(1)
    setErrors({})
    setTouched({})
    setShowSuccess(false)
  }

  const handleClose = () => {
    if (!loading) {
      resetForm()
      onClose()
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      const maxSize = 5 * 1024 * 1024 // 5MB
      
      if (!validTypes.includes(file.type)) {
        alert(`${file.name}: Only JPEG, PNG, WebP, and GIF images are allowed`)
        return false
      }
      
      if (file.size > maxSize) {
        alert(`${file.name}: File size must be less than 5MB`)
        return false
      }
      
      return true
    })

    if (images.length + validFiles.length > 10) {
      alert('Maximum 10 images allowed')
      return
    }

    setImages(prev => [...prev, ...validFiles])
    
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newPreviewUrls])
    
    // Clear images error if files added
    if (validFiles.length > 0) {
      setErrors(prev => ({ ...prev, images: undefined }))
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]) // Clean up blob URL
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
    
    if (images.length === 1) {
      setErrors(prev => ({ ...prev, images: 'At least one photo is required' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(4)) return

    setLoading(true)
    const supabase = createClient()

    try {
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          host_id: userId,
          title: formData.title.trim(),
          description: formData.description.trim(),
          price_per_night: parseFloat(formData.price_per_night),
          max_guests: parseInt(formData.max_guests),
          bedrooms: parseInt(formData.bedrooms),
          beds: parseInt(formData.beds),
          bathrooms: parseFloat(formData.bathrooms),
          address: formData.address.trim(),
          city: formData.city.trim(),
          country: formData.country.trim()
        })
        .select()
        .single()

      if (propertyError) throw propertyError

      if (property && images.length > 0) {
        const imagePromises = images.map(async (image, index) => {
          const fileExt = image.name.split('.').pop()
          const fileName = `${property.id}/${Date.now()}-${index}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(fileName, image)
          
          if (uploadError) throw uploadError
          
          const { data: { publicUrl } } = supabase.storage
            .from('property-images')
            .getPublicUrl(fileName)
          
          return supabase
            .from('property_images')
            .insert({
              property_id: property.id,
              url: publicUrl,
              display_order: index
            })
        })

        await Promise.all(imagePromises)
      }

      // Show success animation
      setShowSuccess(true)
      setTimeout(() => {
        resetForm()
        onSuccess()
        onClose()
      }, 1500)

    } catch (error) {
      console.error('Error creating property:', error)
      alert('Failed to create property. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const prevStep = () => setStep(step - 1)

  const getStepTitle = () => {
    const titles = ['Basic Information', 'Property Details', 'Location', 'Photos']
    return `${titles[step - 1]} (${step}/4)`
  }

  if (showSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={() => {}} title="Success!" showCloseButton={false}>
        <div className={`text-center ${isMobile ? 'p-8' : 'p-12'}`}>
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#222222] mb-2">Property Created!</h3>
          <p className="text-[#717171]">Your property has been successfully listed.</p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={getStepTitle()}
      size="lg"
      showCloseButton={!loading}
    >
      {/* Mobile-optimized Progress indicator */}
      <div className={`${isMobile ? 'px-4 pt-2 pb-4' : 'px-6 pt-4'}`}>
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`
                ${isMobile ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'}
                rounded-full flex items-center justify-center font-medium
                ${stepNum < step ? 'bg-green-500 text-white' :
                  stepNum === step ? 'bg-[#FF385C] text-white' :
                  'bg-gray-200 text-gray-600'}
              `}>
                {stepNum < step ? '✓' : stepNum}
              </div>
              {stepNum < 4 && (
                <div className={`
                  ${isMobile ? 'w-8 h-1' : 'w-16 h-1'}
                  ${stepNum < step ? 'bg-green-500' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className={`space-y-6 ${isMobile ? 'p-4' : 'p-6'}`}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#222222] mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  onBlur={() => handleFieldBlur('title')}
                  className={`
                    w-full border rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition-colors
                    ${isMobile ? 'px-4 py-4 text-base' : 'px-4 py-3'}
                    ${errors.title ? 'border-red-500' : 'border-gray-300'}
                  `}
                  placeholder="Beautiful apartment in downtown"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                <p className="text-gray-500 text-xs mt-1">{formData.title.length}/100 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#222222] mb-2">
                  Description *
                </label>
                <textarea
                  rows={isMobile ? 3 : 4}
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  onBlur={() => handleFieldBlur('description')}
                  className={`
                    w-full border rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition-colors
                    ${isMobile ? 'px-4 py-4 text-base' : 'px-4 py-3'}
                    ${errors.description ? 'border-red-500' : 'border-gray-300'}
                  `}
                  placeholder="Describe what makes your place special, the neighborhood, nearby attractions..."
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                <p className="text-gray-500 text-xs mt-1">{formData.description.length}/500 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#222222] mb-2">
                  Price per night (USD) *
                </label>
                <div className="relative">
                  <span className={`absolute text-gray-500 ${isMobile ? 'left-4 top-4' : 'left-3 top-3'}`}>$</span>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    step="0.01"
                    value={formData.price_per_night}
                    onChange={(e) => handleFieldChange('price_per_night', e.target.value)}
                    onBlur={() => handleFieldBlur('price_per_night')}
                    className={`
                      w-full border rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition-colors
                      ${isMobile ? 'pl-10 pr-4 py-4 text-base' : 'pl-8 pr-4 py-3'}
                      ${errors.price_per_night ? 'border-red-500' : 'border-gray-300'}
                    `}
                    placeholder="100.00"
                  />
                </div>
                {errors.price_per_night && <p className="text-red-500 text-sm mt-1">{errors.price_per_night}</p>}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={nextStep}
                className={`btn-primary ${isMobile ? 'w-full py-4' : ''}`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={`space-y-6 ${isMobile ? 'p-4' : 'p-6'}`}>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <div>
                <label className="block text-sm font-medium text-[#222222] mb-2">
                  Max guests *
                </label>
                <select
                  value={formData.max_guests}
                  onChange={(e) => handleFieldChange('max_guests', e.target.value)}
                  className={`
                    w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent
                    ${isMobile ? 'px-4 py-4 text-base' : 'px-4 py-3'}
                  `}
                >
                  {Array.from({length: 20}, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#222222] mb-2">
                  Bedrooms *
                </label>
                <select
                  value={formData.bedrooms}
                  onChange={(e) => handleFieldChange('bedrooms', e.target.value)}
                  className={`
                    w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent
                    ${isMobile ? 'px-4 py-4 text-base' : 'px-4 py-3'}
                  `}
                >
                  <option value="0">Studio</option>
                  {Array.from({length: 10}, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num} bedroom{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#222222] mb-2">
                  Beds *
                </label>
                <select
                  value={formData.beds}
                  onChange={(e) => handleFieldChange('beds', e.target.value)}
                  className={`
                    w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent
                    ${isMobile ? 'px-4 py-4 text-base' : 'px-4 py-3'}
                  `}
                >
                  {Array.from({length: 20}, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num} bed{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#222222] mb-2">
                  Bathrooms *
                </label>
                <select
                  value={formData.bathrooms}
                  onChange={(e) => handleFieldChange('bathrooms', e.target.value)}
                  className={`
                    w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent
                    ${isMobile ? 'px-4 py-4 text-base' : 'px-4 py-3'}
                  `}
                >
                  <option value="0.5">0.5 bath</option>
                  <option value="1">1 bath</option>
                  <option value="1.5">1.5 baths</option>
                  <option value="2">2 baths</option>
                  <option value="2.5">2.5 baths</option>
                  <option value="3">3 baths</option>
                  <option value="3.5">3.5 baths</option>
                  <option value="4">4 baths</option>
                  <option value="5">5+ baths</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Tip</h3>
                  <div className="mt-1 text-sm text-blue-700">
                    Consider your space carefully. Accurate details help guests find the perfect match for their needs.
                  </div>
                </div>
              </div>
            </div>

            <div className={`flex pt-4 ${isMobile ? 'flex-col gap-3' : 'justify-between'}`}>
              <button
                type="button"
                onClick={prevStep}
                className={`btn-secondary ${isMobile ? 'w-full py-4 order-2' : ''}`}
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className={`btn-primary ${isMobile ? 'w-full py-4 order-1' : ''}`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={`space-y-6 ${isMobile ? 'p-4' : 'p-6'}`}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#222222] mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  onBlur={() => handleFieldBlur('address')}
                  className={`
                    w-full border rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition-colors
                    ${isMobile ? 'px-4 py-4 text-base' : 'px-4 py-3'}
                    ${errors.address ? 'border-red-500' : 'border-gray-300'}
                  `}
                  placeholder="123 Main Street, Apt 4B"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <div>
                  <label className="block text-sm font-medium text-[#222222] mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    onBlur={() => handleFieldBlur('city')}
                    className={`
                      w-full border rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition-colors
                      ${isMobile ? 'px-4 py-4 text-base' : 'px-4 py-3'}
                      ${errors.city ? 'border-red-500' : 'border-gray-300'}
                    `}
                    placeholder="New York"
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#222222] mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleFieldChange('country', e.target.value)}
                    onBlur={() => handleFieldBlur('country')}
                    className={`
                      w-full border rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition-colors
                      ${isMobile ? 'px-4 py-4 text-base' : 'px-4 py-3'}
                      ${errors.country ? 'border-red-500' : 'border-gray-300'}
                    `}
                    placeholder="United States"
                  />
                  {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Privacy Note</h3>
                  <div className="mt-1 text-sm text-yellow-700">
                    Your exact address won't be shared until after a booking is confirmed.
                  </div>
                </div>
              </div>
            </div>

            <div className={`flex pt-4 ${isMobile ? 'flex-col gap-3' : 'justify-between'}`}>
              <button
                type="button"
                onClick={prevStep}
                className={`btn-secondary ${isMobile ? 'w-full py-4 order-2' : ''}`}
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className={`btn-primary ${isMobile ? 'w-full py-4 order-1' : ''}`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className={`space-y-6 ${isMobile ? 'p-4' : 'p-6'}`}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#222222] mb-2">
                  Property Photos * (Max 10)
                </label>
                <p className="text-sm text-[#717171] mb-3">
                  Upload high-quality photos that showcase your property's best features
                </p>
                
                {/* Upload Area */}
                <div 
                  className={`
                    border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors hover:border-[#FF385C] hover:bg-gray-50
                    ${isMobile ? 'p-6' : 'p-8'}
                    ${errors.images ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                  `}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg className={`mx-auto text-gray-400 ${isMobile ? 'h-10 w-10' : 'h-12 w-12'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  <div className="mt-2">
                    <p className={`text-[#717171] ${isMobile ? 'text-sm' : 'text-sm'}`}>
                      <span className="font-medium text-[#FF385C]">Tap to upload</span> photos
                    </p>
                    <p className={`text-gray-500 mt-1 ${isMobile ? 'text-xs' : 'text-xs'}`}>PNG, JPG, WebP, GIF up to 5MB each</p>
                  </div>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                
                {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
              </div>

              {previewUrls.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-[#222222] mb-3">
                    Photos ({images.length}/10)
                  </h4>
                  <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Property photo ${index + 1}`}
                          className={`w-full object-cover rounded-lg border border-gray-200 ${isMobile ? 'h-32' : 'h-24'}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        {index === 0 && (
                          <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                            Cover
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    The first photo will be your cover image.
                  </p>
                </div>
              )}
            </div>

            <div className={`flex pt-4 ${isMobile ? 'flex-col gap-3' : 'justify-between'}`}>
              <button
                type="button"
                onClick={prevStep}
                className={`btn-secondary ${isMobile ? 'w-full py-4 order-2' : ''}`}
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || images.length === 0}
                className={`btn-primary disabled:opacity-50 ${isMobile ? 'w-full py-4 order-1 min-h-[56px]' : 'min-w-[140px]'}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create Property'
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  )
}