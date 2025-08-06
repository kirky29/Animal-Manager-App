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
import { Animal, AnimalFormData, WeightRecord, HeightRecord, MedicalRecord, HealthUpdate, AuditLog, AnimalMedia, HealthUpdateMedia } from '@/types/animal'

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
  console.log('getAnimal called with ID:', animalId)
  const docRef = doc(db, 'animals', animalId)
  const docSnap = await getDoc(docRef)
  
  console.log('Document exists:', docSnap.exists())
  
  if (docSnap.exists()) {
    const data = docSnap.data()
    console.log('Animal data:', data)
    return {
      id: docSnap.id,
      ...data,
      dateOfBirth: data.dateOfBirth.toDate(),
      dateOfDeath: data.dateOfDeath?.toDate() || undefined,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Animal
  }
  
  console.log('Animal not found')
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

// Audit Log functions
export const createAuditLog = async (auditLog: any): Promise<string> => {
  // Clean the audit log data to remove undefined values
  const cleanedAuditLog = Object.fromEntries(
    Object.entries(auditLog).filter(([_, value]) => value !== undefined)
  )
  
  const docRef = await addDoc(collection(db, 'auditLogs'), {
    ...cleanedAuditLog,
    timestamp: Timestamp.fromDate(auditLog.timestamp),
  })
  return docRef.id
}

export const getAuditLogs = async (animalId: string): Promise<AuditLog[]> => {
  try {
    console.log('getAuditLogs called with animalId:', animalId)
    const q = query(
      collection(db, 'auditLogs'),
      where('animalId', '==', animalId)
    )
    const querySnapshot = await getDocs(q)
    console.log('Raw audit logs query result - docs found:', querySnapshot.size)
    
    const results = querySnapshot.docs.map(doc => {
      const data = doc.data()
      console.log('Raw audit log document data:', doc.id, data)
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
      }
    }) as AuditLog[]
    
    // Sort by timestamp (newest first) - client-side sort
    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    console.log('Processed audit logs:', results)
    return results
  } catch (error) {
    console.error('Error in getAuditLogs:', error)
    throw error
  }
}



// Health Update functions
export const addHealthUpdate = async (healthUpdate: any): Promise<string> => {
  // Clean the health update data to remove undefined values
  const cleanedHealthUpdate = Object.fromEntries(
    Object.entries(healthUpdate).filter(([_, value]) => value !== undefined)
  )
  
  // Handle media array - convert Date objects to Timestamps
  if (cleanedHealthUpdate.media && Array.isArray(cleanedHealthUpdate.media)) {
    cleanedHealthUpdate.media = cleanedHealthUpdate.media.map((media: any) => ({
      ...media,
      uploadedAt: Timestamp.fromDate(media.uploadedAt)
    }))
  }
  
  const docRef = await addDoc(collection(db, 'healthUpdates'), {
    ...cleanedHealthUpdate,
    date: Timestamp.fromDate(healthUpdate.date),
    createdAt: Timestamp.fromDate(healthUpdate.createdAt),
    nextDueDate: healthUpdate.nextDueDate ? Timestamp.fromDate(healthUpdate.nextDueDate) : null,
  })
  return docRef.id
}

export const getHealthUpdates = async (animalId: string): Promise<HealthUpdate[]> => {
  try {
    console.log('getHealthUpdates called with animalId:', animalId)
    
    // Simple query without ordering first to test if data exists
    const q = query(
      collection(db, 'healthUpdates'),
      where('animalId', '==', animalId)
    )
    const querySnapshot = await getDocs(q)
    
    console.log('Raw query result - docs found:', querySnapshot.size)
    
    const results = querySnapshot.docs.map(doc => {
      const data = doc.data()
      console.log('Raw document data:', doc.id, data)
      
      // Handle media array - convert Timestamps back to Date objects
      let processedMedia = undefined
      if (data.media && Array.isArray(data.media)) {
        processedMedia = data.media.map((media: any) => ({
          ...media,
          uploadedAt: media.uploadedAt?.toDate() || new Date()
        }))
      }
      
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || undefined,
        nextDueDate: data.nextDueDate?.toDate() || undefined,
        media: processedMedia,
      }
    }) as HealthUpdate[]
    
    // Sort by date in JavaScript instead of Firestore to avoid index issues
    results.sort((a, b) => b.date.getTime() - a.date.getTime())
    
    console.log('Processed health updates:', results)
    return results
    
  } catch (error) {
    console.error('Error in getHealthUpdates:', error)
    throw error
  }
}

export const updateHealthUpdate = async (updateId: string, updateData: any): Promise<void> => {
  // Clean the update data to remove undefined values
  const cleanedUpdateData = Object.fromEntries(
    Object.entries(updateData).filter(([_, value]) => value !== undefined)
  )
  
  // Handle media array - convert Date objects to Timestamps
  if (cleanedUpdateData.media && Array.isArray(cleanedUpdateData.media)) {
    cleanedUpdateData.media = cleanedUpdateData.media.map((media: any) => ({
      ...media,
      uploadedAt: Timestamp.fromDate(media.uploadedAt)
    }))
  }
  
  // Convert Date objects to Firestore Timestamps and add updatedAt
  const firestoreData = {
    ...cleanedUpdateData,
    date: updateData.date ? Timestamp.fromDate(updateData.date) : undefined,
    nextDueDate: updateData.nextDueDate ? Timestamp.fromDate(updateData.nextDueDate) : undefined,
    updatedAt: Timestamp.fromDate(new Date()), // Always set when updating
  }
  
  // Remove undefined values again after timestamp conversion
  const finalData = Object.fromEntries(
    Object.entries(firestoreData).filter(([_, value]) => value !== undefined)
  )
  
  await updateDoc(doc(db, 'healthUpdates', updateId), finalData)
}

export const deleteHealthUpdate = async (healthUpdateId: string): Promise<void> => {
  await deleteDoc(doc(db, 'healthUpdates', healthUpdateId))
}

// Enhanced animal update function with audit logging
export const updateAnimalWithAudit = async (
  animalId: string, 
  animalData: Partial<AnimalFormData>, 
  userId: string,
  userName?: string,
  userEmail?: string,
  oldProfilePicture?: string
): Promise<void> => {
  // Get current animal data to track changes
  const currentAnimal = await getAnimal(animalId)
  if (!currentAnimal) {
    throw new Error('Animal not found')
  }

  // Update the animal
  await updateAnimal(animalId, animalData, oldProfilePicture)

  // Track changes for audit log
  const changes: { field: string; oldValue: any; newValue: any }[] = []
  
  Object.entries(animalData).forEach(([field, newValue]) => {
    const oldValue = (currentAnimal as any)[field]
    
    // Skip if new value is undefined (field wasn't changed)
    if (newValue === undefined) return
    
    // Helper function to properly compare values
    const valuesAreDifferent = (oldVal: any, newVal: any): boolean => {
      // Handle null/undefined equivalency
      if ((oldVal == null && newVal == null)) return false
      if (oldVal == null || newVal == null) return true
      
      // Handle Date fields (convert string dates to Date objects for comparison)
      if ((field === 'dateOfBirth' || field === 'dateOfDeath') && oldVal instanceof Date) {
        // Convert new string value to Date for comparison
        const newValAsDate = typeof newVal === 'string' ? new Date(newVal) : newVal
        if (newValAsDate instanceof Date && !isNaN(newValAsDate.getTime())) {
          return oldVal.getTime() !== newValAsDate.getTime()
        }
      }
      
      // Handle Date objects
      if (oldVal instanceof Date && newVal instanceof Date) {
        return oldVal.getTime() !== newVal.getTime()
      }
      
      // Handle regular values
      return oldVal !== newVal
    }
    
    if (valuesAreDifferent(oldValue, newValue)) {
      console.log(`Change detected in field "${field}":`, {
        oldValue,
        newValue,
        oldType: typeof oldValue,
        newType: typeof newValue,
        oldIsDate: oldValue instanceof Date,
        newIsDate: typeof newValue === 'object' && newValue !== null && 'toDate' in newValue
      })
      changes.push({
        field,
        oldValue,
        newValue
      })
    }
  })

  // Create audit log entry
  if (changes.length > 0) {
    await createAuditLog({
      animalId,
      action: 'updated',
      entityType: 'animal',
      entityId: animalId,
      userId,
      userName,
      userEmail,
      timestamp: new Date(),
      changes,
      summary: `Updated ${changes.map(c => c.field).join(', ')}`,
      metadata: {
        changesCount: changes.length
      }
    })
  }
}

// Enhanced create animal function with audit logging
export const createAnimalWithAudit = async (
  ownerId: string, 
  animalData: AnimalFormData,
  userName?: string,
  userEmail?: string
): Promise<string> => {
  const animalId = await createAnimal(ownerId, animalData)
  
  // Create audit log entry
  await createAuditLog({
    animalId,
    action: 'created',
    entityType: 'animal',
    entityId: animalId,
    userId: ownerId,
    userName,
    userEmail,
    timestamp: new Date(),
    summary: `Created animal: ${animalData.name}`,
    metadata: {
      species: animalData.species,
      breed: animalData.breed
    }
  })
  
  return animalId
}

// Media Management Functions
export const deleteMediaFromHealthUpdate = async (healthUpdateId: string, mediaId: string): Promise<void> => {
  try {
    console.log('Deleting media from health update:', healthUpdateId, 'mediaId:', mediaId)
    
    // Get the current health update
    const healthUpdateRef = doc(db, 'healthUpdates', healthUpdateId)
    const healthUpdateSnap = await getDoc(healthUpdateRef)
    
    if (!healthUpdateSnap.exists()) {
      throw new Error('Health update not found')
    }
    
    const healthUpdateData = healthUpdateSnap.data()
    const media = healthUpdateData.media || []
    
    // Find and remove the media item
    const updatedMedia = media.filter((item: any) => item.id !== mediaId)
    
    // Update the health update with the new media array
    await updateDoc(healthUpdateRef, {
      media: updatedMedia,
      updatedAt: Timestamp.now()
    })
    
    console.log('Media deleted from health update successfully')
  } catch (error) {
    console.error('Error deleting media from health update:', error)
    throw error
  }
}

export const deleteStandaloneMedia = async (mediaId: string): Promise<void> => {
  try {
    console.log('Deleting standalone media:', mediaId)
    
    // Delete from animal_media collection
    await deleteDoc(doc(db, 'animal_media', mediaId))
    
    console.log('Standalone media deleted successfully')
  } catch (error) {
    console.error('Error deleting standalone media:', error)
    throw error
  }
}

export const deleteMedia = async (media: AnimalMedia | HealthUpdateMedia): Promise<void> => {
  try {
    console.log('Deleting media:', media.id, 'type:', 'healthUpdateId' in media ? 'health_update' : 'standalone')
    
    if ('healthUpdateId' in media && media.healthUpdateId) {
      // This is health update media
      await deleteMediaFromHealthUpdate(media.healthUpdateId, media.id)
    } else {
      // This is standalone animal media
      await deleteStandaloneMedia(media.id)
    }
    
    console.log('Media deleted successfully')
  } catch (error) {
    console.error('Error deleting media:', error)
    throw error
  }
}

export const getAnimalMedia = async (animalId: string): Promise<AnimalMedia[]> => {
  try {
    console.log('Getting animal media for animalId:', animalId)
    
    // Try with composite index first
    try {
      const q = query(
        collection(db, 'animal_media'),
        where('animalId', '==', animalId),
        orderBy('uploadedAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      const media = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          uploadedAt: data.uploadedAt.toDate(),
        }
      }) as AnimalMedia[]
      
      console.log('Found animal media:', media.length, 'items')
      return media
    } catch (indexError) {
      console.log('Composite index not ready, trying simple query:', indexError)
      
      // Fallback to simple query without ordering
      const q = query(
        collection(db, 'animal_media'),
        where('animalId', '==', animalId)
      )
      const querySnapshot = await getDocs(q)
      
      const media = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          uploadedAt: data.uploadedAt.toDate(),
        }
      }) as AnimalMedia[]
      
      // Sort in memory
      media.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
      
      console.log('Found animal media (simple query):', media.length, 'items')
      return media
    }
  } catch (error) {
    console.error('Error in getAnimalMedia:', error)
    // Return empty array instead of throwing error if collection doesn't exist
    if (error instanceof Error && (error.message.includes('collection') || error.message.includes('permission'))) {
      console.log('Animal media collection may not exist yet or permission denied, returning empty array')
      return []
    }
    throw error
  }
}

export const getHealthUpdateMedia = async (animalId: string): Promise<HealthUpdateMedia[]> => {
  try {
    console.log('Getting health update media for animalId:', animalId)
    
    // Get all health updates for this animal
    const healthUpdates = await getHealthUpdates(animalId)
    
    // Extract media from all health updates
    const allMedia: HealthUpdateMedia[] = []
    
    healthUpdates.forEach(healthUpdate => {
      if (healthUpdate.media && Array.isArray(healthUpdate.media)) {
        healthUpdate.media.forEach((mediaItem: any) => {
          // Add healthUpdateId to the media item for reference
          const mediaWithContext: HealthUpdateMedia = {
            ...mediaItem,
            healthUpdateId: healthUpdate.id,
            animalId: animalId, // Ensure animalId is set
          }
          allMedia.push(mediaWithContext)
        })
      }
    })
    
    // Sort by upload date (newest first)
    allMedia.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
    
    console.log('Found health update media:', allMedia.length, 'items')
    return allMedia
  } catch (error) {
    console.error('Error in getHealthUpdateMedia:', error)
    return []
  }
}

export const getAllAnimalMedia = async (animalId: string): Promise<(AnimalMedia | HealthUpdateMedia)[]> => {
  try {
    console.log('Getting all media for animalId:', animalId)
    
    // Get both types of media in parallel, with error handling for each
    let animalMedia: AnimalMedia[] = []
    let healthUpdateMedia: HealthUpdateMedia[] = []
    
    try {
      animalMedia = await getAnimalMedia(animalId)
    } catch (error) {
      console.error('Error getting animal media:', error)
      animalMedia = []
    }
    
    try {
      healthUpdateMedia = await getHealthUpdateMedia(animalId)
    } catch (error) {
      console.error('Error getting health update media:', error)
      healthUpdateMedia = []
    }
    
    // Combine and sort by upload date (newest first)
    const allMedia = [...animalMedia, ...healthUpdateMedia].sort((a, b) => 
      b.uploadedAt.getTime() - a.uploadedAt.getTime()
    )
    
    console.log('Total media found:', allMedia.length, 'items')
    console.log('Breakdown - Animal media:', animalMedia.length, 'Health update media:', healthUpdateMedia.length)
    return allMedia
  } catch (error) {
    console.error('Error in getAllAnimalMedia:', error)
    // Return empty array instead of throwing error
    console.log('Returning empty media array due to error')
    return []
  }
}