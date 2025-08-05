#!/bin/bash

echo "🚀 Animal Manager Environment Setup"
echo "=================================="
echo ""
echo "This script will help you set up your Firebase environment variables."
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Do you want to overwrite it? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "Overwriting .env.local..."
    else
        echo "Setup cancelled."
        exit 0
    fi
fi

echo "📋 Please provide your Firebase configuration values:"
echo ""

# Get Firebase config values
echo "Enter your Firebase API Key:"
read -r api_key

echo "Enter your Firebase Auth Domain (e.g., your-project.firebaseapp.com):"
read -r auth_domain

echo "Enter your Firebase Project ID:"
read -r project_id

echo "Enter your Firebase Storage Bucket (e.g., your-project.appspot.com):"
read -r storage_bucket

echo "Enter your Firebase Messaging Sender ID:"
read -r messaging_sender_id

echo "Enter your Firebase App ID:"
read -r app_id

# Create .env.local file
cat > .env.local << EOF
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=$api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=$project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=$app_id
EOF

echo ""
echo "✅ Environment variables have been saved to .env.local"
echo ""
echo "🔄 Please restart your development server:"
echo "   npm run dev"
echo ""
echo "🌐 Then open your browser to: http://localhost:3001"
echo ""
echo "📚 If you need help setting up Firebase, see firebase-setup.md" 