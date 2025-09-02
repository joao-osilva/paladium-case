'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Loader2, MicOff } from 'lucide-react';

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
        className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 cursor-not-allowed"
        title={error || "Voice input not supported"}
      >
        <MicOff className="w-4 h-4" />
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
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 select-none touch-manipulation ${
        isRecording
          ? 'bg-red-500 text-white scale-110 shadow-lg'
          : isTranscribing
          ? 'bg-yellow-500 text-white'
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:bg-gray-200'
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
        <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
      ) : isTranscribing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
}