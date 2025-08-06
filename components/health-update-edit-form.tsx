'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Weight, 
  Ruler, 
  Heart, 
  Activity, 
  DollarSign,
  User,
  FileText,
  Tag,
  X
} from 'lucide-react'
import { HealthUpdate, HealthUpdateMedia, AnimalMedia } from '@/types/animal'
import { updateHealthUpdate, createAuditLog } from '@/lib/firestore'
import { MediaUpload } from './media-upload'
import { MediaGallery } from './media-gallery'

interface HealthUpdateEditFormProps {
  healthUpdate: HealthUpdate
  animalName: string
  onSuccess?: (healthUpdate: HealthUpdate) => void
  onCancel?: () => void
}

export function HealthUpdateEditForm({ healthUpdate, animalName, onSuccess, onCancel }: HealthUpdateEditFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: healthUpdate.title,
    description: healthUpdate.description || '',
    date: healthUpdate.date.toISOString().split('T')[0],
    weight: healthUpdate.weight?.toString() || '',
    weightUnit: healthUpdate.weightUnit || 'kg' as const,
    height: healthUpdate.height?.toString() || '',
    heightUnit: healthUpdate.heightUnit || 'cm' as const,
    veterinarian: healthUpdate.veterinarian || '',
    cost: healthUpdate.cost?.toString() || '',
    nextDueDate: healthUpdate.nextDueDate ? healthUpdate.nextDueDate.toISOString().split('T')[0] : '',
    tags: healthUpdate.tags || [],
  })
  const [tagInput, setTagInput] = useState('')
  const [media, setMedia] = useState<HealthUpdateMedia[]>(healthUpdate.media || [])
  const [showMediaUpload, setShowMediaUpload] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      // Create update data, only including fields with actual values
      const updateData: any = {
        type: 'general', // Default type for merged form
        title: formData.title,
        date: new Date(formData.date),
      }

      // Only add optional fields if they have values
      if (formData.description?.trim()) {
        updateData.description = formData.description.trim()
      }
      
      if (formData.weight) {
        updateData.weight = parseFloat(formData.weight)
        updateData.weightUnit = formData.weightUnit
      }
      
      if (formData.height) {
        updateData.height = parseFloat(formData.height)
        updateData.heightUnit = formData.heightUnit
      }
      
      if (formData.veterinarian?.trim()) {
        updateData.veterinarian = formData.veterinarian.trim()
      }
      
      if (formData.cost) {
        updateData.cost = parseFloat(formData.cost)
      }
      
      if (formData.nextDueDate) {
        updateData.nextDueDate = new Date(formData.nextDueDate)
      }
      
      if (formData.tags.length > 0) {
        updateData.tags = formData.tags
      }
      
      if (media.length > 0) {
        updateData.media = media
      }

      console.log('Updating health update:', healthUpdate.id, updateData)
      await updateHealthUpdate(healthUpdate.id, updateData)

      // Create audit log
      const auditLogData: any = {
        animalId: healthUpdate.animalId,
        action: 'updated',
        entityType: 'health_update',
        entityId: healthUpdate.id,
        userId: user.uid,
        timestamp: new Date(),
        summary: `Updated health update: ${formData.title}`,
        metadata: {
          type: 'general',
        }
      }

      if (user.displayName) {
        auditLogData.userName = user.displayName
      }
      
      if (user.email) {
        auditLogData.userEmail = user.email
      }

      await createAuditLog(auditLogData)

      const updatedHealthUpdate: HealthUpdate = {
        ...healthUpdate,
        ...updateData,
        updatedAt: new Date(), // Set the current timestamp
      }

      onSuccess?.(updatedHealthUpdate)
    } catch (error: any) {
      console.error('Error updating health update:', error)
      const errorMessage = error?.message || error?.code || 'Unknown error occurred'
      alert(`Failed to update health update: ${errorMessage}. Please check the console for more details.`)
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleMediaUpload = (uploadedMedia: HealthUpdateMedia | AnimalMedia) => {
    // For health updates, we need to ensure it's a HealthUpdateMedia
    if ('healthUpdateId' in uploadedMedia) {
      setMedia(prev => [...prev, uploadedMedia as HealthUpdateMedia])
    }
  }

  const handleMediaDelete = (mediaId: string) => {
    setMedia(prev => prev.filter(m => m.id !== mediaId))
  }

  const handleMediaError = (error: string) => {
    console.error('Media upload error:', error)
    // You could show a toast notification here
  }



  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
                    <CardTitle className="flex items-center text-gray-900 dark:text-white">
          <FileText className="h-5 w-5 mr-2 text-emerald-600" />
          <span className="ml-2">Edit Health Update for {animalName}</span>
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Update comprehensive health information including measurements, medical details, and observations
        </CardDescription>
          </div>
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Weekly weigh-in, Vet checkup, Health check"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Weight & Height Measurements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Weight
              </label>
              <div className="flex">
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0.0"
                />
                <select
                  value={formData.weightUnit}
                  onChange={(e) => setFormData(prev => ({ ...prev, weightUnit: e.target.value as any }))}
                  className="px-3 py-2 border-l-0 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Height
              </label>
              <div className="flex">
                <input
                  type="number"
                  step="0.1"
                  value={formData.height}
                  onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0.0"
                />
                <select
                  value={formData.heightUnit}
                  onChange={(e) => setFormData(prev => ({ ...prev, heightUnit: e.target.value as any }))}
                  className="px-3 py-2 border-l-0 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="cm">cm</option>
                  <option value="inches">inches</option>
                  <option value="hands">hands</option>
                </select>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Veterinarian
              </label>
              <input
                type="text"
                value={formData.veterinarian}
                onChange={(e) => setFormData(prev => ({ ...prev, veterinarian: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                placeholder="Dr. Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cost
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">£</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Next Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Next Due Date
            </label>
            <input
              type="date"
              value={formData.nextDueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, nextDueDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
              placeholder="Additional notes, observations, or treatment details..."
            />
          </div>

          {/* Media Upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Media (Photos, Documents, Videos)
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowMediaUpload(!showMediaUpload)}
              >
                <FileText className="h-4 w-4 mr-2" />
                {showMediaUpload ? 'Hide Upload' : 'Add Media'}
              </Button>
            </div>
            
            {showMediaUpload && (
              <MediaUpload
                animalId={healthUpdate.animalId}
                healthUpdateId={healthUpdate.id}
                onUploadComplete={handleMediaUpload}
                onUploadError={handleMediaError}
                acceptedTypes={['photo', 'document', 'video']}
                categories={['before', 'after', 'document', 'other']}
                className="mb-4"
              />
            )}
            
            {media.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Uploaded Media ({media.length})
                </h4>
                <MediaGallery
                  media={media}
                  onDelete={handleMediaDelete}
                  showActions={true}
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-full text-xs"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-emerald-600 hover:text-emerald-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                placeholder="Add tag..."
              />
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
                className="rounded-l-none border-l-0"
              >
                <Tag className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? 'Updating...' : 'Update Health Record'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}