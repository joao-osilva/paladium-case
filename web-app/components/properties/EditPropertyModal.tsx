'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'

interface Property {
  id: string
  title: string
  description: string
  price_per_night: number
  bedrooms: number
  beds: number
  bathrooms: number
  max_guests: number
  address: string
  city: string
  country: string
  location_type: string | null
  property_images?: { url: string; display_order: number | null }[]
}

interface EditPropertyModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  property: Property | null
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
  location_type?: string
  images?: string
}

export function EditPropertyModal({ isOpen, onClose, onSuccess, property }: EditPropertyModalProps) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [images, setImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<{ url: string; display_order: number | null }[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
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
    country: '',
    location_type: 'city'
  })

  const locationTypes = [
    { value: 'beach', label: '🏖️ Beach', emoji: '🏖️' },
    { value: 'countryside', label: '🌾 Countryside', emoji: '🌾' },
    { value: 'city', label: '🏙️ City', emoji: '🏙️' },
    { value: 'mountain', label: '⛰️ Mountain', emoji: '⛰️' },
    { value: 'lakeside', label: '🏞️ Lakeside', emoji: '🏞️' },
    { value: 'desert', label: '🏜️ Desert', emoji: '🏜️' }
  ]

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Initialize form with property data when property changes
  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title,
        description: property.description,
        price_per_night: property.price_per_night.toString(),
        max_guests: property.max_guests.toString(),
        bedrooms: property.bedrooms.toString(),
        beds: property.beds.toString(),
        bathrooms: property.bathrooms.toString(),
        address: property.address,
        city: property.city,
        country: property.country,
        location_type: property.location_type || 'city'
      })
      setExistingImages(property.property_images || [])
    }
  }, [property])

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
      
      case 'location_type':
        if (!value) return 'Location type is required'
        const validTypes = ['beach', 'countryside', 'city', 'mountain', 'lakeside', 'desert']
        if (!validTypes.includes(value)) return 'Invalid location type'
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
      newErrors.location_type = validateField('location_type', formData.location_type)
      newErrors.address = validateField('address', formData.address)
      newErrors.city = validateField('city', formData.city)
      newErrors.country = validateField('country', formData.country)
    } else if (stepNumber === 4) {
      if (existingImages.length === 0 && images.length === 0) {
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

  const resetModal = () => {
    if (property) {
      setFormData({
        title: property.title,
        description: property.description,
        price_per_night: property.price_per_night.toString(),
        max_guests: property.max_guests.toString(),
        bedrooms: property.bedrooms.toString(),
        beds: property.beds.toString(),
        bathrooms: property.bathrooms.toString(),
        address: property.address,
        city: property.city,
        country: property.country,
        location_type: property.location_type || 'city'
      })
      setExistingImages(property.property_images || [])
    }
    setImages([])
    setPreviewUrls([])
    setImagesToDelete([])
    setStep(1)
    setErrors({})
    setTouched({})
    setShowSuccess(false)
  }

  const handleClose = () => {
    if (!loading) {
      resetModal()
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

    const totalImages = existingImages.length + images.length + validFiles.length
    if (totalImages > 10) {
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

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]) // Clean up blob URL
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
    
    const totalImages = existingImages.length + images.length - 1
    if (totalImages === 0) {
      setErrors(prev => ({ ...prev, images: 'At least one photo is required' }))
    }
  }

  const removeExistingImage = (url: string) => {
    setExistingImages(prev => prev.filter(img => img.url !== url))
    setImagesToDelete(prev => [...prev, url])
    
    const totalImages = existingImages.length - 1 + images.length
    if (totalImages === 0) {
      setErrors(prev => ({ ...prev, images: 'At least one photo is required' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(4) || !property) return

    setLoading(true)
    const supabase = createClient()

    try {
      // Update property details
      const { error: updateError } = await supabase
        .from('properties')
        .update({
          title: formData.title.trim(),
          description: formData.description.trim(),
          price_per_night: parseFloat(formData.price_per_night),
          max_guests: parseInt(formData.max_guests),
          bedrooms: parseInt(formData.bedrooms),
          beds: parseInt(formData.beds),
          bathrooms: parseFloat(formData.bathrooms),
          address: formData.address.trim(),
          city: formData.city.trim(),
          country: formData.country.trim(),
          location_type: formData.location_type
        })
        .eq('id', property.id)

      if (updateError) throw updateError

      // Handle image deletions
      if (imagesToDelete.length > 0) {
        // Delete from storage
        const imagePaths = imagesToDelete.map(url => {
          const urlObj = new URL(url)
          return urlObj.pathname.split('/').pop() // Get filename from URL
        }).filter(path => path) // Remove any undefined paths

        if (imagePaths.length > 0) {
          await supabase.storage
            .from('property-images')
            .remove(imagePaths.map(path => `${property.id}/${path}`))
        }

        // Delete from database
        const { error: deleteImagesError } = await supabase
          .from('property_images')
          .delete()
          .in('url', imagesToDelete)

        if (deleteImagesError) throw deleteImagesError
      }

      // Handle new image uploads
      if (images.length > 0) {
        const currentMaxOrder = Math.max(...existingImages.map(img => img.display_order || 0), -1)
        
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
              display_order: currentMaxOrder + index + 1
            })
        })

        await Promise.all(imagePromises)
      }

      // Show success animation
      setShowSuccess(true)
      setTimeout(() => {
        resetModal()
        onSuccess()
        onClose()
      }, 1500)

    } catch (error) {
      console.error('Error updating property:', error)
      alert('Failed to update property. Please try again.')
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
    return `Edit: ${titles[step - 1]} (${step}/4)`
  }

  if (!property) return null

  if (showSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={() => {}} title="Property Updated" showCloseButton={false}>
        <div className={`text-center ${isMobile ? 'p-8' : 'p-12'}`}>
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#222222] mb-2">Property Updated!</h3>
          <p className="text-[#717171]">Your changes have been saved successfully.</p>
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
                  Location Type *
                </label>
                <select
                  value={formData.location_type}
                  onChange={(e) => handleFieldChange('location_type', e.target.value)}
                  onBlur={() => handleFieldBlur('location_type')}
                  className={`
                    w-full border rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition-colors
                    ${isMobile ? 'px-4 py-4 text-base' : 'px-4 py-3'}
                    ${errors.location_type ? 'border-red-500' : 'border-gray-300'}
                  `}
                >
                  {locationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.location_type && <p className="text-red-500 text-sm mt-1">{errors.location_type}</p>}
                <p className="text-gray-500 text-xs mt-1">
                  Choose the environment that best describes your property
                </p>
              </div>

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
                  Manage your property photos. Add new ones or remove existing ones.
                </p>
                
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-[#222222] mb-3">
                      Current Photos
                    </h4>
                    <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
                      {existingImages.map((image, index) => (
                        <div key={image.url} className="relative group">
                          <img
                            src={image.url}
                            alt={`Property photo ${index + 1}`}
                            className={`w-full object-cover rounded-lg border border-gray-200 ${isMobile ? 'h-32' : 'h-24'}`}
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(image.url)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                          {image.display_order === 0 && (
                            <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              Cover
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                      <span className="font-medium text-[#FF385C]">Tap to add</span> more photos
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

                {/* New Images Preview */}
                {previewUrls.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-[#222222] mb-3">
                      New Photos to Add ({images.length}/10 total)
                    </h4>
                    <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`New photo ${index + 1}`}
                            className={`w-full object-cover rounded-lg border border-gray-200 ${isMobile ? 'h-32' : 'h-24'}`}
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                          <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            New
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
                disabled={loading || (existingImages.length === 0 && images.length === 0)}
                className={`btn-primary disabled:opacity-50 ${isMobile ? 'w-full py-4 order-1 min-h-[56px]' : 'min-w-[140px]'}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  'Update Property'
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  )
}