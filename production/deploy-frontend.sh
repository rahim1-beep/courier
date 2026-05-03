#!/bin/bash

# SwiftShip Frontend Deployment Script (Vercel)
# Usage: ./deploy-frontend.sh

set -e

echo "🚀 Starting SwiftShip Frontend Deployment to Vercel..."

# Navigate to frontend directory
cd "$(dirname "$0")/../frontend"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI could not be found. Please install it with 'npm i -g vercel'"
    exit 1
fi

# Build verification
echo "📦 Running production build verification..."
npm run build

# Deploy to Vercel
echo "cloud_upload Deploying to Vercel Production..."
vercel --prod --confirm

echo "✅ Frontend deployment successful!"
echo "✨ Your dashboard is live at your Vercel project URL."
