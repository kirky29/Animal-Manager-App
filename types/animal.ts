export interface Animal {
  id: string
  name: string
  species: AnimalSpecies
  breed?: string
  dateOfBirth: Date
  dateOfDeath?: Date
  sex: string
  color?: string
  markings?: string
  microchipNumber?: string
  registrationNumber?: string
  profilePicture?: string
  notes?: string
  // Physical measurements
  weight?: number
  weightUnit?: 'kg' | 'lbs' | 'stone'
  height?: number
  heightUnit?: 'cm' | 'inches' | 'hands'
  // Media management
  media?: AnimalMedia[]
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export interface WeightRecord {
  id: string
  animalId: string
  weight: number
  unit: 'kg' | 'lbs'
  date: Date
  notes?: string
}

export interface HeightRecord {
  id: string
  animalId: string
  height: number
  unit: 'cm' | 'inches' | 'hands'
  date: Date
  notes?: string
}

export interface MedicalRecord {
  id: string
  animalId: string
  type: 'vaccination' | 'checkup' | 'treatment' | 'surgery' | 'medication' | 'other'
  title: string
  description?: string
  date: Date
  veterinarian?: string
  cost?: number
  nextDueDate?: Date
  documents?: string[]
}

export interface HealthUpdate {
  id: string
  animalId: string
  type: 'weight' | 'height' | 'medical' | 'general'
  title: string
  description?: string
  date: Date
  createdBy: string
  createdAt: Date
  updatedAt?: Date
  // For weight updates
  weight?: number
  weightUnit?: 'kg' | 'lbs'
  // For height updates
  height?: number
  heightUnit?: 'cm' | 'inches' | 'hands'
  // For medical updates
  veterinarian?: string
  cost?: number
  nextDueDate?: Date
  // General fields
  tags?: string[]
  // Media management
  media?: HealthUpdateMedia[]
}

export interface AuditLog {
  id: string
  animalId: string
  action: 'created' | 'updated' | 'deleted' | 'health_added' | 'weight_recorded' | 'medical_added'
  entityType: 'animal' | 'health_update' | 'weight_record' | 'height_record' | 'medical_record'
  entityId: string
  userId: string
  userName?: string
  userEmail?: string
  timestamp: Date
  changes?: {
    field: string
    oldValue: any
    newValue: any
  }[]
  summary: string
  metadata?: {
    [key: string]: any
  }
}

export type AnimalSpecies = 
  | 'horse'
  | 'dog'
  | 'cat'
  | 'pig'
  | 'goat'
  | 'llama'
  | 'alpaca'
  | 'ferret'
  | 'parrot'
  | 'bird-of-prey'
  | 'chicken'
  | 'rabbit'
  | 'sheep'
  | 'cow'
  | 'other'

// Utility functions for species-appropriate measurements
export const getWeightUnits = (species: AnimalSpecies): { value: 'kg' | 'lbs' | 'stone'; label: string }[] => {
  switch (species) {
    case 'horse':
      return [
        { value: 'kg', label: 'kg' },
        { value: 'lbs', label: 'lbs' }
      ]
    case 'dog':
    case 'cat':
      return [
        { value: 'kg', label: 'kg' },
        { value: 'lbs', label: 'lbs' }
      ]
    case 'pig':
    case 'cow':
    case 'sheep':
      return [
        { value: 'kg', label: 'kg' },
        { value: 'lbs', label: 'lbs' },
        { value: 'stone', label: 'stone' }
      ]
    case 'goat':
    case 'llama':
    case 'alpaca':
      return [
        { value: 'kg', label: 'kg' },
        { value: 'lbs', label: 'lbs' }
      ]
    case 'ferret':
    case 'rabbit':
      return [
        { value: 'kg', label: 'kg' },
        { value: 'lbs', label: 'lbs' }
      ]
    case 'parrot':
    case 'bird-of-prey':
    case 'chicken':
      return [
        { value: 'kg', label: 'kg' },
        { value: 'lbs', label: 'lbs' }
      ]
    default:
      return [
        { value: 'kg', label: 'kg' },
        { value: 'lbs', label: 'lbs' }
      ]
  }
}

export const getHeightUnits = (species: AnimalSpecies): { value: 'cm' | 'inches' | 'hands'; label: string }[] => {
  switch (species) {
    case 'horse':
      return [
        { value: 'hands', label: 'hands' },
        { value: 'cm', label: 'cm' },
        { value: 'inches', label: 'inches' }
      ]
    case 'dog':
    case 'cat':
      return [
        { value: 'cm', label: 'cm' },
        { value: 'inches', label: 'inches' }
      ]
    case 'pig':
    case 'cow':
    case 'sheep':
    case 'goat':
    case 'llama':
    case 'alpaca':
      return [
        { value: 'cm', label: 'cm' },
        { value: 'inches', label: 'inches' }
      ]
    case 'ferret':
    case 'rabbit':
      return [
        { value: 'cm', label: 'cm' },
        { value: 'inches', label: 'inches' }
      ]
    case 'parrot':
    case 'bird-of-prey':
    case 'chicken':
      return [
        { value: 'cm', label: 'cm' },
        { value: 'inches', label: 'inches' }
      ]
    default:
      return [
        { value: 'cm', label: 'cm' },
        { value: 'inches', label: 'inches' }
      ]
  }
}

export interface AnimalFormData {
  name: string
  species: AnimalSpecies
  breed?: string
  dateOfBirth: string
  dateOfDeath?: string
  sex: string
  color?: string
  markings?: string
  microchipNumber?: string
  registrationNumber?: string
  profilePicture?: string
  notes?: string
  // Physical measurements
  weight?: number
  weightUnit?: 'kg' | 'lbs' | 'stone'
  height?: number
  heightUnit?: 'cm' | 'inches' | 'hands'
}

// Media Management Types
export interface AnimalMedia {
  id: string
  animalId: string
  type: 'photo' | 'document' | 'video'
  fileName: string
  originalName: string
  fileSize: number
  mimeType: string
  url: string
  thumbnailUrl?: string
  caption?: string
  category: 'profile' | 'gallery' | 'medical' | 'certificate' | 'other'
  uploadedBy: string
  uploadedAt: Date
  tags?: string[]
  metadata?: {
    width?: number
    height?: number
    duration?: number // for videos
    [key: string]: any
  }
}

export interface HealthUpdateMedia {
  id: string
  healthUpdateId: string
  animalId: string
  type: 'photo' | 'document' | 'video'
  fileName: string
  originalName: string
  fileSize: number
  mimeType: string
  url: string
  thumbnailUrl?: string
  caption?: string
  category: 'before' | 'after' | 'document' | 'other'
  uploadedBy: string
  uploadedAt: Date
  tags?: string[]
  metadata?: {
    width?: number
    height?: number
    duration?: number // for videos
    [key: string]: any
  }
}

export interface MediaUploadProgress {
  file: File
  progress: number
  status: 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
  uploadedMedia?: AnimalMedia | HealthUpdateMedia
}