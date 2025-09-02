'use client';

import { useState } from 'react';
import Link from 'next/link';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    description: string;
    price_per_night: number;
    bedrooms: number;
    beds: number;
    bathrooms: number;
    max_guests: number;
    city: string;
    country: string;
    location_type?: string;
    property_images?: Array<{ url: string; display_order?: number }>;
    profiles?: { full_name: string; avatar_url?: string };
  };
  onCheckAvailability?: (propertyId: string) => void;
}

export function PropertyCard({ property, onCheckAvailability }: PropertyCardProps) {
  const [imageError, setImageError] = useState(false);
  const mainImage = property.property_images?.[0]?.url;

  const getLocationTypeBadge = (locationType?: string) => {
    if (!locationType) return null;
    
    const badges = {
      beach: { emoji: '🏖️', label: 'Beach', bg: 'bg-blue-100', text: 'text-blue-800' },
      countryside: { emoji: '🌾', label: 'Countryside', bg: 'bg-green-100', text: 'text-green-800' },
      city: { emoji: '🏙️', label: 'City', bg: 'bg-gray-100', text: 'text-gray-800' },
      mountain: { emoji: '🏔️', label: 'Mountain', bg: 'bg-purple-100', text: 'text-purple-800' },
      lakeside: { emoji: '🏞️', label: 'Lakeside', bg: 'bg-teal-100', text: 'text-teal-800' },
      desert: { emoji: '🏜️', label: 'Desert', bg: 'bg-orange-100', text: 'text-orange-800' }
    };
    
    const badge = badges[locationType as keyof typeof badges];
    return badge || null;
  };

  const locationBadge = getLocationTypeBadge(property.location_type);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {mainImage && !imageError ? (
          <img
            src={mainImage}
            alt={property.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        )}
        
        {/* Price badge */}
        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md shadow-md">
          <span className="font-semibold text-gray-900">${property.price_per_night}</span>
          <span className="text-gray-600 text-sm">/night</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
          {property.title}
        </h3>
        
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-600 text-sm">
            {property.city}, {property.country}
          </p>
          {locationBadge && (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${locationBadge.bg} ${locationBadge.text}`}>
              <span>{locationBadge.emoji}</span>
              {locationBadge.label}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {property.max_guests} guests
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {property.description}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/properties/${property.id}`}
            className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            View Details
          </Link>
          {onCheckAvailability && (
            <button
              onClick={() => onCheckAvailability(property.id)}
              className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              Check Dates
            </button>
          )}
        </div>
      </div>
    </div>
  );
}