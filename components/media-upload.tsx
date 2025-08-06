'use client'

import React, { useState, useCallback } from 'react'
import { Upload, X, Image, FileText, Video, Camera, Plus } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { AnimalMedia, HealthUpdateMedia, MediaUploadProgress } from '@/types/animal'
import { storage } from '@/lib/firebase'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid'
import { useAuth } from '@/lib/auth-context'

interface MediaUploadProps {
  animalId: string
  healthUpdateId?: string // Optional, for health update media
  onUploadComplete: (media: AnimalMedia | HealthUpdateMedia) => void
  onUploadError?: (error: string) => void
  maxFiles?: number
  acceptedTypes?: ('photo' | 'document' | 'video')[]
  categories?: string[]
  className?: string
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const ACCEPTED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']

export function MediaUpload({
  animalId,
  healthUpdateId,
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  acceptedTypes = ['photo', 'document', 'video'],
  categories = ['gallery', 'medical', 'certificate', 'other'],
  className = ''
}: MediaUploadProps) {
  const { user } = useAuth()
  const [uploads, setUploads] = useState<MediaUploadProgress[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const getFileType = (file: File): 'photo' | 'document' | 'video' => {
    if (ACCEPTED_IMAGE_TYPES.includes(file.type)) return 'photo'
    if (ACCEPTED_VIDEO_TYPES.includes(file.type)) return 'video'
    return 'document'
  }

  const validateFile = (file: File): string | null => {
    const fileType = getFileType(file)
    
    if (!acceptedTypes.includes(fileType)) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB`
    }
    
    return null
  }

  const uploadFile = useCallback(async (file: File) => {
    if (!user) {
      onUploadError?.('User not authenticated')
      return
    }

    const validationError = validateFile(file)
    if (validationError) {
      onUploadError?.(validationError)
      return
    }

    const fileType = getFileType(file)
    const fileId = uuidv4()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${fileId}.${fileExtension}`
    
    // Determine storage path with user ID
    const storagePath = healthUpdateId 
      ? `health-update-media/${user.uid}/${animalId}/${healthUpdateId}/${fileName}`
      : `animal-media/${user.uid}/${animalId}/${fileName}`

    const storageRef = ref(storage, storagePath)
    console.log('Uploading file to path:', storagePath)
    console.log('File details:', { name: file.name, size: file.size, type: file.type })
    
    const uploadTask = uploadBytesResumable(storageRef, file)

    // Create upload progress object
    const uploadProgress: MediaUploadProgress = {
      file,
      progress: 0,
      status: 'uploading'
    }

    setUploads(prev => [...prev, uploadProgress])

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setUploads(prev => 
          prev.map(upload => 
            upload.file === file 
              ? { ...upload, progress, status: 'uploading' as const }
              : upload
          )
        )
      },
      (error) => {
        console.error('Upload error:', error)
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        setUploads(prev => 
          prev.map(upload => 
            upload.file === file 
              ? { ...upload, status: 'error' as const, error: error.message }
              : upload
          )
        )
        onUploadError?.(error.message)
      },
      async () => {
        try {
          console.log('Upload completed successfully')
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          console.log('Download URL obtained:', downloadURL)
          
          // Create media object
          const mediaObject: AnimalMedia | HealthUpdateMedia = {
            id: fileId,
            animalId,
            ...(healthUpdateId && { healthUpdateId }),
            type: fileType,
            fileName,
            originalName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            url: downloadURL,
            category: healthUpdateId ? 'other' : 'gallery',
            uploadedBy: user.uid,
            uploadedAt: new Date(),
            tags: [],
            metadata: {}
          }
          
          console.log('Created media object:', mediaObject)

          // Update upload status
          setUploads(prev => 
            prev.map(upload => 
              upload.file === file 
                ? { ...upload, status: 'complete' as const, uploadedMedia: mediaObject }
                : upload
            )
          )

          onUploadComplete(mediaObject)
        } catch (error) {
          console.error('Error getting download URL:', error)
          setUploads(prev => 
            prev.map(upload => 
              upload.file === file 
                ? { ...upload, status: 'error' as const, error: 'Failed to get download URL' }
                : upload
            )
          )
          onUploadError?.('Failed to get download URL')
        }
      }
    )
  }, [animalId, healthUpdateId, onUploadComplete, onUploadError, acceptedTypes, user])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    files.forEach(uploadFile)
    event.target.value = '' // Reset input
  }

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(event.dataTransfer.files)
    files.forEach(uploadFile)
  }, [uploadFile])

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const removeUpload = (file: File) => {
    setUploads(prev => prev.filter(upload => upload.file !== file))
  }

  const getFileIcon = (file: File) => {
    const fileType = getFileType(file)
    switch (fileType) {
      case 'photo':
        return <Image className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'document':
        return <FileText className="h-4 w-4" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card className={`border-2 border-dashed transition-colors ${
        isDragging 
          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
          : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400'
      }`}>
        <CardContent className="p-6">
          <div
            className="flex flex-col items-center justify-center space-y-4"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <Upload className="h-6 w-6 text-emerald-600" />
            </div>
            
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Drop files here or click to upload
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Supports photos, documents, and videos up to 50MB
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('file-input')?.click()}
              className="mt-2"
            >
              <Camera className="h-4 w-4 mr-2" />
              Choose Files
            </Button>

            <input
              id="file-input"
              type="file"
              multiple
              accept={[
                ...ACCEPTED_IMAGE_TYPES,
                ...ACCEPTED_DOCUMENT_TYPES,
                ...ACCEPTED_VIDEO_TYPES
              ].join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Uploading Files ({uploads.length})
          </h4>
          
          {uploads.map((upload, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getFileIcon(upload.file)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {upload.file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(upload.file.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {upload.status === 'uploading' && (
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${upload.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {Math.round(upload.progress)}%
                        </span>
                      </div>
                    )}
                    
                    {upload.status === 'complete' && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-emerald-600 dark:text-emerald-400">
                          Complete
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUpload(upload.file)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    {upload.status === 'error' && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-red-600 dark:text-red-400">
                          Error: {upload.error}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUpload(upload.file)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 