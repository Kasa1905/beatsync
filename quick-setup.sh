#!/bin/bash

# BeatSync Quick Setup with Free APIs
echo "🎵 Setting up BeatSync with FREE music APIs..."

# Update server .env with iTunes API (no registration needed)
cat > apps/server/.env << EOF
# BeatSync Server Configuration

# Server Port
PORT=8080

# iTunes API (FREE - No registration required)
PROVIDER_URL=https://itunes.apple.com/search

# Spotify (Optional - leave empty to use iTunes instead)
# SPOTIFY_CLIENT_ID=your_spotify_client_id_here
# SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

# File Storage (Optional - leave empty for local testing)
# S3_BUCKET_NAME=beatsync-audio
# S3_PUBLIC_URL=https://your-bucket.r2.cloudflarestorage.com
# S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com
# S3_ACCESS_KEY_ID=your_access_key
# S3_SECRET_ACCESS_KEY=your_secret_key
EOF

# Update client .env 
cat > apps/client/.env << EOF
# BeatSync Client Configuration

# Server URLs
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080

# Analytics (Optional)
# NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key_here
# NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
EOF

echo "✅ Basic setup complete!"
echo ""
echo "🎯 What's configured:"
echo "  ✅ iTunes API for music search (FREE)"
echo "  ✅ Local development URLs"
echo "  ⚠️  No file uploads (storage not configured)"
echo "  ⚠️  No analytics (PostHog not configured)"
echo ""
echo "🚀 Ready to test:"
echo "  bun dev    # Start development servers"
echo ""
echo "🔧 To add more features:"
echo "  - Edit apps/server/.env for Cloudflare R2 storage"
echo "  - Edit apps/client/.env for analytics"
echo "  - See MUSIC_ALTERNATIVES.md for other music APIs"
