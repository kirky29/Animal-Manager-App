'use client'

import { useState } from 'react'
import { Heart, Image as ImageIcon } from 'lucide-react'

interface ImageWithFallbackProps {
  src?: string
  alt: string
  className?: string
  fallbackIcon?: React.ReactNode
  fallbackClassName?: string
  containerClassName?: string
}

export function ImageWithFallback({
  src,
  alt,
  className = "w-full h-full object-cover",
  fallbackIcon = <Heart className="h-6 w-6 text-primary" />,
  fallbackClassName = "w-full h-full bg-primary/10 flex items-center justify-center",
  containerClassName = ""
}: ImageWithFallbackProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  if (!src || imageError) {
    return (
      <div className={`${fallbackClassName} ${containerClassName}`}>
        {fallbackIcon}
      </div>
    )
  }

  return (
    <div className={`relative ${containerClassName}`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true)
          setImageLoading(false)
        }}
        style={{ display: imageLoading ? 'none' : 'block' }}
      />
    </div>
  )
} 