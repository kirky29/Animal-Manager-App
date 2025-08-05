import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'
import { db, storage } from './firebase'
import { Animal, AnimalFormData, WeightRecord, HeightRecord, MedicalRecord } from '@/types/animal'

// Animal CRUD operations
export const createAnimal = async (ownerId: string, animalData: AnimalFormData): Promise<string> => {
  const docRef = await addDoc(collection(db, 'animals'), {
    ...animalData,
    dateOfBirth: Timestamp.fromDate(new Date(animalData.dateOfBirth)),
    dateOfDeath: animalData.dateOfDeath ? Timestamp.fromDate(new Date(animalData.dateOfDeath)) : null,
    ownerId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
  return docRef.id
}

export const getAnimals = async (ownerId: string): Promise<Animal[]> => {
  try {
    console.log('Getting animals for ownerId:', ownerId)
    const q = query(
      collection(db, 'animals'),
      where('ownerId', '==', ownerId)
    )
    const querySnapshot = await getDocs(q)
    
    console.log('Query snapshot size:', querySnapshot.size)
    
    const animals = querySnapshot.docs.map(doc => {
      const data = doc.data()
      console.log('Animal data:', data)
      return {
        id: doc.id,
        ...data,
        dateOfBirth: data.dateOfBirth.toDate(),
        dateOfDeath: data.dateOfDeath?.toDate() || undefined,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      }
    }) as Animal[]
    
    console.log('Processed animals:', animals)
    return animals
  } catch (error) {
    console.error('Error in getAnimals:', error)
    throw error
  }
}

export const getAnimal = async (animalId: string): Promise<Animal | null> => {
  const docRef = doc(db, 'animals', animalId)
  const docSnap = await getDoc(docRef)
  
  if (docSnap.exists()) {
    const data = docSnap.data()
    return {
      id: docSnap.id,
      ...data,
      dateOfBirth: data.dateOfBirth.toDate(),
      dateOfDeath: data.dateOfDeath?.toDate() || undefined,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Animal
  }
  
  return null
}

export const updateAnimal = async (animalId: string, animalData: Partial<AnimalFormData>, oldProfilePicture?: string): Promise<void> => {
  const docRef = doc(db, 'animals', animalId)
  const updateData: any = {
    ...animalData,
    updatedAt: Timestamp.now(),
  }
  
  if (animalData.dateOfBirth) {
    updateData.dateOfBirth = Timestamp.fromDate(new Date(animalData.dateOfBirth))
  }
  
  if (animalData.dateOfDeath) {
    updateData.dateOfDeath = Timestamp.fromDate(new Date(animalData.dateOfDeath))
  }
  
  await updateDoc(docRef, updateData)
  
  // Delete old profile picture if it exists and is different from the new one
  if (oldProfilePicture && oldProfilePicture !== animalData.profilePicture) {
    try {
      const oldImageRef = ref(storage, oldProfilePicture)
      await deleteObject(oldImageRef)
    } catch (error) {
      console.error('Error deleting old profile picture:', error)
    }
  }
}

export const deleteAnimal = async (animalId: string): Promise<void> => {
  await deleteDoc(doc(db, 'animals', animalId))
}

// Weight records
export const addWeightRecord = async (weightRecord: Omit<WeightRecord, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'weightRecords'), {
    ...weightRecord,
    date: Timestamp.fromDate(weightRecord.date),
  })
  return docRef.id
}

export const getWeightRecords = async (animalId: string): Promise<WeightRecord[]> => {
  const q = query(
    collection(db, 'weightRecords'),
    where('animalId', '==', animalId),
    orderBy('date', 'desc')
  )
  const querySnapshot = await getDocs(q)
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date.toDate(),
  })) as WeightRecord[]
}

// Height records
export const addHeightRecord = async (heightRecord: Omit<HeightRecord, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'heightRecords'), {
    ...heightRecord,
    date: Timestamp.fromDate(heightRecord.date),
  })
  return docRef.id
}

export const getHeightRecords = async (animalId: string): Promise<HeightRecord[]> => {
  const q = query(
    collection(db, 'heightRecords'),
    where('animalId', '==', animalId),
    orderBy('date', 'desc')
  )
  const querySnapshot = await getDocs(q)
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date.toDate(),
  })) as HeightRecord[]
}

// Medical records
export const addMedicalRecord = async (medicalRecord: Omit<MedicalRecord, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'medicalRecords'), {
    ...medicalRecord,
    date: Timestamp.fromDate(medicalRecord.date),
    nextDueDate: medicalRecord.nextDueDate ? Timestamp.fromDate(medicalRecord.nextDueDate) : null,
  })
  return docRef.id
}

export const getMedicalRecords = async (animalId: string): Promise<MedicalRecord[]> => {
  const q = query(
    collection(db, 'medicalRecords'),
    where('animalId', '==', animalId),
    orderBy('date', 'desc')
  )
  const querySnapshot = await getDocs(q)
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date.toDate(),
    nextDueDate: doc.data().nextDueDate?.toDate() || undefined,
  })) as MedicalRecord[]
}