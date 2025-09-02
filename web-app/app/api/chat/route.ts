import { streamText, tool, convertToModelMessages, UIMessage, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { createClient } from '@/lib/supabase/server';

// Helper function to parse dates with current year as default
function parseBookingDate(dateString: string): string {
  const currentYear = new Date().getFullYear();
  
  // If dateString already includes a year (YYYY-MM-DD format), return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Try to parse various date formats and default to current year
  const date = new Date(dateString);
  
  // If the parsed year is way off (like 2001 for "oct 12"), use current year
  if (date.getFullYear() < currentYear) {
    date.setFullYear(currentYear);
  }
  
  // If the date has passed in the current year, assume next year
  const now = new Date();
  if (date < now) {
    date.setFullYear(currentYear + 1);
  }
  
  return date.toISOString().split('T')[0];
}

// Tool for getting current date information
const getCurrentDate = tool({
  description: 'Get the current date and year information to ensure booking dates are in the future',
  inputSchema: z.object({}),
  execute: async () => {
    const now = new Date();
    return {
      currentDate: now.toISOString().split('T')[0], // YYYY-MM-DD format
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth() + 1,
      currentDay: now.getDate(),
      timestamp: now.toISOString()
    };
  },
});

// Tool for searching properties
const searchProperties = tool({
  description: 'Search for rental properties based on location, dates, guests, location type, and other criteria',
  inputSchema: z.object({
    location: z.string().optional().describe('City or country to search in'),
    checkIn: z.string().optional().describe('Check-in date in YYYY-MM-DD format'),
    checkOut: z.string().optional().describe('Check-out date in YYYY-MM-DD format'),
    guests: z.number().optional().describe('Number of guests'),
    minPrice: z.number().optional().describe('Minimum price per night'),
    maxPrice: z.number().optional().describe('Maximum price per night'),
    locationType: z.enum(['beach', 'countryside', 'city', 'mountain', 'lakeside', 'desert']).optional().describe('Type of location (beach, countryside, city, mountain, lakeside, desert)'),
  }),
  execute: async ({ location, checkIn, checkOut, guests, minPrice, maxPrice, locationType }) => {
    const supabase = createClient();
    
    // Parse and normalize dates if provided
    const normalizedCheckIn = checkIn ? parseBookingDate(checkIn) : undefined;
    const normalizedCheckOut = checkOut ? parseBookingDate(checkOut) : undefined;
    
    let query = supabase
      .from('properties')
      .select(`
        id,
        title,
        description,
        price_per_night,
        max_guests,
        bedrooms,
        beds,
        bathrooms,
        city,
        country,
        address,
        location_type,
        property_images (
          url
        ),
        profiles:host_id (
          full_name,
          avatar_url
        )
      `);

    // Apply filters
    if (location) {
      query = query.or(`city.ilike.%${location}%,country.ilike.%${location}%`);
    }
    
    if (locationType) {
      query = query.eq('location_type', locationType);
    }
    
    if (guests) {
      query = query.gte('max_guests', guests);
    }
    
    if (minPrice) {
      query = query.gte('price_per_night', minPrice);
    }
    
    if (maxPrice) {
      query = query.lte('price_per_night', maxPrice);
    }

    const { data: properties, error } = await query.limit(6);
    
    if (error) {
      console.error('Database error in searchProperties:', error);
      return {
        results: [],
        total: 0,
        error: `Database error: ${error.message}`
      };
    }

    return {
      results: properties || [],
      total: properties?.length || 0,
      searchCriteria: {
        location,
        checkIn: normalizedCheckIn,
        checkOut: normalizedCheckOut,
        guests,
        minPrice,
        maxPrice,
        locationType
      }
    };
  },
});

// Tool for checking property availability
const checkAvailability = tool({
  description: 'Check if a property is available for specific dates by looking at existing bookings',
  inputSchema: z.object({
    propertyId: z.string().describe('Property ID to check availability for'),
    checkIn: z.string().describe('Check-in date in YYYY-MM-DD format'),
    checkOut: z.string().describe('Check-out date in YYYY-MM-DD format'),
  }),
  execute: async ({ propertyId, checkIn, checkOut }) => {
    const supabase = createClient();
    
    // Parse and normalize the dates to ensure they use the current/future year
    const normalizedCheckIn = parseBookingDate(checkIn);
    const normalizedCheckOut = parseBookingDate(checkOut);
    
    // First check if property exists
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, title, city, country')
      .eq('id', propertyId)
      .single();
    
    if (propertyError || !property) {
      return {
        available: false,
        error: 'Property not found',
        propertyId,
        checkIn: normalizedCheckIn,
        checkOut: normalizedCheckOut
      };
    }
    
    // Check for conflicting bookings (only confirmed bookings block availability)
    const { data: conflictingBookings, error: bookingError } = await supabase
      .from('bookings')
      .select('id, check_in, check_out, status')
      .eq('property_id', propertyId)
      .eq('status', 'confirmed')
      .or(`and(check_in.lte.${normalizedCheckOut},check_out.gt.${normalizedCheckIn})`);
    
    if (bookingError) {
      console.error('Error checking bookings:', bookingError);
      return {
        available: false,
        error: 'Error checking availability',
        propertyId,
        checkIn: normalizedCheckIn,
        checkOut: normalizedCheckOut
      };
    }
    
    const available = !conflictingBookings || conflictingBookings.length === 0;
    
    return {
      available,
      propertyId,
      checkIn,
      checkOut,
      property: property,
      conflictingBookings: available ? [] : conflictingBookings
    };
  },
});

// Tool for creating a booking
const createBooking = tool({
  description: 'Create a new booking for a property on behalf of the logged-in user',
  inputSchema: z.object({
    propertyId: z.string().describe('Property ID to book'),
    checkIn: z.string().describe('Check-in date in YYYY-MM-DD format'),
    checkOut: z.string().describe('Check-out date in YYYY-MM-DD format'),
    guestCount: z.number().describe('Number of guests'),
  }),
  execute: async ({ propertyId, checkIn, checkOut, guestCount }) => {
    const supabase = createClient();
    
    // Parse and normalize the dates to ensure they use the current/future year
    const normalizedCheckIn = parseBookingDate(checkIn);
    const normalizedCheckOut = parseBookingDate(checkOut);
    
    // Get user authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        error: 'User must be logged in to make a booking',
        requiresAuth: true
      };
    }

    // First verify the property exists and get its details
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, title, city, country, price_per_night, max_guests')
      .eq('id', propertyId)
      .single();
    
    if (propertyError || !property) {
      return {
        success: false,
        error: 'Property not found'
      };
    }

    // Check if guest count is within limits
    if (guestCount > property.max_guests) {
      return {
        success: false,
        error: `This property can only accommodate ${property.max_guests} guests`
      };
    }

    // Check availability
    const { data: conflictingBookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('property_id', propertyId)
      .eq('status', 'confirmed')
      .or(`and(check_in.lte.${normalizedCheckOut},check_out.gt.${normalizedCheckIn})`);
    
    if (conflictingBookings && conflictingBookings.length > 0) {
      return {
        success: false,
        error: 'Property is not available for these dates'
      };
    }

    // Validate and ensure dates are in the future
    const today = new Date();
    const checkInDate = new Date(normalizedCheckIn);
    const checkOutDate = new Date(normalizedCheckOut);
    
    // If check-in date is in the past, it might be due to year parsing issue
    if (checkInDate < today) {
      return {
        success: false,
        error: `Check-in date (${normalizedCheckIn}) is in the past. Please provide dates in the current year (${today.getFullYear()}) or future.`
      };
    }
    
    // Validate date order
    if (checkInDate >= checkOutDate) {
      return {
        success: false,
        error: 'Check-out date must be after check-in date'
      };
    }
    
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * property.price_per_night;

    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        property_id: propertyId,
        guest_id: user.id,
        check_in: normalizedCheckIn,
        check_out: normalizedCheckOut,
        guest_count: guestCount,
        total_price: totalPrice,
        status: 'confirmed'
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return {
        success: false,
        error: `Failed to create booking: ${bookingError.message}`
      };
    }

    return {
      success: true,
      booking: {
        id: booking.id,
        property: {
          title: property.title,
          city: property.city,
          country: property.country
        },
        checkIn: normalizedCheckIn,
        checkOut: normalizedCheckOut,
        guestCount,
        nights,
        pricePerNight: property.price_per_night,
        totalPrice,
        status: booking.status,
        createdAt: booking.created_at
      }
    };
  },
});

// Tool for canceling a booking
const cancelBooking = tool({
  description: 'Cancel an existing booking for the logged-in user. Only upcoming bookings can be canceled.',
  inputSchema: z.object({
    bookingId: z.string().describe('The ID of the booking to cancel'),
  }),
  execute: async ({ bookingId }) => {
    const supabase = createClient();
    
    // Get user authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        error: 'User must be logged in to cancel bookings',
        requiresAuth: true
      };
    }

    // First check if the booking exists and belongs to the user
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select(`
        id,
        check_in,
        check_out,
        guest_count,
        total_price,
        status,
        guest_id,
        properties (
          id,
          title,
          city,
          country
        )
      `)
      .eq('id', bookingId)
      .single();
    
    if (fetchError || !booking) {
      return {
        success: false,
        error: 'Booking not found'
      };
    }

    // Verify the booking belongs to the current user
    if (booking.guest_id !== user.id) {
      return {
        success: false,
        error: 'You can only cancel your own bookings'
      };
    }

    // Check if booking is already canceled
    if (booking.status === 'cancelled') {
      return {
        success: false,
        error: 'This booking is already canceled'
      };
    }

    // Check if booking is already completed
    if (booking.status === 'completed') {
      return {
        success: false,
        error: 'Cannot cancel a completed booking'
      };
    }

    // Check if check-in date has passed
    const today = new Date();
    const checkInDate = new Date(booking.check_in);
    
    if (checkInDate <= today) {
      return {
        success: false,
        error: 'Cannot cancel bookings that have already started or passed'
      };
    }

    // Cancel the booking
    const { data: canceledBooking, error: cancelError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .select()
      .single();

    if (cancelError) {
      console.error('Error canceling booking:', cancelError);
      return {
        success: false,
        error: `Failed to cancel booking: ${cancelError.message}`
      };
    }

    return {
      success: true,
      canceledBooking: {
        id: booking.id,
        property: booking.properties,
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        guestCount: booking.guest_count,
        totalPrice: booking.total_price,
        status: 'cancelled'
      }
    };
  },
});

// Tool for getting user bookings
const getUserBookings = tool({
  description: 'Get the current user\'s bookings with optional filtering',
  inputSchema: z.object({
    filter: z.enum(['all', 'upcoming', 'past', 'cancelled']).optional().describe('Filter bookings by status'),
    limit: z.number().optional().describe('Maximum number of bookings to return'),
  }),
  execute: async ({ filter = 'all', limit = 10 }) => {
    const supabase = createClient();
    
    // Get user authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        bookings: [],
        total: 0,
        requiresAuth: true,
        message: 'Please sign in to view your bookings.'
      };
    }

    let query = supabase
      .from('bookings')
      .select(`
        id,
        check_in,
        check_out,
        guest_count,
        total_price,
        status,
        created_at,
        properties (
          id,
          title,
          city,
          country,
          property_images (
            url
          )
        )
      `)
      .eq('guest_id', user.id);

    // Apply filters
    const today = new Date().toISOString().split('T')[0];
    
    switch (filter) {
      case 'upcoming':
        query = query.gte('check_in', today).eq('status', 'confirmed');
        break;
      case 'past':
        query = query.lt('check_out', today).eq('status', 'completed');
        break;
      case 'cancelled':
        query = query.eq('status', 'cancelled');
        break;
      default:
        // 'all' - no additional filter
        break;
    }

    const { data: bookings, error } = await query
      .order('check_in', { ascending: false })
      .limit(limit);
    
    if (error) {
      return {
        bookings: [],
        total: 0,
        error: 'Failed to fetch bookings'
      };
    }

    return {
      bookings: bookings || [],
      total: bookings?.length || 0,
      filter
    };
  },
});

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    const supabase = createClient();

    // Get user authentication status
    const { data: { user } } = await supabase.auth.getUser();
    
    let userContext = '';
    let userProfile = null;

    if (user) {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      userProfile = profile;
      
      // Get user's bookings for context
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          id,
          check_in,
          check_out,
          guest_count,
          total_price,
          status,
          properties (
            title,
            city,
            country
          )
        `)
        .eq('guest_id', user.id)
        .order('check_in', { ascending: false });

      userContext = `\n\nUser Context:
- User is logged in as: ${profile?.full_name}
- User type: ${profile?.user_type}
- User ID: ${user.id}
- User has ${bookings?.length || 0} total bookings
${(bookings && bookings.length > 0) ? `- Recent bookings: ${bookings.slice(0, 3).map(b => `${b.properties?.title} in ${b.properties?.city} (${b.check_in} to ${b.check_out}, ${b.status})`).join(', ')}` : ''}

When the user asks about their trips or bookings, you can see they have ${bookings?.length || 0} bookings. Provide specific details about their bookings when asked.`;
    } else {
      userContext = '\n\nUser Context: User is not logged in. If they ask about bookings or want to make a booking, politely ask them to sign in first.';
    }

    // Stream the response with user context and tools
    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: SYSTEM_PROMPT + userContext,
      messages: convertToModelMessages(messages),
      stopWhen: stepCountIs(5),
      tools: {
        getCurrentDate,
        searchProperties,
        checkAvailability,
        createBooking,
        cancelBooking,
        getUserBookings,
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    
    // Return a proper error response
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred while processing your request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}