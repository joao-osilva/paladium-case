'use client';

interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args: Record<string, any>;
  result?: any;
  state: 'partial-call' | 'call' | 'result';
}

interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'tool';
  content?: string;
  toolInvocations?: ToolInvocation[];
}
import { SearchResults } from './GenerativeUI/SearchResults';
import { PropertyCard } from './GenerativeUI/PropertyCard';
import { AvailabilityCheck } from './GenerativeUI/AvailabilityCheck';
import { BookingWidget } from './GenerativeUI/BookingWidget';
import { BookingsList } from './GenerativeUI/BookingsList';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const parseToolResult = (content: string) => {
    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
  };

  const renderToolInvocation = (invocation: ToolInvocation) => {
    const { toolName, args, result, state } = invocation;

    // Show loading state for pending tool calls
    if (state === 'call' && !result) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-blue-800">
              {toolName === 'searchProperties' && 'Searching for properties...'}
              {toolName === 'getUserBookings' && 'Loading your bookings...'}
            </span>
          </div>
        </div>
      );
    }

    // Show tool results with visual components
    if (state === 'result' && result) {
      switch (toolName) {
        case 'searchProperties':
          return <SearchResults results={result} />;
        
        case 'getUserBookings':
          return <BookingsList bookings={result} />;
        
        default:
          return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
              <pre className="text-sm text-gray-700">{JSON.stringify(result, null, 2)}</pre>
            </div>
          );
      }
    }

    return null;
  };

  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <div key={index} className="flex gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              message.role === 'user' 
                ? 'bg-gray-100' 
                : 'bg-blue-600'
            }`}>
              {message.role === 'user' ? (
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              )}
            </div>
          </div>

          {/* Message Content */}
          <div className="flex-1 space-y-2">
            {/* Text Content */}
            {message.content && (
              <div className={`rounded-lg px-4 py-2 max-w-3xl ${
                message.role === 'user'
                  ? 'bg-gray-100 text-gray-900'
                  : 'bg-blue-50 text-gray-900'
              }`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
              </div>
            )}

            {/* Tool Invocations */}
            {message.toolInvocations?.map((invocation, invIndex) => (
              <div key={`${invocation.toolCallId}-${invIndex}`}>
                {renderToolInvocation(invocation)}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
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
    </div>
  );
}