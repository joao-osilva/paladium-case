import { createClient } from '@deepgram/sdk';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Deepgram client
const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.DEEPGRAM_API_KEY) {
      console.error('DEEPGRAM_API_KEY not configured');
      return NextResponse.json(
        { error: 'Speech transcription service not configured' },
        { status: 500 }
      );
    }

    // Parse form data to get audio file
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    console.log('Received audio file:', {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type
    });

    console.log('Processing transcription with Deepgram...', { fileType: audioFile.type });

    // Simplified transcription options - let Deepgram auto-detect format and language
    const transcriptionOptions = {
      model: 'nova-2',
      detect_language: true,  // Auto-detect language
      smart_format: true,
      punctuate: true,
      diarize: false,
      utterances: false,
    };

    // Convert File to Buffer for Deepgram
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      transcriptionOptions
    );

    if (error) {
      console.error('Deepgram transcription error:', error);
      return NextResponse.json(
        { error: 'Transcription failed', details: error.message },
        { status: 500 }
      );
    }

    // Extract transcript
    const transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript;

    if (!transcript || transcript.trim() === '') {
      console.log('No speech detected in audio');
      return NextResponse.json(
        { transcript: '', confidence: 0, message: 'No speech detected' },
        { status: 200 }
      );
    }

    const confidence = result?.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;

    console.log('Transcription successful:', {
      transcript: transcript.substring(0, 100) + (transcript.length > 100 ? '...' : ''),
      confidence,
      length: transcript.length
    });

    return NextResponse.json({
      transcript: transcript.trim(),
      confidence,
      success: true
    });

  } catch (error) {
    console.error('Transcription API error:', error);
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