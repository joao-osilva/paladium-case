import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { PROPERTY_EXTRACTION_PROMPT } from '@/lib/ai/property-extraction-prompts';

export async function POST(request: NextRequest) {
  try {
    const { description, images } = await request.json();

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: 'Property description is required' },
        { status: 400 }
      );
    }

    // Prepare the prompt with user's description
    const fullPrompt = `${PROPERTY_EXTRACTION_PROMPT}

USER DESCRIPTION:
"${description.trim()}"

${images && images.length > 0 ? `
IMAGES PROVIDED: ${images.length} images uploaded (this indicates the host has visual materials ready)
` : ''}

Extract the property details and return as JSON:`;

    // Use OpenAI to extract property information
    const { text } = await generateText({
      model: openai('gpt-4-turbo-preview'),
      prompt: fullPrompt,
      temperature: 0.7,
    });

    // Try to parse the JSON response
    let extractedData;
    try {
      // Clean the response in case there's extra text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : text;
      extractedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response:', text);
      return NextResponse.json(
        { 
          error: 'Failed to process property description',
          details: 'AI response could not be parsed'
        },
        { status: 500 }
      );
    }

    // Validate the extracted data structure
    const requiredFields = ['title', 'description', 'location', 'locationType', 'specifications'];
    const missingFields = requiredFields.filter(field => !extractedData[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields in AI response:', missingFields, extractedData);
      return NextResponse.json(
        { 
          error: 'Incomplete property extraction',
          details: `Missing fields: ${missingFields.join(', ')}`
        },
        { status: 500 }
      );
    }

    // Validate and sanitize the extracted data
    const sanitizedData = {
      title: String(extractedData.title).slice(0, 100), // Ensure max length
      description: String(extractedData.description).slice(0, 1000),
      location: {
        city: String(extractedData.location?.city || ''),
        country: String(extractedData.location?.country || ''),
        address: String(extractedData.location?.address || '')
      },
      locationType: extractedData.locationType || 'city',
      specifications: {
        bedrooms: Math.max(0, parseInt(extractedData.specifications?.bedrooms) || 1),
        bathrooms: Math.max(0.5, parseFloat(extractedData.specifications?.bathrooms) || 1),
        beds: Math.max(1, parseInt(extractedData.specifications?.beds) || 1),
        maxGuests: Math.max(1, Math.min(20, parseInt(extractedData.specifications?.maxGuests) || 2))
      },
      pricePerNight: Math.max(10, Math.min(10000, parseInt(extractedData.pricePerNight) || 100)),
      amenities: Array.isArray(extractedData.amenities) 
        ? extractedData.amenities.slice(0, 10) // Limit amenities
        : [],
      confidence: extractedData.confidence || 'Medium',
      originalDescription: description.trim()
    };

    console.log('Successfully extracted property data:', {
      title: sanitizedData.title,
      location: sanitizedData.location,
      locationType: sanitizedData.locationType,
      confidence: sanitizedData.confidence
    });

    return NextResponse.json({
      success: true,
      data: sanitizedData
    });

  } catch (error) {
    console.error('Property extraction API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}