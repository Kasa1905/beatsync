#!/bin/bash

# 🔑 Add Your Real API Keys Here
# Copy this file to add-real-keys.sh and fill in your actual credentials

echo "🔧 Adding real API keys to BeatSync..."

# Check if user wants to proceed
read -p "Do you have Cloudflare R2 credentials ready? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "📋 Get your credentials first:"
    echo "   1. Cloudflare: https://dash.cloudflare.com/ → R2 Object Storage"
    echo "   2. See REAL_API_SETUP.md for step-by-step guide"
    exit 1
fi

# Get user inputs
echo ""
echo "📝 Enter your Cloudflare R2 credentials:"
read -p "Account ID (from R2 dashboard URL): " ACCOUNT_ID
read -p "Access Key ID: " ACCESS_KEY
read -p "Secret Access Key: " SECRET_KEY
read -p "Bucket Name (default: beatsync-audio): " BUCKET_NAME

# Set defaults
BUCKET_NAME=${BUCKET_NAME:-beatsync-audio}

# Update .env file
cat > apps/server/.env << EOF
# BeatSync Server Configuration

# Server Port
PORT=8080

# iTunes Music API (FREE - no registration required)
PROVIDER_URL=https://itunes.apple.com/search

# Cloudflare R2 Storage (REAL CREDENTIALS)
S3_BUCKET_NAME=$BUCKET_NAME
S3_PUBLIC_URL=https://$BUCKET_NAME.$ACCOUNT_ID.r2.cloudflarestorage.com
S3_ENDPOINT=https://$ACCOUNT_ID.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=$ACCESS_KEY
S3_SECRET_ACCESS_KEY=$SECRET_KEY

# Optional: Spotify (requires developer account)
# SPOTIFY_CLIENT_ID=your_spotify_client_id
# SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
EOF

echo ""
echo "✅ Real credentials added!"
echo ""
echo "🧪 Test your setup:"
echo "   bun dev"
echo "   # Try uploading a file at http://localhost:3000"
echo ""
echo "🔒 Security note:"
echo "   - .env files are in .gitignore (won't be committed)"
echo "   - Keep your credentials private"
echo "   - Rotate keys if compromised"
