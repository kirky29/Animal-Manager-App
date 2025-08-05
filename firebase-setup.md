# Firebase Setup Guide

Follow these steps to set up Firebase for your Animal Manager app:

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter your project name (e.g., "animal-manager")
4. Follow the setup wizard

## 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Save the changes

## 3. Set up Firestore Database

1. Go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for now (you can set up security rules later)
4. Select a location for your database

## 4. Enable Storage

1. Go to "Storage" in the left sidebar
2. Click "Get started"
3. Keep the default security rules for now
4. Select the same location as your Firestore database

## 5. Get your Firebase Configuration

1. Go to "Project settings" (gear icon in the left sidebar)
2. Scroll down to "Your apps"
3. Click "Add app" and select the web icon (</>)
4. Register your app with a nickname
5. Copy the Firebase configuration object

## 6. Configure Environment Variables

1. Copy the `env.example` file to `.env` in your project root
2. Fill in the values from your Firebase configuration:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 7. Firestore Security Rules (Optional but Recommended)

Replace the default rules with these for better security:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own animals
    match /animals/{animalId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.ownerId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.ownerId;
    }
    
    // Users can only access records for their own animals
    match /weightRecords/{recordId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/animals/$(resource.data.animalId)) &&
        get(/databases/$(database)/documents/animals/$(resource.data.animalId)).data.ownerId == request.auth.uid;
    }
    
    match /heightRecords/{recordId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/animals/$(resource.data.animalId)) &&
        get(/databases/$(database)/documents/animals/$(resource.data.animalId)).data.ownerId == request.auth.uid;
    }
    
    match /medicalRecords/{recordId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/animals/$(resource.data.animalId)) &&
        get(/databases/$(database)/documents/animals/$(resource.data.animalId)).data.ownerId == request.auth.uid;
    }
  }
}
```

## 8. Storage Rules (Optional but Recommended)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /animal-photos/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

That's it! Your Firebase is now configured and ready to use with the Animal Manager app.