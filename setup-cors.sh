#!/bin/bash

# Script to set up CORS configuration for Firebase Storage
# Run this script after you have access to your Firebase project

echo "Setting up CORS configuration for Firebase Storage..."

# Set your project ID
PROJECT_ID="animal-manager-c928b"
BUCKET_NAME="${PROJECT_ID}.appspot.com"

# Set CORS configuration using gsutil
echo "Setting CORS configuration for bucket: $BUCKET_NAME"
gsutil cors set cors.json gs://$BUCKET_NAME

echo "CORS configuration applied successfully!"
echo "You should now be able to upload images from localhost:3000" 