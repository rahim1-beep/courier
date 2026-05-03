#!/bin/bash

# SwiftShip Backend Deployment Script (AWS EC2)
# Usage: ./deploy-backend.sh [environment]

set -e

# --- CONFIGURATION ---
INSTANCE_IP="YOUR_AWS_INSTANCE_IP"
SSH_KEY="~/keys/your-aws-key.pem"
USER="ubuntu"
APP_DIR="/var/www/swiftship-backend"
GIT_REPO="your-git-repo-url"

echo "🚀 Starting SwiftShip Backend Deployment to AWS..."

# 1. Ensure local environment is clean (optional but recommended)
# npm run lint
# npm run test

# 2. SSH into instance and execute deployment commands
ssh -i "$SSH_KEY" "$USER@$INSTANCE_IP" << EOF
  echo "Connected to instance. Updating code..."
  
  # Navigate to app directory
  if [ ! -d "$APP_DIR" ]; then
    sudo mkdir -p "$APP_DIR"
    sudo chown $USER:$USER "$APP_DIR"
    git clone $GIT_REPO "$APP_DIR"
  fi
  
  cd "$APP_DIR"
  
  # Pull latest changes
  git fetch --all
  git reset --hard origin/main
  
  # Install dependencies
  echo "Installing dependencies..."
  npm install --production
  
  # Synchronize Database
  echo "Synchronizing database schema..."
  npx prisma db push --accept-data-loss
  npx prisma generate
  
  # Build the application
  echo "Building NestJS application..."
  npm run build
  
  # Restart PM2 process
  echo "Restarting application with PM2..."
  pm2 restart swiftship-api || pm2 start dist/src/main.js --name "swiftship-api"
  
  echo "✅ Backend deployment successful!"
EOF

echo "✨ Deployment Finished!"
