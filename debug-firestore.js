// Quick script to test Firestore connection and query health updates
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyD2b0PxYyGRCWufVfybCHpmv9yU9MoGmPY",
  authDomain: "animal-manager-c928b.firebaseapp.com",
  projectId: "animal-manager-c928b",
  storageBucket: "animal-manager-c928b.firebasestorage.app",
  messagingSenderId: "877772906041",
  appId: "1:877772906041:web:d3a5ab4d078040919437e8"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function testHealthUpdates() {
  try {
    console.log('Testing Firestore connection...')
    
    // Query all health updates
    const healthUpdatesRef = collection(db, 'healthUpdates')
    const snapshot = await getDocs(healthUpdatesRef)
    
    console.log(`Found ${snapshot.size} health updates`)
    snapshot.forEach(doc => {
      console.log('Health update:', doc.id, doc.data())
    })
    
    // Also check animals collection
    const animalsRef = collection(db, 'animals')
    const animalsSnapshot = await getDocs(animalsRef)
    console.log(`Found ${animalsSnapshot.size} animals`)
    
  } catch (error) {
    console.error('Error testing Firestore:', error)
  }
}

testHealthUpdates()