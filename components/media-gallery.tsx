'use client'

import React, { useState } from 'react'
import { Image, Video, FileText, Download, Eye, X, Edit3, Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { AnimalMedia, HealthUpdateMedia } from '@/types/animal'
import { ImageWithFallback } from './ui/image-with-fallback'

interface MediaGalleryProps {
  media: (AnimalMedia | HealthUpdateMedia)[]
  onEdit?: (media: AnimalMedia | HealthUpdateMedia) => void
  onDelete?: (mediaId: string) => void
  onDownload?: (media: AnimalMedia | HealthUpdateMedia) => void
  showActions?: boolean
  className?: string
}

export function MediaGallery({
  media,
  onEdit,
  onDelete,
  onDownload,
  showActions = true,
  className = ''
}: MediaGalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<AnimalMedia | HealthUpdateMedia | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = (media: AnimalMedia | HealthUpdateMedia) => {
    setSelectedMedia(media)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedMedia(null)
  }

  const getMediaIcon = (media: AnimalMedia | HealthUpdateMedia) => {
    switch (media.type) {
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const renderMediaThumbnail = (media: AnimalMedia | HealthUpdateMedia) => {
    switch (media.type) {
      case 'photo':
        return (
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
            <ImageWithFallback
              src={media.url}
              alt={media.caption || media.originalName}
              className="w-full h-full object-cover transition-transform hover:scale-105"
              fallbackIcon={<Image className="h-8 w-8 text-gray-400" />}
              fallbackClassName="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
            />
            {media.category && (
              <div className="absolute top-2 left-2">
                <span className="inline-flex items-center rounded-full bg-black/50 px-2 py-1 text-xs font-medium text-white">
                  {media.category}
                </span>
              </div>
            )}
          </div>
        )
      
      case 'video':
        return (
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
            <video
              src={media.url}
              className="h-full w-full object-cover"
              preload="metadata"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-black/50 p-2">
                <Video className="h-6 w-6 text-white" />
              </div>
            </div>
            {media.category && (
              <div className="absolute top-2 left-2">
                <span className="inline-flex items-center rounded-full bg-black/50 px-2 py-1 text-xs font-medium text-white">
                  {media.category}
                </span>
              </div>
            )}
          </div>
        )
      
      case 'document':
        return (
          <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {media.originalName}
              </p>
            </div>
            {media.category && (
              <div className="absolute top-2 left-2">
                <span className="inline-flex items-center rounded-full bg-black/50 px-2 py-1 text-xs font-medium text-white">
                  {media.category}
                </span>
              </div>
            )}
          </div>
        )
    }
  }

  if (media.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Image className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No media</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          No photos, videos, or documents have been uploaded yet.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ${className}`}>
        {media.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="relative group">
                <button
                  onClick={() => openModal(item)}
                  className="w-full text-left focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg"
                >
                  {renderMediaThumbnail(item)}
                </button>
                
                {showActions && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          openModal(item)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {onDownload && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDownload(item)
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {onEdit && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit(item)
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {onDelete && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(item.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.caption || item.originalName}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getMediaIcon(item)}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(item.fileSize)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(item.uploadedAt)}
                    </p>
                  </div>
                </div>
                
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 text-xs font-medium text-emerald-800 dark:text-emerald-200"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{item.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal for viewing media */}
      {isModalOpen && selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-h-full max-w-4xl overflow-auto rounded-lg bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedMedia.caption || selectedMedia.originalName}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={closeModal}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-4">
              {selectedMedia.type === 'photo' && (
                <div className="flex justify-center">
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.caption || selectedMedia.originalName}
                    className="max-h-96 max-w-full object-contain rounded-lg"
                  />
                </div>
              )}
              
              {selectedMedia.type === 'video' && (
                <div className="flex justify-center">
                  <video
                    src={selectedMedia.url}
                    controls
                    className="max-h-96 max-w-full rounded-lg"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
              
              {selectedMedia.type === 'document' && (
                <div className="flex justify-center">
                  <div className="text-center">
                    <FileText className="mx-auto h-16 w-16 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {selectedMedia.originalName}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4"
                      onClick={() => window.open(selectedMedia.url, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Document
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p><strong>Category:</strong> {selectedMedia.category}</p>
                <p><strong>File Size:</strong> {formatFileSize(selectedMedia.fileSize)}</p>
                <p><strong>Uploaded:</strong> {formatDate(selectedMedia.uploadedAt)}</p>
                {selectedMedia.caption && (
                  <p><strong>Caption:</strong> {selectedMedia.caption}</p>
                )}
                {selectedMedia.tags && selectedMedia.tags.length > 0 && (
                  <div>
                    <strong>Tags:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedMedia.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 text-xs font-medium text-emerald-800 dark:text-emerald-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 