#!/bin/bash

# BeatSync Environment Setup Helper
# This script helps you set up your environment variables for testing

echo "🎵 BeatSync Environment Setup Helper"
echo "======================================"
echo ""

# Check if environment files exist
if [ ! -f "apps/server/.env" ]; then
    echo "❌ Server .env file not found!"
    echo "📝 Copying template..."
    cp apps/server/.env.example apps/server/.env
    echo "✅ Created apps/server/.env"
fi

if [ ! -f "apps/client/.env" ]; then
    echo "❌ Client .env file not found!"
    echo "📝 Creating client .env..."
    cat > apps/client/.env << EOF
# BeatSync Client Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NODE_ENV=development
EOF
    echo "✅ Created apps/client/.env"
fi

echo ""
echo "🔧 Environment Status Check:"
echo "=============================="

# Check Spotify configuration
if grep -q "your_spotify_client_id_here" apps/server/.env; then
    echo "⚠️  Spotify: Not configured (using mock data)"
    echo "   📋 To fix: Get credentials from https://developer.spotify.com/dashboard"
else
    echo "✅ Spotify: Configured"
fi

# Check R2 configuration
if grep -q "your_cloudflare_access_key_id" apps/server/.env; then
    echo "⚠️  R2 Storage: Not configured (file uploads disabled)"
    echo "   📋 To fix: Get credentials from https://dash.cloudflare.com/"
else
    echo "✅ R2 Storage: Configured"
fi

# Check client URLs
if grep -q "localhost:8080" apps/client/.env; then
    echo "✅ Client: Configured for local development"
else
    echo "⚠️  Client: Custom configuration detected"
fi

echo ""
echo "🚀 Ready to test!"
echo "=================="
echo "Run these commands:"
echo "  bun install     # Install dependencies"
echo "  bun dev         # Start development servers"
echo ""
echo "📝 Edit environment files to add your API keys:"
echo "  apps/server/.env  - Server configuration"
echo "  apps/client/.env  - Client configuration"
echo ""
