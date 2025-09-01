'use client'

import { useState } from 'react'

interface PropertyImage {
  url: string
  display_order: number
}

interface PropertyImageGalleryProps {
  images: PropertyImage[]
  propertyTitle: string
  isMobile: boolean
}

export function PropertyImageGallery({ images, propertyTitle, isMobile }: PropertyImageGalleryProps) {
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <p className="text-gray-500">No photos available</p>
        </div>
      </div>
    )
  }

  if (isMobile) {
    return (
      <>
        {/* Mobile Image Carousel */}
        <div className="relative">
          <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
            <img
              src={images[currentImageIndex]?.url}
              alt={`${propertyTitle} - Photo ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Navigation Controls */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* Show All Photos Button */}
          {images.length > 1 && (
            <button
              onClick={() => setShowAllPhotos(true)}
              className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-gray-900 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              All {images.length} photos
            </button>
          )}
        </div>

        {/* Full Screen Photo Modal */}
        {showAllPhotos && (
          <PhotoModal
            images={images}
            currentIndex={currentImageIndex}
            onClose={() => setShowAllPhotos(false)}
            onImageChange={setCurrentImageIndex}
            propertyTitle={propertyTitle}
          />
        )}
      </>
    )
  }

  // Desktop Layout
  if (images.length === 1) {
    return (
      <div className="w-full h-96 rounded-lg overflow-hidden">
        <img
          src={images[0].url}
          alt={propertyTitle}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return (
    <>
      <div className="relative overflow-hidden"> {/* Added relative positioning and overflow hidden */}
        <div className="grid grid-cols-4 gap-2 h-96">
          {/* Main Image */}
          <div className="col-span-2 row-span-2">
            <button
              onClick={() => setShowAllPhotos(true)}
              className="w-full h-full rounded-l-lg overflow-hidden group relative"
            >
              <img
                src={images[0]?.url}
                alt={propertyTitle}
                className="w-full h-full object-cover group-hover:brightness-90 transition-all"
              />
            </button>
          </div>

        {/* Secondary Images */}
        {images.slice(1, 5).map((image, index) => (
          <div
            key={index}
            className={`${index === 1 || index === 3 ? 'rounded-r-lg' : ''} ${
              index === 0 ? 'rounded-tr-lg' : index === 3 ? 'rounded-br-lg' : ''
            } overflow-hidden relative group`}
          >
            <button
              onClick={() => setShowAllPhotos(true)}
              className="w-full h-full"
            >
              <img
                src={image.url}
                alt={`${propertyTitle} - Photo ${index + 2}`}
                className="w-full h-full object-cover group-hover:brightness-90 transition-all"
              />
              
              {/* Show All Photos Overlay - only on last visible image */}
              {index === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="text-white text-center">
                    <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">+{images.length - 5} more</span>
                  </div>
                </div>
              )}
            </button>
          </div>
        ))}
        </div>

        {/* Show All Photos Button */}
        <button
          onClick={() => setShowAllPhotos(true)}
          className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-300 z-10"
        >
          <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Show all {images.length} photos
        </button>
      </div>

      {/* Full Screen Photo Modal */}
      {showAllPhotos && (
        <PhotoModal
          images={images}
          currentIndex={currentImageIndex}
          onClose={() => setShowAllPhotos(false)}
          onImageChange={setCurrentImageIndex}
          propertyTitle={propertyTitle}
        />
      )}
    </>
  )
}

interface PhotoModalProps {
  images: PropertyImage[]
  currentIndex: number
  onClose: () => void
  onImageChange: (index: number) => void
  propertyTitle: string
}

function PhotoModal({ images, currentIndex, onClose, onImageChange, propertyTitle }: PhotoModalProps) {
  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-black/50 p-4 z-10">
        <div className="flex items-center justify-between text-white">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 hover:opacity-75 transition-opacity"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Close</span>
          </button>
          <span className="text-sm">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
      </div>

      {/* Main Image */}
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src={images[currentIndex]?.url}
          alt={`${propertyTitle} - Photo ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />
        
        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => onImageChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => onImageChange(currentIndex === images.length - 1 ? 0 : currentIndex + 1)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4">
        <div className="flex space-x-2 justify-center overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => onImageChange(index)}
              className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-all ${
                index === currentIndex ? 'border-white' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}