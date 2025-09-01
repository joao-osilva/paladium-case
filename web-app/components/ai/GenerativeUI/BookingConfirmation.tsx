'use client';

interface BookingConfirmationProps {
  result: {
    success: boolean;
    error?: string;
    requiresAuth?: boolean;
    booking?: {
      id: string;
      property: {
        title: string;
        city: string;
        country: string;
      };
      checkIn: string;
      checkOut: string;
      guestCount: number;
      nights: number;
      pricePerNight: number;
      totalPrice: number;
      status: string;
      createdAt: string;
    };
  };
}

export function BookingConfirmation({ result }: BookingConfirmationProps) {
  const { success, error, requiresAuth, booking } = result;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!success) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-red-800 font-medium">Booking Failed</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            {requiresAuth && (
              <p className="text-red-700 text-sm mt-2">
                Please sign in to make bookings.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      {/* Success Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <div className="flex-1">
          <h3 className="text-green-800 font-semibold text-lg">Booking Confirmed!</h3>
          <p className="text-green-700 text-sm mt-1">
            Your booking has been successfully created.
          </p>
        </div>
      </div>

      {/* Booking Details */}
      <div className="bg-white/70 rounded-lg p-4 space-y-3">
        {/* Property Info */}
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wide">Property</p>
          <p className="text-gray-900 font-medium">{booking.property.title}</p>
          <p className="text-gray-600 text-sm">{booking.property.city}, {booking.property.country}</p>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide">Check-in</p>
            <p className="text-gray-900 font-medium text-sm">{formatDate(booking.checkIn)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide">Check-out</p>
            <p className="text-gray-900 font-medium text-sm">{formatDate(booking.checkOut)}</p>
          </div>
        </div>

        {/* Guest Info */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide">Guests</p>
            <p className="text-gray-900 font-medium text-sm">{booking.guestCount} {booking.guestCount === 1 ? 'guest' : 'guests'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide">Nights</p>
            <p className="text-gray-900 font-medium text-sm">{booking.nights} {booking.nights === 1 ? 'night' : 'nights'}</p>
          </div>
        </div>

        {/* Pricing */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">{formatCurrency(booking.pricePerNight)} × {booking.nights} nights</span>
            <span className="text-gray-900 font-medium">{formatCurrency(booking.totalPrice)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-100">
            <span className="text-gray-900 font-semibold">Total</span>
            <span className="text-gray-900 font-semibold text-lg">{formatCurrency(booking.totalPrice)}</span>
          </div>
        </div>

        {/* Booking ID */}
        <div className="pt-3 border-t border-gray-200">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Booking Reference</p>
          <p className="text-gray-900 font-mono text-sm">{booking.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>

      {/* Confirmation Message */}
      <div className="mt-4 p-3 bg-green-100/50 rounded-lg">
        <p className="text-green-800 text-sm">
          ✈️ A confirmation email has been sent to your registered email address.
        </p>
      </div>
    </div>
  );
}