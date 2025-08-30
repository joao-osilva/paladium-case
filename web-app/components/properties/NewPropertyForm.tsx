'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface NewPropertyFormProps {
  userId: string
}

export function NewPropertyForm({ userId }: NewPropertyFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_per_night: '',
    max_guests: '1',
    bedrooms: '1',
    beds: '1',
    bathrooms: '1',
    address: '',
    city: '',
    country: ''
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages(prev => [...prev, ...files])
    
    const newPreviewUrls = files.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newPreviewUrls])
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setLoading(true)
    const supabase = createClient()

    try {
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          host_id: userId,
          title: formData.title,
          description: formData.description,
          price_per_night: parseFloat(formData.price_per_night),
          max_guests: parseInt(formData.max_guests),
          bedrooms: parseInt(formData.bedrooms),
          beds: parseInt(formData.beds),
          bathrooms: parseFloat(formData.bathrooms),
          address: formData.address,
          city: formData.city,
          country: formData.country
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

      router.push('/dashboard/host')
      router.refresh()
    } catch (error) {
      console.error('Error creating property:', error)
      alert('Failed to create property. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#222222]">List your property</h1>
        <p className="mt-2 text-[#717171]">Share your space with guests and earn extra income</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-[#222222] mb-6">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#222222] mb-2">
                Property Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                placeholder="Cozy apartment in downtown"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#222222] mb-2">
                Description
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                placeholder="Describe your property..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#222222] mb-2">
                Price per Night ($)
              </label>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                value={formData.price_per_night}
                onChange={(e) => setFormData({...formData, price_per_night: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                placeholder="100"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-[#222222] mb-6">Property Details</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#222222] mb-2">
                Max Guests
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.max_guests}
                onChange={(e) => setFormData({...formData, max_guests: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#222222] mb-2">
                Bedrooms
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.bedrooms}
                onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#222222] mb-2">
                Beds
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.beds}
                onChange={(e) => setFormData({...formData, beds: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#222222] mb-2">
                Bathrooms
              </label>
              <input
                type="number"
                required
                min="0.5"
                step="0.5"
                value={formData.bathrooms}
                onChange={(e) => setFormData({...formData, bathrooms: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-[#222222] mb-6">Location</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#222222] mb-2">
                Address
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#222222] mb-2">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  placeholder="New York"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#222222] mb-2">
                  Country
                </label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  placeholder="United States"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-[#222222] mb-6">Photos</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#222222] mb-2">
                Upload Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
              />
            </div>

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:shadow-lg"
                    >
                      <svg className="w-4 h-4 text-[#222222]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => router.push('/dashboard/host')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Property'}
          </button>
        </div>
      </form>
    </div>
  )
}