'use client';

interface AvailabilityCheckProps {
  result: {
    available: boolean;
    propertyId: string;
    checkIn: string;
    checkOut: string;
    property?: {
      id: string;
      title: string;
      city: string;
      country: string;
    };
    conflictingBookings?: Array<{
      id: string;
      check_in: string;
      check_out: string;
      status: string;
    }>;
    error?: string;
  };
}

export function AvailabilityCheck({ result }: AvailabilityCheckProps) {
  const { available, checkIn, checkOut, property, conflictingBookings, error } = result;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-red-800 font-medium">Availability Check Error</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border p-4 ${
      available 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200'
    }`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          available 
            ? 'bg-green-100' 
            : 'bg-red-100'
        }`}>
          {available ? (
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className={`font-medium ${
            available ? 'text-green-800' : 'text-red-800'
          }`}>
            {available ? 'Available!' : 'Not Available'}
          </h3>
          
          {property && (
            <p className="text-gray-600 text-sm mt-1">
              {property.title} in {property.city}, {property.country}
            </p>
          )}
        </div>
      </div>

      {/* Date Range */}
      <div className="bg-white/60 rounded-md p-3 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-gray-700">
            {formatDate(checkIn)} - {formatDate(checkOut)}
          </span>
        </div>
      </div>

      {/* Conflicting Bookings */}
      {!available && conflictingBookings && conflictingBookings.length > 0 && (
        <div className="bg-white/60 rounded-md p-3">
          <p className="text-red-800 text-sm font-medium mb-2">
            Existing booking{conflictingBookings.length > 1 ? 's' : ''} during this period:
          </p>
          {conflictingBookings.map((booking, index) => (
            <div key={booking.id} className="text-sm text-red-700">
              • {formatDate(booking.check_in)} - {formatDate(booking.check_out)} ({booking.status})
            </div>
          ))}
        </div>
      )}

      {/* Call to Action */}
      {available && (
        <div className="mt-3 pt-3 border-t border-green-200">
          <p className="text-green-700 text-sm">
            🎉 This property is available for your requested dates! Ready to book?
          </p>
        </div>
      )}
    </div>
  );
}