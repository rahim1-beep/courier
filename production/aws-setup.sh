#!/bin/bash

# SwiftShip AWS "One-Click" Setup & Deployment Script
# Target OS: Ubuntu 22.04 LTS

set -e

echo "🌟 Starting SwiftShip One-Click Setup..."

# 1. Update and Install System Dependencies
echo "📦 Updating system and installing dependencies..."
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git
sudo npm install -g pm2

# 2. Clone Repository
echo "📂 Cloning repository..."
if [ -d "courier" ]; then
    echo "Directory 'courier' already exists. Updating..."
    cd courier
    git pull origin main
else
    git clone https://github.com/rahim1-beep/courier.git
    cd courier
fi

# 3. Create Production .env File
echo "🔐 Creating production environment file..."
cat > .env << EOF
DATABASE_URL="postgresql://neondb_owner:npg_FyYKV1vpnf3t@ep-nameless-sound-an7gjp4k.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require"
JWT_ACCESS_SECRET="$(openssl rand -base64 32)"
JWT_REFRESH_SECRET="$(openssl rand -base64 32)"
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
PORT=3000
TRUST_PROXY=true
NODE_ENV=production
EOF

echo "✅ .env created with secure, random JWT secrets."

# 4. Install App Dependencies
echo "🛠️ Installing application dependencies..."
npm install

# 5. Database Migration & Client Generation
echo "🗄️ Synchronizing database schema..."
# Use db push for initial setup when migrations are missing or DB is already populated
npx prisma db push --accept-data-loss
npx prisma generate

# 6. Build Application
echo "🏗️ Building NestJS application..."
npm run build

# 7. Start/Restart with PM2
echo "🚀 Launching application with PM2..."
pm2 delete swiftship-api || true
pm2 start dist/main.js --name "swiftship-api"
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

echo ""
echo "===================================================="
echo "🎉 SUCCESS! SwiftShip Backend is now live!"
echo "📍 API Port: 3000"
echo "🕒 Check logs anytime with: pm2 logs swiftship-api"
echo "===================================================="
