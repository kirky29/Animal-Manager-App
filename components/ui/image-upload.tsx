'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

interface ImageUploadProps {
  currentImageUrl?: string
  onImageUpload: (url: string) => void
  onImageRemove: () => void
  userId: string
  animalId?: string
  disabled?: boolean
}

export function ImageUpload({ 
  currentImageUrl, 
  onImageUpload, 
  onImageRemove, 
  userId, 
  animalId,
  disabled = false 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 2MB for base64 storage)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be smaller than 2MB for optimal performance')
      return
    }

    setUploading(true)

    try {
      // Convert file to base64 data URL - NO Firebase Storage!
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        setPreviewUrl(dataUrl)
        onImageUpload(dataUrl) // Pass the base64 data URL directly
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error processing image:', error)
      alert('Failed to process image. Please try again.')
      setPreviewUrl(currentImageUrl || null)
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    onImageRemove()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />
      
      {previewUrl ? (
        <div className="relative">
          <div className="w-32 h-32 mx-auto rounded-lg overflow-hidden border-2 border-dashed border-gray-300 bg-gray-100">
            <img
              src={previewUrl}
              alt="Profile preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="w-full h-full bg-primary/10 flex items-center justify-center hidden">
              <ImageIcon className="h-8 w-8 text-primary" />
            </div>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemoveImage}
            disabled={disabled || uploading}
            className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={`w-32 h-32 mx-auto rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors ${
            disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-xs text-gray-500 text-center">
                Click to upload<br />profile picture
              </p>
            </>
          )}
        </div>
      )}
      
      <div className="text-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={disabled || uploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Processing...' : 'Upload Image'}
        </Button>
        <p className="text-xs text-gray-500 mt-1">
          JPG, PNG, GIF up to 2MB
        </p>
      </div>
    </div>
  )
}