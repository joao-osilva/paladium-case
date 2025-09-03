'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const videos = [
    {
      id: 'BBxrkibbFDs',
      title: 'User Registration',
      description: 'Quick and seamless onboarding experience',
      isShort: true
    },
    {
      id: 'jIXbUINY4kU',
      title: 'Host Flow',
      description: 'List your property and manage bookings effortlessly',
      isShort: false
    },
    {
      id: 'Xl0GssxKPBk',
      title: 'Guest Flow',
      description: 'Find and book your perfect stay with AI assistance',
      isShort: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-64 h-64 sm:w-96 sm:h-96 bg-pink-200 rounded-full blur-3xl opacity-15 sm:opacity-20"
          style={{ 
            top: '10%', 
            left: '5%',
            transform: `translateY(${scrollY * 0.1}px)`
          }}
        />
        <div 
          className="absolute w-64 h-64 sm:w-96 sm:h-96 bg-blue-200 rounded-full blur-3xl opacity-15 sm:opacity-20"
          style={{ 
            bottom: '10%', 
            right: '5%',
            transform: `translateY(${scrollY * -0.1}px)`
          }}
        />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#FF385C]">
              PaxBnb
            </h1>
            <div className="flex items-center gap-2 sm:gap-4">
              <a
                href="https://paxbnb.neustudio.co/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 sm:px-4 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors font-medium text-sm sm:text-base min-h-[44px] flex items-center"
              >
                <span className="hidden sm:inline">Launch App</span>
                <span className="sm:hidden">App</span>
              </a>
              <a
                href="https://github.com/neustudio-adm/paladium-case"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base min-h-[44px]"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`relative min-h-screen flex items-center justify-center px-4 pt-20 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-6 inline-block">
            <span className="px-4 py-2 bg-gradient-to-r from-pink-100 to-blue-100 text-[#FF385C] rounded-full text-sm font-medium">
              AI-Powered Property Rental Platform
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Welcome to <span className="text-[#FF385C]">PaxBnb</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            Experience the future of travel booking with our AI assistant. 
            Find your perfect stay through natural conversation.
          </p>

          <div className="flex flex-col gap-4 justify-center items-center max-w-md mx-auto">
            <a
              href="https://paxbnb.neustudio.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-8 py-4 bg-[#FF385C] text-white rounded-xl font-semibold text-lg hover:bg-[#E31C5F] hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-center min-h-[56px] flex items-center justify-center"
            >
              🚀 Try Live App
            </a>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <a
                href="#demo"
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-white transition-all duration-300 text-center min-h-[48px] flex items-center justify-center"
              >
                🎬 Watch Demo
              </a>
              <a
                href="https://github.com/neustudio-adm/paladium-case"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-white transition-all duration-300 text-center min-h-[48px] flex items-center justify-center"
              >
                📂 View Code
              </a>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity" />
              <div className="w-14 h-14 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Search</h3>
              <p className="text-gray-600">Natural language property search with intelligent recommendations</p>
            </div>

            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity" />
              <div className="w-14 h-14 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Booking</h3>
              <p className="text-gray-600">Book properties in seconds with real-time availability</p>
            </div>

            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity" />
              <div className="w-14 h-14 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Voice Commands</h3>
              <p className="text-gray-600">Search and book using natural voice interactions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Videos Section */}
      <section id="demo" className="py-20 px-4 bg-gradient-to-b from-transparent to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              See PaxBnb in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the complete journey from registration to booking
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {videos.map((video, index) => (
              <div 
                key={video.id}
                className={`group relative bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="aspect-video relative bg-gray-100">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={video.title}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-[#FF385C] transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-gray-600">{video.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#FF385C] to-[#E31C5F] relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Transform Your Travel Experience?
          </h2>
          <p className="text-xl text-pink-100 mb-8">
            Explore the code and contribute to the future of AI-powered travel booking
          </p>
          <a
            href="https://github.com/neustudio-adm/paladium-case"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#FF385C] rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            View on GitHub
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600">
            © 2025 PaxBnb - AI-Powered Property Rental Platform
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm sm:text-base">
            <a
              href="https://paxbnb.neustudio.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-[#FF385C] transition-colors font-medium min-h-[44px] flex items-center px-2"
            >
              Live App
            </a>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <a
              href="https://github.com/neustudio-adm/paladium-case"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700 transition-colors min-h-[44px] flex items-center px-2"
            >
              GitHub
            </a>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <a
              href="#demo"
              className="text-gray-500 hover:text-gray-700 transition-colors min-h-[44px] flex items-center px-2"
            >
              Demo Videos
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}