import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Validate Firebase configuration
const validateConfig = () => {
  const requiredFields = [
    'apiKey',
    'authDomain', 
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ]
  
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig])
  
  if (missingFields.length > 0) {
    console.error('Firebase configuration missing required fields:', missingFields)
    throw new Error(`Firebase configuration missing: ${missingFields.join(', ')}`)
  }
  
  console.log('Firebase configuration validated successfully')
}

// Initialize Firebase with error handling
let app
try {
  validateConfig()
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  console.log('Firebase app initialized successfully')
} catch (error) {
  console.error('Failed to initialize Firebase:', error)
  throw error
}

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app