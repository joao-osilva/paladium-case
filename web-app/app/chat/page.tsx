import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ChatInterface } from '@/components/ai/ChatInterface';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'AI Assistant | PaxBnb',
  description: 'Chat with our AI assistant to find and book amazing properties'
};

export default async function ChatPage() {
  const supabase = createClient()
  
  // Check authentication status
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get user profile if authenticated
  let userProfile = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    userProfile = profile
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userProfile={userProfile} showAIAssistant={false} />

      {/* Main Chat Interface */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(100vh-180px)]">
          <ChatInterface className="h-full" />
        </div>
        
        {/* Minimalistic Footer */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            PaxBnb AI Assistant - Powered by advanced language models
          </p>
        </div>
      </div>
    </div>
  );
}