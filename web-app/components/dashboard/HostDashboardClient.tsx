'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PropertyCard } from '@/components/properties/PropertyCard'
import { AddPropertyModal } from '@/components/properties/AddPropertyModal'
import { EditPropertyModal } from '@/components/properties/EditPropertyModal'
import { DeletePropertyModal } from '@/components/properties/DeletePropertyModal'
import { AvailabilityOverview } from './AvailabilityOverview'
import { HostStatsCards } from './HostStatsCards'

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

interface PropertyForDelete {
  id: string
  title: string
  city: string
  country: string
  imageUrl?: string
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
  const [propertyToDelete, setPropertyToDelete] = useState<PropertyForDelete | null>(null)

  const refreshProperties = async () => {
    setIsRefreshing(true)
    try {
      const supabase = createClient()
      
      // Try with location_type first, fallback to without it if column doesn't exist
      let propertiesData: Property[] = []
      try {
        const { data, error } = await supabase
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
            location_type,
            created_at,
            property_images (
              url,
              display_order
            )
          `)
          .eq('host_id', userId)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        propertiesData = (data as unknown as Property[]) || []
      } catch (locationTypeError) {
        // Fallback to query without location_type if column doesn't exist
        console.log('location_type column not found, using fallback query')
        const { data, error } = await supabase
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
        
        if (error) throw error
        
        // Add default location_type for existing properties
        propertiesData = (data || []).map(property => ({
          ...property,
          location_type: 'city' as const
        })) as Property[]
      }
      
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
        {/* Header with improved hierarchy */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#222222] mb-1">Dashboard</h1>
            <p className="text-[#717171]">Manage your properties and bookings</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 sm:mt-0 btn-primary"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Property
          </button>
        </div>

        {/* Stats Cards */}
        <HostStatsCards userId={userId} properties={properties} />

        {isRefreshing && (
          <div className="space-y-4">
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="skeleton-text w-20 mb-2"></div>
                      <div className="skeleton-title w-16"></div>
                    </div>
                    <div className="skeleton w-12 h-12 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Properties Skeleton */}
            <div className="mb-4">
              <div className="skeleton-title w-32 mb-4"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="aspect-square skeleton"></div>
                    <div className="p-4 space-y-3">
                      <div className="skeleton-title w-3/4"></div>
                      <div className="skeleton-text w-1/2"></div>
                      <div className="flex space-x-4">
                        <div className="skeleton-text w-16"></div>
                        <div className="skeleton-text w-20"></div>
                      </div>
                      <div className="skeleton-text w-24"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Properties Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#222222]">Your Properties</h2>
            {properties.length > 0 && (
              <span className="text-sm text-[#717171] bg-gray-100 px-3 py-1 rounded-full">
                {properties.length} propert{properties.length === 1 ? 'y' : 'ies'}
              </span>
            )}
          </div>
          
          {!isRefreshing && properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  status="published"
                  bookingCount={0}
                />
              ))}
            </div>
          ) : !isRefreshing ? (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-[#FF385C] bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#FF385C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#222222] mb-2">Ready to start hosting?</h3>
              <p className="text-[#717171] mb-6 max-w-md mx-auto">
                Create your first property listing and begin your hosting journey with PaxBnb
              </p>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="btn-primary"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Your First Property
              </button>
            </div>
          ) : null}
        </div>
        {/* Inline Availability Calendar */}
        {!isRefreshing && properties && properties.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#222222] mb-4">Property Calendar</h2>
            <AvailabilityOverview
              userId={userId}
              properties={properties.map(property => ({
                id: property.id,
                title: property.title,
                city: property.city,
                country: property.country
              }))}
            />
          </div>
        )}
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