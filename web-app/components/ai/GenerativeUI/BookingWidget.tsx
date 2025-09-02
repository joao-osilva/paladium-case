'use client';

import { useState } from 'react';
import Link from 'next/link';

interface BookingWidgetProps {
  booking: {
    id?: string;
    property?: string;
    checkin: string;
    checkout: string;
    guests?: number;
    nights?: number;
    totalPrice?: number;
    status?: string;
    success?: boolean;
    message?: string;
    requiresAuth?: boolean;
  };
  onLogin?: () => void;
  onRetry?: () => void;
}

export function BookingWidget({ booking, onLogin, onRetry }: BookingWidgetProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // If authentication is required
  if (booking.requiresAuth) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <p className="text-yellow-800 font-medium">Sign in required</p>
            <p className="text-yellow-700 text-sm mt-1">{booking.message}</p>
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

  // If booking was successful
  if (booking.success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-green-800 font-semibold text-lg">Booking Confirmed!</p>
            <div className="mt-3 space-y-2 text-sm text-green-700">
              <p><span className="font-medium">Property:</span> {booking.property}</p>
              <p><span className="font-medium">Check-in:</span> {formatDate(booking.checkin)}</p>
              <p><span className="font-medium">Check-out:</span> {formatDate(booking.checkout)}</p>
              <p><span className="font-medium">Guests:</span> {booking.guests}</p>
              <p><span className="font-medium">Total nights:</span> {booking.nights}</p>
              <p className="text-lg pt-2 border-t border-green-200">
                <span className="font-medium">Total price:</span> ${booking.totalPrice}
              </p>
            </div>
            {booking.id && (
              <div className="mt-4">
                <Link
                  href={`/booking/confirm/${booking.id}`}
                  className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  View Booking Details
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // If booking failed
  if (booking.success === false) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-red-800 font-medium">Booking could not be completed</p>
            <p className="text-red-700 text-sm mt-1">{booking.message}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default display for booking info
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="space-y-2 text-sm">
        {booking.property && (
          <p><span className="font-medium text-blue-900">Property:</span> <span className="text-blue-700">{booking.property}</span></p>
        )}
        <p><span className="font-medium text-blue-900">Check-in:</span> <span className="text-blue-700">{formatDate(booking.checkin)}</span></p>
        <p><span className="font-medium text-blue-900">Check-out:</span> <span className="text-blue-700">{formatDate(booking.checkout)}</span></p>
        {booking.nights && (
          <p><span className="font-medium text-blue-900">Nights:</span> <span className="text-blue-700">{booking.nights}</span></p>
        )}
        {booking.totalPrice && (
          <p className="text-lg pt-2 border-t border-blue-200">
            <span className="font-medium text-blue-900">Total:</span> <span className="text-blue-700 font-semibold">${booking.totalPrice}</span>
          </p>
        )}
      </div>
    </div>
  );
}