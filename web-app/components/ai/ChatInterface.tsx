'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import ReactMarkdown from 'react-markdown';
import { Send, Loader2, MessageCircle, User } from 'lucide-react';
import { GREETING_SUGGESTIONS } from '@/lib/ai/prompts';
import { SearchResults } from './GenerativeUI/SearchResults';
import { BookingsList } from './GenerativeUI/BookingsList';
import { AvailabilityCheck } from './GenerativeUI/AvailabilityCheck';
import { BookingConfirmation } from './GenerativeUI/BookingConfirmation';
import { BookingCancellation } from './GenerativeUI/BookingCancellation';
import { VoiceInput } from './VoiceInput';

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className = '' }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, error, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  // Simple loading state management
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(inputValue || '').trim() || isLoading) return;
    
    setIsLoading(true);
    try {
      sendMessage({ text: (inputValue || '').trim() });
      setInputValue('');
      setIsExpanded(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      // We'll set loading to false after we receive a response
      // For now, let's use a timeout to simulate this
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    }
  }, [inputValue]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Stop loading when assistant responds
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      setIsLoading(false);
    }
  }, [messages]);

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    // Focus input after selecting suggestion
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleVoiceInput = async (transcript: string) => {
    if (!transcript || !transcript.trim() || isLoading) return;
    
    // Directly send the transcribed message
    setIsLoading(true);
    try {
      sendMessage({ text: transcript.trim() });
      setInputValue('');
      setIsExpanded(false);
    } catch (error) {
      console.error('Error sending voice message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">PaxBnb AI</h3>
            <p className="text-xs text-gray-500">
              {isLoading ? 'Thinking...' : 'Find your perfect stay'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isEmpty && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Find your perfect stay
            </h3>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              Search properties, check availability, or ask me anything!
            </p>
            
            {/* Suggestions */}
            <div className="grid gap-2 max-w-lg mx-auto">
              {GREETING_SUGGESTIONS.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm text-gray-700 hover:text-gray-900"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {!isEmpty && (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-gray-100' 
                      : 'bg-blue-600'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-gray-600" />
                    ) : (
                      <MessageCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex-1 space-y-2">
                  {message.parts.map((part, partIndex) => {
                    if (part.type === 'text') {
                      return (
                        <div
                          key={partIndex}
                          className={`rounded-lg px-3 py-2 max-w-full sm:max-w-2xl ${
                            message.role === 'user'
                              ? 'bg-gray-100 text-gray-900'
                              : 'bg-blue-50 text-gray-900'
                          }`}
                        >
                          <div className="text-sm leading-relaxed">
                            {message.role === 'user' ? (
                              <span className="whitespace-pre-wrap">{part.text}</span>
                            ) : (
                              <div className="prose prose-sm max-w-none">
                                <ReactMarkdown 
                                  components={{
                                    h1: ({children}) => <h1 className="text-lg font-semibold text-gray-900 mt-2 mb-1">{children}</h1>,
                                    h2: ({children}) => <h2 className="text-base font-semibold text-gray-900 mt-2 mb-1">{children}</h2>,
                                    h3: ({children}) => <h3 className="text-sm font-semibold text-gray-900 mt-1 mb-1">{children}</h3>,
                                    p: ({children}) => <p className="text-gray-700 my-1">{children}</p>,
                                    ul: ({children}) => <ul className="text-gray-700 my-1 ml-4 list-disc">{children}</ul>,
                                    li: ({children}) => <li className="text-gray-700">{children}</li>,
                                    strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>
                                  }}
                                >
                                  {part.text}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }

                    if (part.type === 'tool-searchProperties') {
                      switch (part.state) {
                        case 'input-streaming':
                          return (
                            <div key={partIndex} className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm text-blue-800">Preparing property search...</span>
                              </div>
                            </div>
                          );
                        case 'input-available':
                          return (
                            <div key={partIndex} className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm text-blue-800">Searching for properties...</span>
                              </div>
                            </div>
                          );
                        case 'output-available':
                          return (
                            <div key={partIndex}>
                              <SearchResults results={part.output as any} />
                            </div>
                          );
                        case 'output-error':
                          return (
                            <div key={partIndex} className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <p className="text-red-800 text-sm">Error searching properties: {part.errorText}</p>
                            </div>
                          );
                      }
                    }

                    if (part.type === 'tool-checkAvailability') {
                      switch (part.state) {
                        case 'input-streaming':
                          return (
                            <div key={partIndex} className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm text-blue-800">Preparing availability check...</span>
                              </div>
                            </div>
                          );
                        case 'input-available':
                          return (
                            <div key={partIndex} className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm text-blue-800">Checking availability...</span>
                              </div>
                            </div>
                          );
                        case 'output-available':
                          return (
                            <div key={partIndex}>
                              <AvailabilityCheck result={part.output as any} />
                            </div>
                          );
                        case 'output-error':
                          return (
                            <div key={partIndex} className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <p className="text-red-800 text-sm">Error checking availability: {part.errorText}</p>
                            </div>
                          );
                      }
                    }

                    if (part.type === 'tool-createBooking') {
                      switch (part.state) {
                        case 'input-streaming':
                          return (
                            <div key={partIndex} className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm text-blue-800">Preparing your booking...</span>
                              </div>
                            </div>
                          );
                        case 'input-available':
                          return (
                            <div key={partIndex} className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm text-blue-800">Creating your booking...</span>
                              </div>
                            </div>
                          );
                        case 'output-available':
                          return (
                            <div key={partIndex}>
                              <BookingConfirmation result={part.output as any} />
                            </div>
                          );
                        case 'output-error':
                          return (
                            <div key={partIndex} className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <p className="text-red-800 text-sm">Error creating booking: {part.errorText}</p>
                            </div>
                          );
                      }
                    }

                    if (part.type === 'tool-cancelBooking') {
                      switch (part.state) {
                        case 'input-streaming':
                          return (
                            <div key={partIndex} className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm text-orange-800">Preparing cancellation...</span>
                              </div>
                            </div>
                          );
                        case 'input-available':
                          return (
                            <div key={partIndex} className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm text-orange-800">Canceling your booking...</span>
                              </div>
                            </div>
                          );
                        case 'output-available':
                          return (
                            <div key={partIndex}>
                              <BookingCancellation result={part.output as any} />
                            </div>
                          );
                        case 'output-error':
                          return (
                            <div key={partIndex} className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <p className="text-red-800 text-sm">Error canceling booking: {part.errorText}</p>
                            </div>
                          );
                      }
                    }

                    if (part.type === 'tool-getUserBookings') {
                      switch (part.state) {
                        case 'input-streaming':
                          return (
                            <div key={partIndex} className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm text-blue-800">Preparing bookings query...</span>
                              </div>
                            </div>
                          );
                        case 'input-available':
                          return (
                            <div key={partIndex} className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm text-blue-800">Loading your bookings...</span>
                              </div>
                            </div>
                          );
                        case 'output-available':
                          return (
                            <div key={partIndex}>
                              <BookingsList bookings={part.output as any} />
                            </div>
                          );
                        case 'output-error':
                          return (
                            <div key={partIndex} className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <p className="text-red-800 text-sm">Error loading bookings: {part.errorText}</p>
                            </div>
                          );
                      }
                    }

                    return null;
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-blue-50 rounded-lg px-4 py-3 max-w-xs">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
            <p className="text-red-800 text-sm">
              Sorry, I encountered an error. Please try again.
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white p-3 safe-area-pb">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <textarea
              ref={inputRef}
              value={inputValue || ''}
              onChange={handleInputChange}
              onFocus={() => setIsExpanded(true)}
              onBlur={() => setTimeout(() => setIsExpanded(false), 100)}
              placeholder="Ask me anything about your stay..."
              className="w-full resize-none rounded-xl border border-gray-300 pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32 min-h-[44px] text-base"
              rows={1}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            
            {/* Voice input button - positioned for right thumb access */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <VoiceInput onTranscript={handleVoiceInput} disabled={isLoading} />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}