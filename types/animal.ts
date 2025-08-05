export interface Animal {
  id: string
  name: string
  species: AnimalSpecies
  breed?: string
  dateOfBirth: Date
  dateOfDeath?: Date
  sex: 'male' | 'female'
  color?: string
  markings?: string
  microchipNumber?: string
  registrationNumber?: string
  profilePicture?: string
  notes?: string
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

export interface AnimalFormData {
  name: string
  species: AnimalSpecies
  breed?: string
  dateOfBirth: string
  dateOfDeath?: string
  sex: 'male' | 'female'
  color?: string
  markings?: string
  microchipNumber?: string
  registrationNumber?: string
  profilePicture?: string
  notes?: string
}