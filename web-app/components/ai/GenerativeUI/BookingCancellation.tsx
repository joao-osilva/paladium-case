'use client';

interface BookingCancellationProps {
  result: {
    success: boolean;
    error?: string;
    requiresAuth?: boolean;
    canceledBooking?: {
      id: string;
      property: {
        id: string;
        title: string;
        city: string;
        country: string;
      };
      checkIn: string;
      checkOut: string;
      guestCount: number;
      totalPrice: number;
      status: string;
    };
  };
}

export function BookingCancellation({ result }: BookingCancellationProps) {
  const { success, error, requiresAuth, canceledBooking } = result;

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
            <p className="text-red-800 font-medium">Cancellation Failed</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            {requiresAuth && (
              <p className="text-red-700 text-sm mt-2">
                Please sign in to manage your bookings.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!canceledBooking) {
    return null;
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
      {/* Success Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <div className="flex-1">
          <h3 className="text-orange-800 font-semibold text-lg">Booking Canceled</h3>
          <p className="text-orange-700 text-sm mt-1">
            Your booking has been successfully canceled.
          </p>
        </div>
      </div>

      {/* Booking Details */}
      <div className="bg-white/70 rounded-lg p-4 space-y-3">
        {/* Property Info */}
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wide">Property</p>
          <p className="text-gray-900 font-medium">{canceledBooking.property.title}</p>
          <p className="text-gray-600 text-sm">{canceledBooking.property.city}, {canceledBooking.property.country}</p>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide">Check-in</p>
            <p className="text-gray-900 font-medium text-sm">{formatDate(canceledBooking.checkIn)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide">Check-out</p>
            <p className="text-gray-900 font-medium text-sm">{formatDate(canceledBooking.checkOut)}</p>
          </div>
        </div>

        {/* Guest Info and Total */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide">Guests</p>
            <p className="text-gray-900 font-medium text-sm">{canceledBooking.guestCount} {canceledBooking.guestCount === 1 ? 'guest' : 'guests'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide">Amount</p>
            <p className="text-gray-900 font-medium text-sm">{formatCurrency(canceledBooking.totalPrice)}</p>
          </div>
        </div>

        {/* Booking Reference */}
        <div className="pt-3 border-t border-gray-200">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Booking Reference</p>
          <p className="text-gray-900 font-mono text-sm">{canceledBooking.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>

      {/* Refund Information */}
      <div className="mt-4 p-3 bg-orange-100/50 rounded-lg">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-orange-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-orange-800 text-sm font-medium">Refund Information</p>
            <p className="text-orange-700 text-sm mt-1">
              Your refund of {formatCurrency(canceledBooking.totalPrice)} will be processed within 5-7 business days and credited back to your original payment method.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}