'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Image, Plus, Filter, Download, Eye, Trash2 } from 'lucide-react'
import { AnimalMedia, HealthUpdateMedia } from '@/types/animal'
import { getAllAnimalMedia, deleteMedia } from '@/lib/firestore'
import { MediaGallery } from './media-gallery'
import { MediaUpload } from './media-upload'

interface AnimalMediaTabProps {
  animalId: string
  animalName: string
  refreshTrigger: number
  onMediaDeleted?: () => void
}

export function AnimalMediaTab({ animalId, animalName, refreshTrigger, onMediaDeleted }: AnimalMediaTabProps) {
  const [media, setMedia] = useState<(AnimalMedia | HealthUpdateMedia)[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [filter, setFilter] = useState<'all' | 'photo' | 'video' | 'document'>('all')

  useEffect(() => {
    loadMedia()
  }, [animalId, refreshTrigger])

  const loadMedia = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('AnimalMediaTab: Starting to load media for animalId:', animalId)
      const allMedia = await getAllAnimalMedia(animalId)
      console.log('AnimalMediaTab: Received media from getAllAnimalMedia:', allMedia)
      setMedia(allMedia)
      console.log('AnimalMediaTab: Media loaded successfully:', allMedia.length, 'items')
    } catch (err) {
      console.error('AnimalMediaTab: Error loading media:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load media'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleMediaUpload = (uploadedMedia: AnimalMedia | HealthUpdateMedia) => {
    console.log('Media uploaded:', uploadedMedia)
    setMedia(prev => [uploadedMedia, ...prev])
    setShowUpload(false)
  }

  const handleMediaError = (error: string) => {
    console.error('Media upload error:', error)
    alert(`Media upload failed: ${error}`)
  }

  const handleMediaDelete = async (mediaId: string) => {
    try {
      // Find the media item to delete
      const mediaToDelete = media.find(m => m.id === mediaId)
      if (!mediaToDelete) {
        console.error('Media not found for deletion:', mediaId)
        return
      }

      // Show confirmation dialog
      const mediaName = mediaToDelete.caption || mediaToDelete.originalName
      const isConfirmed = confirm(`Are you sure you want to delete "${mediaName}"? This action cannot be undone.`)
      
      if (!isConfirmed) {
        return
      }

      // Delete from database
      await deleteMedia(mediaToDelete)
      
      // Remove from local state
      setMedia(prev => prev.filter(m => m.id !== mediaId))
      
      console.log('Media deleted successfully:', mediaId)
      onMediaDeleted?.()
    } catch (error) {
      console.error('Error deleting media:', error)
      alert('Failed to delete media. Please try again.')
    }
  }

  const filteredMedia = media.filter(item => {
    if (filter === 'all') return true
    return item.type === filter
  })

  const getFilterCount = (type: 'all' | 'photo' | 'video' | 'document') => {
    if (type === 'all') return media.length
    return media.filter(item => item.type === type).length
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Loading Media</h3>
            <p className="text-gray-600 dark:text-gray-400">Getting media files...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800">
        <CardContent className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">Error</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={loadMedia} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Upload Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Media Gallery</h2>
          <p className="text-gray-600 dark:text-gray-400">
            All photos, videos, and documents for {animalName}
          </p>
        </div>
        <Button
          onClick={() => setShowUpload(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Media
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
        <div className="flex space-x-1">
          {[
            { id: 'all', label: 'All', icon: <Image className="h-4 w-4" /> },
            { id: 'photo', label: 'Photos', icon: <Image className="h-4 w-4" /> },
            { id: 'video', label: 'Videos', icon: <Image className="h-4 w-4" /> },
            { id: 'document', label: 'Documents', icon: <Image className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === tab.id
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
              <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">
                {getFilterCount(tab.id as any)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Media Upload Form */}
      {showUpload && (
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900 dark:text-white">
              <Plus className="h-5 w-5 mr-2 text-emerald-600" />
              Add Media to {animalName}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Upload photos, videos, or documents for this animal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MediaUpload
              animalId={animalId}
              onUploadComplete={handleMediaUpload}
              onUploadError={handleMediaError}
              acceptedTypes={['photo', 'document', 'video']}
              categories={['gallery', 'medical', 'certificate', 'other']}
              className="mb-4"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowUpload(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Media Gallery */}
      <div>
        {filteredMedia.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="text-center py-12">
              <Image className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                {filter === 'all' ? 'No media yet' : `No ${filter}s found`}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {filter === 'all' 
                  ? `No photos, videos, or documents have been uploaded for ${animalName} yet.`
                  : `No ${filter}s have been uploaded for ${animalName} yet.`
                }
              </p>
              <Button
                onClick={() => setShowUpload(true)}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Media
              </Button>
            </CardContent>
          </Card>
        ) : (
          <MediaGallery
            media={filteredMedia}
            onDelete={handleMediaDelete}
            showActions={true}
          />
        )}
      </div>
    </div>
  )
} 