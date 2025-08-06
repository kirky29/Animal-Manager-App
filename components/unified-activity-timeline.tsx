'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  Weight, 
  Ruler, 
  Heart, 
  Activity, 
  FileText,
  User,
  Calendar,
  DollarSign,
  Tag,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
  Eye,
  Edit,
  Trash2,
  History,
  Plus,
  UserCheck,
  Pencil,
  Archive
} from 'lucide-react'
import { HealthUpdate, AuditLog } from '@/types/animal'
import { getHealthUpdates, deleteHealthUpdate, getAuditLogs, deleteMedia } from '@/lib/firestore'
import { format, formatDistanceToNow } from 'date-fns'
import { HealthUpdateEditForm } from './health-update-edit-form'
import { MediaGallery } from './media-gallery'

interface TimelineItem {
  id: string
  type: 'health_update' | 'audit_log'
  date: Date
  data: HealthUpdate | AuditLog
}

interface UnifiedActivityTimelineProps {
  animalId: string
  animalName: string
  refreshTrigger?: number
  onMediaDeleted?: () => void
}

export function UnifiedActivityTimeline({ animalId, animalName, refreshTrigger, onMediaDeleted }: UnifiedActivityTimelineProps) {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('health_updates')
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [editingUpdate, setEditingUpdate] = useState<HealthUpdate | null>(null)

  const loadTimelineData = async () => {
    try {
      console.log('Loading timeline data for animal:', animalId)
      
      // Load both health updates and audit logs in parallel
      const [healthUpdates, auditLogs] = await Promise.all([
        getHealthUpdates(animalId),
        getAuditLogs(animalId)
      ])

      console.log('Loaded health updates:', healthUpdates.length)
      console.log('Loaded audit logs:', auditLogs.length)

      // Combine into timeline items (include all audit logs, filtering will happen later)
      const items: TimelineItem[] = [
        ...healthUpdates.map(update => ({
          id: `health_${update.id}`,
          type: 'health_update' as const,
          date: update.date,
          data: update
        })),
        ...auditLogs.map(log => ({
          id: `audit_${log.id}`,
          type: 'audit_log' as const,
          date: log.timestamp,
          data: log
        }))
      ]

      // Sort by date (newest first)
      items.sort((a, b) => b.date.getTime() - a.date.getTime())
      
      console.log('Combined timeline items:', items.length)
      setTimelineItems(items)
    } catch (error) {
      console.error('Error loading timeline data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTimelineData()
  }, [animalId, refreshTrigger])

  const handleDelete = async (updateId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteHealthUpdate(updateId)
      setTimelineItems(prev => prev.filter(item => item.id !== `health_${updateId}`))
    } catch (error) {
      console.error('Error deleting health update:', error)
      alert('Failed to delete health update. Please try again.')
    }
  }

  const handleEditSuccess = (updatedHealthUpdate: HealthUpdate) => {
    setEditingUpdate(null)
    setTimelineItems(prev => 
      prev.map(item => 
        item.id === `health_${updatedHealthUpdate.id}` 
          ? { ...item, data: updatedHealthUpdate, date: updatedHealthUpdate.date } // Keep original date for sorting
          : item
      ) // Don't re-sort - keep original chronological order
    )
  }

  const handleEdit = (update: HealthUpdate) => {
    setEditingUpdate(update)
  }

  const handleMediaDelete = async (mediaId: string) => {
    try {
      // Find the media item in the timeline
      let mediaToDelete: any = null
      let healthUpdateId: string | null = null
      
      for (const item of timelineItems) {
        if (item.type === 'health_update') {
          const update = item.data as HealthUpdate
          if (update.media) {
            const foundMedia = update.media.find((m: any) => m.id === mediaId)
            if (foundMedia) {
              mediaToDelete = foundMedia
              healthUpdateId = update.id
              break
            }
          }
        }
      }
      
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
      
      // Reload timeline data to reflect the change
      await loadTimelineData()
      
      console.log('Media deleted from timeline successfully:', mediaId)
      onMediaDeleted?.() // Call the prop if provided
    } catch (error) {
      console.error('Error deleting media from timeline:', error)
      alert('Failed to delete media. Please try again.')
    }
  }

  const getTypeIcon = (item: TimelineItem) => {
    if (item.type === 'health_update') {
      const update = item.data as HealthUpdate
      switch (update.type) {
        case 'weight': return <Weight className="h-4 w-4" />
        case 'height': return <Ruler className="h-4 w-4" />
        case 'medical': return <Heart className="h-4 w-4" />
        default: return <FileText className="h-4 w-4" />
      }
    } else {
      const audit = item.data as AuditLog
      switch (audit.action) {
        case 'created': return <Plus className="h-4 w-4" />
        case 'updated': return <Pencil className="h-4 w-4" />
        case 'deleted': return <Archive className="h-4 w-4" />
        case 'health_added': return <Heart className="h-4 w-4" />
        case 'weight_recorded': return <Weight className="h-4 w-4" />
        case 'medical_added': return <Heart className="h-4 w-4" />
        default: return <History className="h-4 w-4" />
      }
    }
  }



  const renderHealthUpdate = (item: TimelineItem) => {
    const update = item.data as HealthUpdate
    const isExpanded = expandedItem === item.id
    
    // Check if recently edited (within last 24 hours)
    const isRecentlyEdited = update.updatedAt && 
      update.updatedAt.getTime() > Date.now() - (24 * 60 * 60 * 1000) &&
      update.updatedAt.getTime() > update.createdAt.getTime() + (5 * 60 * 1000) // More than 5 minutes after creation

    return (
      <div className="relative">
        {/* Timeline dot */}
        <div className="absolute left-0 top-6 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
        
        {/* Content */}
        <div className="ml-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="flex-shrink-0 mt-1 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                {getTypeIcon(item)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">{update.title}</h3>

                  {isRecentlyEdited && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700">
                      <Pencil className="h-3 w-3 mr-1" />
                      Recently Edited
                    </span>
                  )}
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                    Health Update
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                    {update.type}
                  </span>
                </div>
                
                <div className="flex items-center text-xs text-gray-500 space-x-4 mb-2">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(update.date, 'MMM d, yyyy')}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(update.createdAt, { addSuffix: true })}
                  </span>
                  {isRecentlyEdited && update.updatedAt && (
                    <span className="flex items-center text-orange-600">
                      <Pencil className="h-3 w-3 mr-1" />
                      Edited {formatDistanceToNow(update.updatedAt, { addSuffix: true })}
                    </span>
                  )}
                </div>

                {/* Quick stats for weight/height updates */}
                <div className="flex items-center space-x-4 mb-2">
                  {update.weight && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Weight className="h-4 w-4 mr-1 text-emerald-500" />
                      <span className="font-medium">{update.weight} {update.weightUnit}</span>
                    </div>
                  )}
                  {update.height && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Ruler className="h-4 w-4 mr-1 text-emerald-500" />
                      <span className="font-medium">{update.height} {update.heightUnit}</span>
                    </div>
                  )}
                </div>

                {update.description && !isExpanded && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{update.description}</p>
                )}

                {/* Tags */}
                {update.tags && update.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {update.tags.slice(0, isExpanded ? undefined : 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {!isExpanded && update.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{update.tags.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                  className="text-gray-500 hover:text-gray-700"
                  title="View details"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(update)}
                  className="text-blue-500 hover:text-blue-700"
                  title="Edit update"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(update.id, update.title)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete update"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-3">
              {update.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{update.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {update.veterinarian && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Veterinarian</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {update.veterinarian}
                    </p>
                  </div>
                )}

                {update.cost && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <DollarSign className="h-3 w-3 mr-1" />
                      £{update.cost.toFixed(2)}
                    </p>
                  </div>
                )}

                {update.nextDueDate && (
                  <div className="col-span-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Next Due Date</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(update.nextDueDate, 'MMM d, yyyy')}
                    </p>
                  </div>
                )}
              </div>

              {/* Media Gallery */}
              {update.media && update.media.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Media ({update.media.length})</h4>
                  <MediaGallery
                    media={update.media}
                    showActions={true}
                    onDelete={handleMediaDelete}
                    className="max-h-64 overflow-y-auto"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderAuditLog = (item: TimelineItem) => {
    const audit = item.data as AuditLog
    const isExpanded = expandedItem === item.id

    return (
      <div className="relative">
        {/* Timeline dot */}
        <div className="absolute left-0 top-6 w-3 h-3 bg-gray-400 rounded-full border-2 border-white shadow-sm"></div>
        
        {/* Content */}
        <div className="ml-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="flex-shrink-0 mt-1 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                {getTypeIcon(item)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{audit.summary}</h3>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                    Profile Change
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                    {audit.action}
                  </span>
                </div>
                
                <div className="flex items-center text-xs text-gray-500 space-x-4 mb-2">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(audit.timestamp, 'MMM d, yyyy')}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(audit.timestamp, { addSuffix: true })}
                  </span>
                  {audit.userName && (
                    <span className="flex items-center">
                      <UserCheck className="h-3 w-3 mr-1" />
                      {audit.userName}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                  className="text-gray-500 hover:text-gray-700"
                  title="View details"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          {isExpanded && audit.changes && audit.changes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Changes Made</h4>
              <div className="space-y-2">
                {audit.changes.map((change, index) => {
                  // Helper function to safely render values that might be timestamps or other objects
                  const renderValue = (value: any) => {
                    if (!value) return '(empty)'
                    if (value && typeof value === 'object' && value.toDate) {
                      // It's a Firestore Timestamp
                      return format(value.toDate(), 'MMM d, yyyy')
                    }
                    if (value instanceof Date) {
                      return format(value, 'MMM d, yyyy')
                    }
                    if (typeof value === 'object') {
                      return JSON.stringify(value)
                    }
                    return String(value)
                  }

                  return (
                    <div key={index} className="text-xs bg-gray-50 dark:bg-gray-700/50 rounded p-2">
                      <span className="font-medium">{change.field}:</span>
                      <div className="mt-1">
                        <span className="text-red-600">- {renderValue(change.oldValue)}</span>
                      </div>
                      <div>
                        <span className="text-green-600">+ {renderValue(change.newValue)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Filter timeline items
  const filteredItems = timelineItems.filter(item => {
    if (filter === 'all') {
      // Show everything when "All Activity" is selected
      return true
    }
    
    if (filter === 'health_updates') {
      // Only show health updates
      return item.type === 'health_update'
    }
    
    if (filter === 'profile_changes') {
      // Only show meaningful profile changes (exclude health-related audit logs)
      if (item.type === 'audit_log') {
        const audit = item.data as AuditLog
        return !audit.action.includes('health_added') && 
               !audit.action.includes('weight_recorded') && 
               !audit.action.includes('medical_added') &&
               audit.action !== 'updated' // Exclude health update edit logs
      }
      return false
    }
    
    // For specific health update types
    if (item.type === 'health_update') {
      const update = item.data as HealthUpdate
      return update.type === filter
    }
    
    return false
  })

  console.log('Rendering UnifiedActivityTimeline - timelineItems:', timelineItems.length, 'filteredItems:', filteredItems.length, 'filter:', filter)

  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <span className="ml-2 text-gray-600">Loading activity...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-gray-900 dark:text-white">
              <History className="h-5 w-5 mr-2" />
              Activity Timeline for {animalName}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Complete history of health updates and changes
            </CardDescription>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex items-center space-x-4 pt-4">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Activity</option>
            <option value="health_updates">Health Updates Only</option>
            <option value="profile_changes">Profile Changes Only</option>
            <option value="weight">Weight Updates</option>
            <option value="medical">Medical Updates</option>
            <option value="general">General Updates</option>
            <option value="behavior">Behavior Updates</option>
            <option value="diet">Diet Updates</option>
            <option value="exercise">Exercise Updates</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {/* Edit Form */}
        {editingUpdate && (
          <div className="mb-6">
            <HealthUpdateEditForm
              healthUpdate={editingUpdate}
              animalName={animalName}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingUpdate(null)}
            />
          </div>
        )}

        {filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {filter === 'all' ? 'No Activity Yet' : `No ${filter.replace('_', ' ')} Activity`}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'all' 
                ? 'Health updates and profile changes will appear here.'
                : `No ${filter.replace('_', ' ')} found. Try changing the filter.`}
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-600"></div>
            
            {/* Timeline items */}
            <div className="space-y-6">
              {filteredItems.map((item, index) => (
                <div key={item.id} className="relative">
                  {item.type === 'health_update' 
                    ? renderHealthUpdate(item)
                    : renderAuditLog(item)
                  }
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}