import { Tables } from './database'

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed'

export type Booking = Tables<'bookings'>

export interface BookingWithGuest extends Booking {
  guest: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
}

export interface PropertyBooking {
  property_id: string
  property_title: string
  bookings: BookingWithGuest[]
}

export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isAvailable: boolean
  booking?: BookingWithGuest
}

export interface CalendarMonth {
  year: number
  month: number
  days: CalendarDay[]
}

export interface AvailabilityData {
  property_id: string
  month: number
  year: number
  bookings: BookingWithGuest[]
}