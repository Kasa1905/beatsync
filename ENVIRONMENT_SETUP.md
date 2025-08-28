# 🔐 Environment Setup Guide

This guide explains how to set up environment variables for local development and GitHub Actions deployment.

## 📁 Local Development

### Files Created:
- `apps/client/.env.local` - Client environment variables (local only)
- `apps/server/.env.local` - Server environment variables (local only)

### ⚠️ Security:
These `.env.local` files contain **REAL API KEYS** and are:
- ✅ Added to `.gitignore` (never committed to git)
- ✅ Only exist on your local machine
- ✅ Override the default `.env` files

### 🎯 Current Setup:
Your local environment now includes:
- **Spotify API**: Full access to Spotify music catalog
- **PostHog Analytics**: Real analytics tracking
- **Cloudflare R2 Storage**: File upload and storage
- **Last.fm API**: Additional music metadata

## 🚀 GitHub Actions Setup

### 1. Go to your GitHub repository
```
https://github.com/Kasa1905/beatsync
```

### 2. Navigate to Settings > Environments
- Click **Settings** tab
- Click **Environments** in left sidebar
- Click **New environment**
- Name it `production`

### 3. Add these secrets to the `production` environment:

#### Client Variables:
```
NEXT_PUBLIC_API_URL=https://your-server-domain.com
NEXT_PUBLIC_WS_URL=wss://your-server-domain.com
NEXT_PUBLIC_POSTHOG_KEY=phc_your_real_posthog_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com
```

#### Server Variables:
```
PORT=8080
SPOTIFY_CLIENT_ID=your_real_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_real_spotify_client_secret
PROVIDER_URL=https://itunes.apple.com/search
```

#### Storage Variables:
```
S3_BUCKET_NAME=your-bucket-name
S3_PUBLIC_URL=https://your-bucket.account-id.r2.cloudflarestorage.com
S3_ENDPOINT=https://account-id.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=your_cloudflare_access_key
S3_SECRET_ACCESS_KEY=your_cloudflare_secret_key
```

#### Additional APIs:
```
LASTFM_API_KEY=your_lastfm_api_key
LASTFM_SHARED_SECRET=your_lastfm_secret
```

## 🔑 Getting Real API Keys

### Spotify API:
1. Go to https://developer.spotify.com/dashboard
2. Create a new app
3. Copy Client ID and Client Secret

### PostHog Analytics:
1. Go to https://posthog.com
2. Create account
3. Copy your project API key

### Cloudflare R2:
1. Go to https://dash.cloudflare.com
2. Navigate to R2 Object Storage
3. Create bucket and API token

### Last.fm API:
1. Go to https://www.last.fm/api/account/create
2. Create API account
3. Copy API key and shared secret

## 🎵 Current Status:

✅ **Local Development Ready**:
- Servers running with all API integrations
- Sample credentials configured
- Ready for testing and development

📦 **GitHub Actions Configured**:
- Workflow ready for deployment
- Environment secrets template created
- CI/CD pipeline prepared

## 🚨 Important Notes:

1. **Never commit `.env.local` files** - they contain real secrets
2. **Use sample credentials for development** - replace with real ones for production
3. **GitHub Secrets are encrypted** - safe to store real credentials there
4. **Test locally first** - ensure everything works before deploying

## 🛠️ Next Steps:

1. Test local development environment
2. Replace sample credentials with real ones in `.env.local`
3. Set up GitHub Environment secrets for deployment
4. Deploy to production platforms (Vercel, Railway, etc.)
