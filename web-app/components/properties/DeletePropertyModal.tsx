'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'

interface Property {
  id: string
  title: string
  city: string
  country: string
  imageUrl?: string
}

interface DeletePropertyModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  property: Property | null
}

export function DeletePropertyModal({ isOpen, onClose, onSuccess, property }: DeletePropertyModalProps) {
  const [loading, setLoading] = useState(false)
  const [confirmationStep, setConfirmationStep] = useState(1)
  const [confirmationText, setConfirmationText] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  if (!property) return null

  const resetModal = () => {
    setConfirmationStep(1)
    setConfirmationText('')
    setShowSuccess(false)
  }

  const handleClose = () => {
    if (!loading) {
      resetModal()
      onClose()
    }
  }

  const handleDelete = async () => {
    if (confirmationText.toLowerCase() !== 'delete') return

    setLoading(true)
    const supabase = createClient()

    try {
      // First, get all property images for cleanup
      const { data: propertyImages } = await supabase
        .from('property_images')
        .select('url')
        .eq('property_id', property.id)

      // Delete property images from storage
      if (propertyImages && propertyImages.length > 0) {
        const imagePaths = propertyImages.map(img => {
          const url = new URL(img.url)
          return url.pathname.split('/').pop() // Get filename from URL
        }).filter(path => path) // Remove any undefined paths

        if (imagePaths.length > 0) {
          await supabase.storage
            .from('property-images')
            .remove(imagePaths.map(path => `${property.id}/${path}`))
        }
      }

      // Delete the property (this will CASCADE delete property_images due to foreign key)
      const { error: deleteError } = await supabase
        .from('properties')
        .delete()
        .eq('id', property.id)

      if (deleteError) throw deleteError

      // Show success animation
      setShowSuccess(true)
      setTimeout(() => {
        resetModal()
        onSuccess()
        onClose()
      }, 1500)

    } catch (error) {
      console.error('Error deleting property:', error)
      alert('Failed to delete property. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (showSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={() => {}} title="Property Deleted" showCloseButton={false}>
        <div className="p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#222222] mb-2">Property Deleted Successfully</h3>
          <p className="text-[#717171]">The property has been removed from your listings.</p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Delete Property"
      size="md"
      showCloseButton={!loading}
    >
      <div className="p-6">
        {confirmationStep === 1 && (
          <div className="space-y-6">
            {/* Property Preview */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                {property.imageUrl ? (
                  <img
                    src={property.imageUrl}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-[#222222] truncate">{property.title}</h4>
                <p className="text-sm text-[#717171]">{property.city}, {property.country}</p>
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Warning: This action cannot be undone</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Deleting this property will:</p>
                    <ul className="mt-1 list-disc list-inside space-y-1">
                      <li>Permanently remove the property from your listings</li>
                      <li>Delete all associated photos</li>
                      <li>Cancel any pending bookings (if applicable)</li>
                      <li>Remove all booking history</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setConfirmationStep(2)}
                className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {confirmationStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#222222] mb-2">Final Confirmation</h3>
              <p className="text-sm text-[#717171] mb-6">
                To confirm deletion, please type <span className="font-mono font-medium bg-gray-100 px-2 py-1 rounded text-red-600">DELETE</span> below:
              </p>
            </div>

            <div>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center font-mono"
                placeholder="Type DELETE to confirm"
                autoComplete="off"
                disabled={loading}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setConfirmationStep(1)}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                disabled={loading}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading || confirmationText.toLowerCase() !== 'delete'}
                className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  'Delete Property'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}