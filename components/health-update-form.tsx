'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Weight, 
  Ruler, 
  Heart, 
  Activity, 
  Calendar,
  DollarSign,
  User,
  FileText,
  Tag,
  AlertTriangle,
  Camera,
  Image as ImageIcon
} from 'lucide-react'
import { HealthUpdate, HealthUpdateMedia, AnimalMedia } from '@/types/animal'
import { addHealthUpdate, createAuditLog, updateHealthUpdate } from '@/lib/firestore'
import { MediaUpload } from './media-upload'
import { MediaGallery } from './media-gallery'

interface HealthUpdateFormProps {
  animalId: string
  animalName: string
  onSuccess?: (healthUpdate: HealthUpdate) => void
  onCancel?: () => void
}

export function HealthUpdateForm({ animalId, animalName, onSuccess, onCancel }: HealthUpdateFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    weight: '',
    weightUnit: 'kg' as const,
    height: '',
    heightUnit: 'cm' as const,
    veterinarian: '',
    cost: '',
    nextDueDate: '',
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState('')
  const [media, setMedia] = useState<HealthUpdateMedia[]>([])
  const [showMediaUpload, setShowMediaUpload] = useState(false)
  const [tempHealthUpdateId] = useState(() => `temp_${Date.now()}`)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      // Create health update data, only including fields with actual values
      const healthUpdateData: any = {
        animalId,
        type: 'general', // Default type for merged form
        title: formData.title,
        date: new Date(formData.date),
        createdBy: user.uid,
        createdAt: new Date(),
      }

      // Only add optional fields if they have values
      if (formData.description?.trim()) {
        healthUpdateData.description = formData.description.trim()
      }
      
      if (formData.weight) {
        healthUpdateData.weight = parseFloat(formData.weight)
        healthUpdateData.weightUnit = formData.weightUnit
      }
      
      if (formData.height) {
        healthUpdateData.height = parseFloat(formData.height)
        healthUpdateData.heightUnit = formData.heightUnit
      }
      
      if (formData.veterinarian?.trim()) {
        healthUpdateData.veterinarian = formData.veterinarian.trim()
      }
      
      if (formData.cost) {
        healthUpdateData.cost = parseFloat(formData.cost)
      }
      
      if (formData.nextDueDate) {
        healthUpdateData.nextDueDate = new Date(formData.nextDueDate)
      }
      
      if (formData.tags.length > 0) {
        healthUpdateData.tags = formData.tags
      }
      
      if (media.length > 0) {
        healthUpdateData.media = media
      }

      console.log('Attempting to save health update:', healthUpdateData)
      const healthUpdateId = await addHealthUpdate(healthUpdateData)
      console.log('Health update saved with ID:', healthUpdateId)

      // Update media objects with the actual health update ID
      if (media.length > 0) {
        const updatedMedia = media.map(mediaItem => ({
          ...mediaItem,
          healthUpdateId: healthUpdateId
        }))
        
        // Update the health update with the corrected media
        await updateHealthUpdate(healthUpdateId, { media: updatedMedia })
        console.log('Updated media with actual health update ID')
      }

      // Create audit log (only include fields with values)
      const auditLogData: any = {
        animalId,
        action: 'health_added',
        entityType: 'health_update',
        entityId: healthUpdateId,
        userId: user.uid,
        timestamp: new Date(),
        summary: `Added health update: ${formData.title}`,
        metadata: {
          type: 'general',
          hasWeight: !!formData.weight,
          hasHeight: !!formData.height,
          hasVet: !!formData.veterinarian,
          hasCost: !!formData.cost,
        }
      }

      if (user.displayName) {
        auditLogData.userName = user.displayName
      }
      
      if (user.email) {
        auditLogData.userEmail = user.email
      }

      await createAuditLog(auditLogData)

      const createdUpdate: HealthUpdate = {
        id: healthUpdateId,
        ...healthUpdateData,
      }

      onSuccess?.(createdUpdate)
    } catch (error: any) {
      console.error('Error adding health update:', error)
      const errorMessage = error?.message || error?.code || 'Unknown error occurred'
      alert(`Failed to add health update: ${errorMessage}. Please check the console for more details.`)
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
    console.log('Media uploaded:', uploadedMedia)
    // For health updates, we need to ensure it's a HealthUpdateMedia
    if ('healthUpdateId' in uploadedMedia) {
      setMedia(prev => [...prev, uploadedMedia as HealthUpdateMedia])
      console.log('Media added to health update')
    } else {
      console.log('Media is not a HealthUpdateMedia type')
    }
  }

  const handleMediaDelete = (mediaId: string) => {
    setMedia(prev => prev.filter(m => m.id !== mediaId))
  }

  const handleMediaError = (error: string) => {
    console.error('Media upload error:', error)
    alert(`Media upload failed: ${error}`)
  }



  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-900 dark:text-white">
          <Plus className="h-5 w-5 mr-2 text-emerald-600" />
          Add Health Update for {animalName}
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Record comprehensive health information including measurements, medical details, and observations
        </CardDescription>
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
                <ImageIcon className="h-4 w-4 mr-2" />
                {showMediaUpload ? 'Hide Upload' : 'Add Media'}
              </Button>
            </div>
            
            {showMediaUpload && (
              <MediaUpload
                animalId={animalId}
                healthUpdateId={tempHealthUpdateId}
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
              {loading ? 'Adding...' : 'Add Health Update'}
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