'use client'

import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'
import { VoiceInput } from '@/components/ai/VoiceInput'
import { Upload, Wand2, X, Image as ImageIcon, Edit3, Check, Loader2 } from 'lucide-react'

interface AddPropertyAIModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  userId: string
}

interface ExtractedPropertyData {
  title: string
  description: string
  location: {
    city: string
    country: string
    address: string
  }
  locationType: string
  specifications: {
    bedrooms: number
    bathrooms: number
    beds: number
    maxGuests: number
  }
  pricePerNight: number
  amenities: string[]
  confidence: string
  originalDescription: string
}

export function AddPropertyAIModal({ isOpen, onClose, onSuccess, userId }: AddPropertyAIModalProps) {
  const [step, setStep] = useState<'input' | 'preview' | 'creating'>('input')
  const [images, setImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [extractedData, setExtractedData] = useState<ExtractedPropertyData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const locationTypes = [
    { value: 'beach', label: '🏖️ Beach', emoji: '🏖️' },
    { value: 'countryside', label: '🌾 Countryside', emoji: '🌾' },
    { value: 'city', label: '🏙️ City', emoji: '🏙️' },
    { value: 'mountain', label: '⛰️ Mountain', emoji: '⛰️' },
    { value: 'lakeside', label: '🏞️ Lakeside', emoji: '🏞️' },
    { value: 'desert', label: '🏜️ Desert', emoji: '🏜️' }
  ]

  const handleImageDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )
    
    if (files.length > 0) {
      addImages(files)
    }
  }, [])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      addImages(files)
    }
  }

  const addImages = (files: File[]) => {
    // Limit to 10 images total
    const remainingSlots = 10 - images.length
    const filesToAdd = files.slice(0, remainingSlots)
    
    setImages(prev => [...prev, ...filesToAdd])
    
    const newPreviewUrls = filesToAdd.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newPreviewUrls])
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleVoiceInput = (transcript: string) => {
    if (transcript.trim()) {
      setDescription(prev => prev ? `${prev} ${transcript}` : transcript)
    }
  }

  const extractPropertyData = async () => {
    if (!description.trim()) {
      setError('Please provide a description of your property')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/property/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description.trim(),
          images: images.map(img => ({ name: img.name, size: img.size }))
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to extract property data')
      }

      if (!result.success) {
        throw new Error(result.error || 'Property extraction failed')
      }

      setExtractedData(result.data)
      setStep('preview')
    } catch (error) {
      console.error('Property extraction error:', error)
      setError(error instanceof Error ? error.message : 'Failed to analyze your property description')
    } finally {
      setLoading(false)
    }
  }

  const createProperty = async () => {
    if (!extractedData) return

    setStep('creating')
    const supabase = createClient()

    try {
      // Create the property record
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          host_id: userId,
          title: extractedData.title,
          description: extractedData.description,
          price_per_night: extractedData.pricePerNight,
          max_guests: extractedData.specifications.maxGuests,
          bedrooms: extractedData.specifications.bedrooms,
          beds: extractedData.specifications.beds,
          bathrooms: extractedData.specifications.bathrooms,
          address: extractedData.location.address,
          city: extractedData.location.city,
          country: extractedData.location.country,
          location_type: extractedData.locationType
        })
        .select()
        .single()

      if (propertyError) throw propertyError

      // Upload images if any
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

      // Reset modal state
      setStep('input')
      setImages([])
      setPreviewUrls([])
      setDescription('')
      setExtractedData(null)
      setError(null)
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error creating property:', error)
      setError('Failed to create property. Please try again.')
      setStep('preview')
    }
  }

  const updateExtractedData = (field: string, value: any) => {
    if (!extractedData) return
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setExtractedData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof ExtractedPropertyData] as any),
            [child]: value
          }
        }
      })
    } else {
      setExtractedData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          [field]: value
        }
      })
    }
  }

  const resetModal = () => {
    setStep('input')
    setImages([])
    setPreviewUrls([])
    setDescription('')
    setExtractedData(null)
    setError(null)
    setLoading(false)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  if (step === 'creating') {
    return (
      <Modal isOpen={isOpen} onClose={() => {}} title="Creating Property" size="md">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Creating Your Property
          </h3>
          <p className="text-gray-600">
            Setting up your listing with all the details...
          </p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={step === 'input' ? 'Add Property' : 'Review Your Listing'}
      size="xl"
    >
      <div className="p-4 md:p-6">
        {step === 'input' && (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Drop photos and record a description. AI creates your listing!
              </p>
            </div>

            {/* Image Upload Area */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Photos
              </label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6 text-center hover:border-gray-400 transition-colors"
                onDrop={handleImageDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-base md:text-lg font-medium text-gray-900 mb-1">
                  Drop photos here
                </p>
                <p className="text-xs md:text-sm text-gray-500">
                  Up to 10 images
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              {/* Image Previews */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 mt-3">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Property ${index + 1}`}
                        className="w-full h-16 md:h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Voice Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Record Description
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <VoiceInput onTranscript={handleVoiceInput} disabled={loading} />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-medium text-gray-900 mb-1">
                      Record Description
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 mb-1">
                      Describe location, size, amenities, and special features.
                    </p>
                    <p className="text-xs text-gray-500">
                      💡 Tap mic and speak naturally
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={extractPropertyData}
                disabled={loading || !description.trim() || images.length === 0}
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Create with AI
                  </>
                )}
              </button>
            </div>

            {/* Requirements hint */}
            {(!description.trim() || images.length === 0) && (
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800 text-center">
                  {!description.trim() && images.length === 0 
                    ? "📸 Add photos and 🎤 record description to continue"
                    : !description.trim() 
                    ? "🎤 Record a description to continue" 
                    : "📸 Add at least one photo to continue"
                  }
                </p>
              </div>
            )}
          </>
        )}

        {step === 'preview' && extractedData && (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Review and edit your AI-generated listing before publishing.
              </p>
            </div>

            <div className="space-y-4 max-h-80 md:max-h-96 overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={extractedData.title}
                  onChange={(e) => updateExtractedData('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={extractedData.description}
                  onChange={(e) => updateExtractedData('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Location & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={extractedData.location.city}
                    onChange={(e) => updateExtractedData('location.city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    value={extractedData.location.country}
                    onChange={(e) => updateExtractedData('location.country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={extractedData.location.address}
                  onChange={(e) => updateExtractedData('location.address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location Type</label>
                <select
                  value={extractedData.locationType}
                  onChange={(e) => updateExtractedData('locationType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {locationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                  <input
                    type="number"
                    min="0"
                    value={extractedData.specifications.bedrooms}
                    onChange={(e) => updateExtractedData('specifications.bedrooms', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={extractedData.specifications.bathrooms}
                    onChange={(e) => updateExtractedData('specifications.bathrooms', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Beds</label>
                  <input
                    type="number"
                    min="1"
                    value={extractedData.specifications.beds}
                    onChange={(e) => updateExtractedData('specifications.beds', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Guests</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={extractedData.specifications.maxGuests}
                    onChange={(e) => updateExtractedData('specifications.maxGuests', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price per Night ($)</label>
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={extractedData.pricePerNight}
                  onChange={(e) => updateExtractedData('pricePerNight', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setStep('input')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                <Edit3 className="w-4 h-4" />
                Edit Description
              </button>
              <button
                onClick={createProperty}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Check className="w-4 h-4" />
                Create Property
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}