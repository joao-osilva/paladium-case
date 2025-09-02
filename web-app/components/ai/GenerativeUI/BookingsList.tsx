'use client';

import Link from 'next/link';

interface BookingsListProps {
  bookings: {
    bookings: Array<{
      id: string;
      check_in: string;
      check_out: string;
      guest_count: number;
      total_price: number;
      status: string;
      properties?: {
        id: string;
        title: string;
        city: string;
        country: string;
        property_images?: Array<{ url: string }>;
      };
    }>;
    total: number;
    filter?: string;
    requiresAuth?: boolean;
    message?: string;
  };
}

export function BookingsList({ bookings }: BookingsListProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // If authentication is required
  if (bookings.requiresAuth) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <p className="text-yellow-800 font-medium">Sign in required</p>
            <p className="text-yellow-700 text-sm mt-1">{bookings.message}</p>
            <div className="mt-3 flex gap-2">
              <Link
                href="/auth/login"
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 border border-yellow-600 text-yellow-700 rounded-md hover:bg-yellow-50 transition-colors text-sm font-medium"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no bookings found
  if (bookings.bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-600 text-lg mb-2">No bookings found</p>
        <p className="text-gray-500 text-sm">
          {bookings.filter === 'upcoming' && "You don't have any upcoming trips planned."}
          {bookings.filter === 'past' && "You haven't completed any trips yet."}
          {bookings.filter === 'cancelled' && "You don't have any cancelled bookings."}
          {(!bookings.filter || bookings.filter === 'all') && "You haven't made any bookings yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="font-semibold text-gray-900">
          Your Bookings
          {bookings.filter && bookings.filter !== 'all' && (
            <span className="text-gray-500 font-normal"> - {bookings.filter}</span>
          )}
        </h3>
        <span className="text-gray-500 text-sm">({bookings.total})</span>
      </div>

      {/* Bookings List */}
      <div className="space-y-3">
        {bookings.bookings.map((booking) => (
          <div key={booking.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              {/* Property Image */}
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                {booking.properties?.property_images?.[0]?.url ? (
                  <img
                    src={booking.properties.property_images[0].url}
                    alt={booking.properties.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Booking Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 truncate">
                      {booking.properties?.title || 'Property'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {booking.properties?.city}, {booking.properties?.country}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <p><span className="font-medium">Check-in:</span> {formatDate(booking.check_in)}</p>
                    <p><span className="font-medium">Check-out:</span> {formatDate(booking.check_out)}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Guests:</span> {booking.guest_count}</p>
                    <p><span className="font-medium">Total:</span> ${booking.total_price}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 flex gap-2">
                  {booking.properties?.id && (
                    <Link
                      href={`/properties/${booking.properties.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Property
                    </Link>
                  )}
                  <Link
                    href={`/booking/confirm/${booking.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Details
                  </Link>
                  {booking.status === 'confirmed' && new Date(booking.check_in) > new Date() && (
                    <span className="text-sm text-gray-500">
                      • Ask me to "cancel booking {booking.id.slice(0, 8)}" to cancel this trip
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}