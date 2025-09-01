'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    if (disabled || isRecording || isTranscribing) {
      console.log('Cannot start recording - disabled or already active');
      return;
    }

    try {
      console.log('Starting audio recording...');
      setError(null);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      streamRef.current = stream;

      // Use WAV format for better compatibility with Deepgram
      let mimeType = 'audio/wav';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // Fallback to WebM if WAV not supported
        mimeType = 'audio/webm;codecs=opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/webm';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/ogg;codecs=opus';
          }
        }
      }
      
      console.log('Using audio format:', mimeType);
      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        console.log('Audio data available:', event.data.size);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, processing audio...');
        await processRecording();
      };

      // Handle errors
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording failed');
        cleanup();
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      console.log('Recording started');

    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      setIsSupported(false);
      cleanup();
    }
  }, [disabled, isRecording, isTranscribing]);

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !isRecording) {
      console.log('No active recording to stop');
      return;
    }

    console.log('Stopping recording...');
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  }, [isRecording]);

  const processRecording = useCallback(async () => {
    if (audioChunksRef.current.length === 0) {
      console.log('No audio data to process');
      cleanup();
      return;
    }

    try {
      console.log('Processing', audioChunksRef.current.length, 'audio chunks');
      setIsTranscribing(true);

      // Create audio blob with detected mime type
      const mimeType = audioChunksRef.current[0]?.type || 'audio/wav';
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      console.log('Created audio blob:', audioBlob.size, 'bytes', 'type:', mimeType);

      // Skip if too small (likely silence)
      if (audioBlob.size < 1000) {
        console.log('Audio too small, likely silence - skipping transcription');
        cleanup();
        return;
      }

      // Prepare form data
      const formData = new FormData();
      const extension = mimeType.includes('webm') ? 'webm' : mimeType.includes('ogg') ? 'ogg' : 'wav';
      formData.append('audio', audioBlob, `recording.${extension}`);

      // Send to transcription API
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('Transcription result:', result);

      if (result.success && result.transcript && result.transcript.trim()) {
        console.log('Sending transcript to chat:', result.transcript);
        onTranscript(result.transcript.trim());
      } else if (result.message) {
        console.log('Transcription message:', result.message);
        // Don't show error for "no speech detected"
      } else {
        console.log('No transcript received');
      }

    } catch (err) {
      console.error('Transcription error:', err);
      setError(err instanceof Error ? err.message : 'Transcription failed');
    } finally {
      setIsTranscribing(false);
      cleanup();
    }
  }, [onTranscript]);

  const cleanup = useCallback(() => {
    // Stop tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Clear references
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    
    // Reset states
    setIsRecording(false);
  }, []);

  // Mouse/Touch handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    startRecording();
  }, [startRecording]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    stopRecording();
  }, [stopRecording]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    startRecording();
  }, [startRecording]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    stopRecording();
  }, [stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Show error state if not supported
  if (!isSupported) {
    return (
      <button
        type="button"
        disabled
        className="p-2 rounded-md text-red-400 cursor-not-allowed"
        title={error || "Voice input not supported"}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // Stop if mouse leaves button while holding
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      disabled={disabled || isTranscribing}
      className={`p-2 rounded-md transition-all duration-200 select-none ${
        isRecording
          ? 'bg-red-100 text-red-600 hover:bg-red-200 scale-110 shadow-lg'
          : isTranscribing
          ? 'bg-yellow-100 text-yellow-600'
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
      } ${(disabled || isTranscribing) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      title={
        isRecording 
          ? 'Recording... Release to send'
          : isTranscribing
          ? 'Transcribing audio...'
          : 'Hold to record voice message'
      }
    >
      {isRecording ? (
        <div className="w-5 h-5 relative">
          <div className="w-5 h-5 bg-red-600 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 w-5 h-5 bg-red-400 rounded-full animate-ping"></div>
        </div>
      ) : isTranscribing ? (
        <div className="w-5 h-5 relative">
          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )}
    </button>
  );
}