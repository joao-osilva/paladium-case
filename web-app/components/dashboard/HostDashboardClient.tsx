'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PropertyCard } from '@/components/properties/PropertyCard'
import { AddPropertyModal } from '@/components/properties/AddPropertyModal'
import { EditPropertyModal } from '@/components/properties/EditPropertyModal'
import { DeletePropertyModal } from '@/components/properties/DeletePropertyModal'

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
  property_images?: { url: string; display_order: number }[]
}

interface HostDashboardClientProps {
  userId: string
  initialProperties: Property[]
}

export function HostDashboardClient({ userId, initialProperties }: HostDashboardClientProps) {
  const [properties, setProperties] = useState<Property[]>(initialProperties)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null)
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null)

  const refreshProperties = async () => {
    setIsRefreshing(true)
    try {
      const supabase = createClient()
      const { data: propertiesData } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          description,
          price_per_night,
          bedrooms,
          beds,
          bathrooms,
          max_guests,
          address,
          city,
          country,
          created_at,
          property_images (
            url,
            display_order
          )
        `)
        .eq('host_id', userId)
        .order('created_at', { ascending: false })
      
      setProperties(propertiesData || [])
    } catch (error) {
      console.error('Error refreshing properties:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handlePropertyAdded = () => {
    refreshProperties()
  }

  const handlePropertyUpdated = () => {
    refreshProperties()
  }

  const handlePropertyDeleted = () => {
    refreshProperties()
  }

  const handleEditProperty = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId)
    if (property) {
      setPropertyToEdit(property)
      setIsEditModalOpen(true)
    }
  }

  const handleDeleteProperty = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId)
    if (property) {
      setPropertyToDelete({
        id: property.id,
        title: property.title,
        city: property.city,
        country: property.country,
        imageUrl: property.property_images?.[0]?.url
      })
      setIsDeleteModalOpen(true)
    }
  }

  const handleEditModalClose = () => {
    setIsEditModalOpen(false)
    setPropertyToEdit(null)
  }

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false)
    setPropertyToDelete(null)
  }

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-[#222222]">Your properties</h1>
            <p className="mt-2 text-[#717171]">Manage your listings and track performance</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 sm:mt-0 inline-flex items-center btn-primary"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add property
          </button>
        </div>

        {isRefreshing && (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center space-x-3">
              <svg className="animate-spin h-8 w-8 text-[#FF385C]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-[#717171]">Refreshing properties...</span>
            </div>
          </div>
        )}

        {!isRefreshing && properties && properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                title={property.title}
                description={property.description}
                price={property.price_per_night}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                maxGuests={property.max_guests}
                city={property.city}
                country={property.country}
                imageUrl={property.property_images?.[0]?.url}
                showManagement={true}
                onEdit={handleEditProperty}
                onDelete={handleDeleteProperty}
              />
            ))}
          </div>
        ) : !isRefreshing ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-[#222222]">No properties yet</h3>
            <p className="mt-2 text-[#717171]">Start hosting by adding your first property</p>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="mt-6 inline-flex items-center btn-primary"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add your first property
            </button>
          </div>
        ) : null}
      </div>

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handlePropertyAdded}
        userId={userId}
      />

      {/* Edit Property Modal */}
      <EditPropertyModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        onSuccess={handlePropertyUpdated}
        property={propertyToEdit}
      />

      {/* Delete Property Modal */}
      <DeletePropertyModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onSuccess={handlePropertyDeleted}
        property={propertyToDelete}
      />
    </>
  )
}