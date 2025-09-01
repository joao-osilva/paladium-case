'use client';

import { PropertyCard } from './PropertyCard';

interface SearchResultsProps {
  results: {
    results: Array<{
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
      address: string;
      property_images?: Array<{ url: string }>;
      profiles?: { full_name: string; avatar_url?: string };
    }>;
    total: number;
    searchCriteria?: {
      location?: string;
      checkIn?: string;
      checkOut?: string;
      guests?: number;
      minPrice?: number;
      maxPrice?: number;
    };
    error?: string;
  };
  onCheckAvailability?: (propertyId: string) => void;
}

export function SearchResults({ results, onCheckAvailability }: SearchResultsProps) {
  const { results: properties, total, searchCriteria, error } = results;

  const formatSearchSummary = () => {
    const parts = [];
    
    if (searchCriteria?.location) {
      parts.push(`in ${searchCriteria.location}`);
    }
    
    if (searchCriteria?.guests && searchCriteria.guests > 1) {
      parts.push(`for ${searchCriteria.guests} guests`);
    }
    
    if (searchCriteria?.checkIn && searchCriteria?.checkOut) {
      const checkin = new Date(searchCriteria.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const checkout = new Date(searchCriteria.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      parts.push(`from ${checkin} to ${checkout}`);
    }
    
    if (searchCriteria?.minPrice || searchCriteria?.maxPrice) {
      if (searchCriteria.minPrice && searchCriteria.maxPrice) {
        parts.push(`$${searchCriteria.minPrice}-$${searchCriteria.maxPrice}/night`);
      } else if (searchCriteria.minPrice) {
        parts.push(`from $${searchCriteria.minPrice}/night`);
      } else if (searchCriteria.maxPrice) {
        parts.push(`up to $${searchCriteria.maxPrice}/night`);
      }
    }
    
    
    return parts.length > 0 ? parts.join(' ') : '';
  };

  // Show error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-red-800 font-medium">Search Error</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="text-gray-600 text-lg mb-2">No properties found</p>
        <p className="text-gray-500 text-sm">
          {searchCriteria ? `Try adjusting your search criteria${formatSearchSummary() ? ` ${formatSearchSummary()}` : ''}` : 'Try a different search'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="font-semibold text-gray-900">Search Results</h3>
        </div>
        <p className="text-gray-600 text-sm">
          Found <span className="font-medium text-gray-900">{total}</span> propert{total !== 1 ? 'ies' : 'y'}
          {formatSearchSummary() && <span> {formatSearchSummary()}</span>}
        </p>
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onCheckAvailability={onCheckAvailability}
          />
        ))}
      </div>

      {/* Show more indicator if there might be more results */}
      {properties.length >= 10 && (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">
            Showing first {properties.length} results. Ask me to search for more specific criteria to narrow down the results!
          </p>
        </div>
      )}
    </div>
  );
}