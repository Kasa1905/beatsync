# 🚀 Quick Setup: Real API Keys for Testing

## Current Status ✅
Your BeatSync is now running with:
- ✅ **iTunes Music API**: FREE music search (no registration)
- ✅ **Local Development**: Both servers running
- ⚠️ **File Upload**: Disabled (no cloud storage)

## 🔧 Add Real Cloudflare R2 (5-minute setup)

### Why Cloudflare R2?
- **FREE tier**: 10GB storage + 1 million requests/month
- **No credit card required** for free tier
- **Simple setup**: Just 4 steps
- **Much easier** than AWS S3

### Setup Steps:

#### 1. Create Account (FREE)
```bash
# Go to: https://cloudflare.com/
# Click "Sign Up" - enter email/password
# Verify email - you're in!
```

#### 2. Create R2 Bucket
```bash
# In Cloudflare dashboard:
# Click "R2 Object Storage" in sidebar
# Click "Create bucket"
# Name: "beatsync-audio"
# Click "Create bucket"
```

#### 3. Create API Token
```bash
# Still in R2 section:
# Click "Manage R2 API tokens"
# Click "Create API token"
# Permissions: "Object Read & Write"
# Click "Continue to summary"
# Click "Create API token"
# COPY the credentials shown!
```

#### 4. Add to BeatSync
```bash
# Edit: apps/server/.env
# Uncomment and fill these lines:

S3_BUCKET_NAME=beatsync-audio
S3_PUBLIC_URL=https://beatsync-audio.YOUR-ACCOUNT-ID.r2.cloudflarestorage.com
S3_ENDPOINT=https://YOUR-ACCOUNT-ID.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=your_actual_access_key_from_step_3
S3_SECRET_ACCESS_KEY=your_actual_secret_key_from_step_3

# Replace YOUR-ACCOUNT-ID with your actual account ID from the URL
```

#### 5. Restart & Test
```bash
# Stop current server (Ctrl+C)
bun dev
# Test file upload in http://localhost:3000
```

## 🎵 Music API Alternatives

### Option 1: iTunes (Current - FREE)
- ✅ Already working
- ✅ No registration required
- ✅ Good music metadata
- ⚠️ Only 30-second previews

### Option 2: Last.fm API (FREE)
```bash
# 1. Go to: https://www.last.fm/api/account/create
# 2. Fill form, get API key
# 3. Add to .env:
LASTFM_API_KEY=your_api_key_here
```

### Option 3: Deezer API (FREE)
```bash
# 1. Go to: https://developers.deezer.com/api
# 2. Register app, get credentials
# 3. No setup needed - public endpoints available
```

## 📊 What Works Now vs With API Keys

### Without Any Setup (Current):
- ✅ Room creation/joining
- ✅ WebSocket sync
- ✅ Music search (iTunes)
- ✅ Audio playback (URLs)
- ❌ File uploads
- ❌ Persistent storage

### With Cloudflare R2 Added:
- ✅ Everything above PLUS:
- ✅ File upload functionality
- ✅ Persistent audio storage
- ✅ File sharing between users
- ✅ Production-ready storage

## 🧪 Test Commands

```bash
# Check what's configured
./setup-env.sh

# Test current setup
bun test

# Start development
bun dev

# Open app
open http://localhost:3000
```

## 💰 Cost Breakdown

### Current Setup: $0/month
- iTunes API: FREE
- Local development: FREE
- No storage: FREE

### With Cloudflare R2: Still $0/month
- Cloudflare R2 free tier: 10GB + 1M requests
- Perfect for personal testing
- Only pay if you exceed limits

### Production Ready: ~$1-5/month
- Cloudflare R2: $0.015/GB beyond free tier
- Analytics (PostHog): FREE tier available
- Domain: ~$10/year

## 🎯 Recommended Testing Path

1. **Start Here**: Test current setup with iTunes API
2. **Add Storage**: 5-minute Cloudflare R2 setup for file uploads
3. **Go Live**: Deploy to Vercel + Railway (both have free tiers)
4. **Scale Up**: Add analytics when you have users

Your app is already functional for testing! 🚀
