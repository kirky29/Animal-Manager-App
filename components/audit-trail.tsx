'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  History, 
  User, 
  Calendar, 
  Edit, 
  Plus, 
  Trash2, 
  Weight, 
  Heart,
  Activity,
  FileText,
  Filter,
  ChevronDown,
  ChevronRight,
  Eye,
  Clock
} from 'lucide-react'
import { AuditLog } from '@/types/animal'
import { getAuditLogs } from '@/lib/firestore'
import { format, formatDistanceToNow } from 'date-fns'

interface AuditTrailProps {
  animalId: string
  animalName: string
  refreshTrigger?: number
}

export function AuditTrail({ animalId, animalName, refreshTrigger }: AuditTrailProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [expandedLog, setExpandedLog] = useState<string | null>(null)

  const loadAuditLogs = async () => {
    try {
      const logs = await getAuditLogs(animalId)
      setAuditLogs(logs)
    } catch (error) {
      console.error('Error loading audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAuditLogs()
  }, [animalId, refreshTrigger])

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <Plus className="h-4 w-4" />
      case 'updated': return <Edit className="h-4 w-4" />
      case 'deleted': return <Trash2 className="h-4 w-4" />
      case 'health_added': return <Heart className="h-4 w-4" />
      case 'weight_recorded': return <Weight className="h-4 w-4" />
      case 'medical_added': return <Activity className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700'
      case 'updated': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700'
      case 'deleted': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'
      case 'health_added': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700'
      case 'weight_recorded': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700'
      case 'medical_added': return 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-700'
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
    }
  }

  const getEntityTypeLabel = (entityType: string) => {
    switch (entityType) {
      case 'animal': return 'Animal Profile'
      case 'health_update': return 'Health Update'
      case 'weight_record': return 'Weight Record'
      case 'height_record': return 'Height Record'
      case 'medical_record': return 'Medical Record'
      default: return entityType
    }
  }

  const formatChangeValue = (value: any): string => {
    if (value === null || value === undefined) return 'None'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (value instanceof Date) return format(value, 'MMM d, yyyy')
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  const filteredLogs = auditLogs.filter(log => 
    filter === 'all' || log.action === filter
  )

  const uniqueActions = Array.from(new Set(auditLogs.map(log => log.action)))

  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardContent className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading activity history...</span>
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
              <History className="h-5 w-5 mr-2 text-emerald-600" />
              Activity History
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Complete audit trail of all changes made to {animalName}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>
                  {action.charAt(0).toUpperCase() + action.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {filter === 'all' ? 'No Activity Yet' : `No ${filter.replace('_', ' ')} Actions`}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'all' 
                ? 'Activity will appear here as changes are made to this animal.'
                : `No ${filter.replace('_', ' ')} actions have been recorded yet.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log, index) => (
              <div
                key={log.id}
                className="relative flex items-start space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {/* Timeline Line */}
                {index < filteredLogs.length - 1 && (
                  <div className="absolute left-6 top-16 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div>
                )}

                {/* Action Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${getActionColor(log.action)}`}>
                  {getActionIcon(log.action)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {log.summary}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                          {log.action.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {log.userName || log.userEmail || 'Unknown User'}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(log.timestamp)} ago
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(log.timestamp, 'MMM d, yyyy HH:mm')}
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span className="font-medium">{getEntityTypeLabel(log.entityType)}</span>
                        {log.metadata && (
                          <span className="ml-2">
                            {Object.entries(log.metadata).map(([key, value]) => (
                              <span key={key} className="inline-block mr-2">
                                <span className="text-gray-500">{key}:</span> {String(value)}
                              </span>
                            ))}
                          </span>
                        )}
                      </div>

                      {/* Changes Details (expandable) */}
                      {log.changes && log.changes.length > 0 && (
                        <div className="mt-2">
                          <button
                            onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                            className="flex items-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                          >
                            {expandedLog === log.id ? (
                              <ChevronDown className="h-4 w-4 mr-1" />
                            ) : (
                              <ChevronRight className="h-4 w-4 mr-1" />
                            )}
                            View {log.changes.length} change{log.changes.length !== 1 ? 's' : ''}
                          </button>

                          {expandedLog === log.id && (
                            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div className="space-y-2">
                                {log.changes.map((change, changeIndex) => (
                                  <div key={changeIndex} className="text-sm">
                                    <div className="font-medium text-gray-900 dark:text-white capitalize">
                                      {change.field.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                    </div>
                                    <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400 mt-1">
                                      <div>
                                        <span className="text-red-600 dark:text-red-400">From:</span>{' '}
                                        <span className="font-mono bg-red-50 dark:bg-red-900/20 px-1 py-0.5 rounded">
                                          {formatChangeValue(change.oldValue)}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-green-600 dark:text-green-400">To:</span>{' '}
                                        <span className="font-mono bg-green-50 dark:bg-green-900/20 px-1 py-0.5 rounded">
                                          {formatChangeValue(change.newValue)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}