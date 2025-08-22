# 🔐 GitHub Secrets Configuration

This document explains how to set up GitHub Secrets for automated deployment of BeatSync.

## Required Secrets

### Vercel Deployment (Frontend)
```
VERCEL_TOKEN=your_vercel_token
ORG_ID=your_vercel_org_id  
PROJECT_ID=your_vercel_project_id
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_WS_URL=wss://your-backend-domain.com
```

### Railway Deployment (Backend)
```
RAILWAY_TOKEN=your_railway_token
```

### Spotify Integration (Optional but Recommended)
```
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

### Cloudflare R2 Storage (Optional but Recommended)
```
S3_BUCKET_NAME=beatsync-audio
S3_PUBLIC_URL=https://your-bucket.your-account-id.r2.cloudflarestorage.com
S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=your_cloudflare_access_key_id
S3_SECRET_ACCESS_KEY=your_cloudflare_secret_access_key
```

### Analytics (Optional)
```
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## How to Add Secrets

1. Go to your GitHub repository
2. Click **Settings** tab
3. In the sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret with the exact name from above

## Getting API Credentials

### 🎵 Spotify Developer Credentials
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click **Create app**
3. Fill in app details:
   - **App name**: BeatSync
   - **App description**: Synchronized music playback app
   - **Redirect URI**: `https://your-backend-domain.com/callback`
4. Save and copy **Client ID** and **Client Secret**

### ☁️ Cloudflare R2 Credentials
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2 Object Storage**
3. Click **Create bucket** → name it `beatsync-audio`
4. Go to **Manage R2 API tokens**
5. Click **Create API token**
6. Configure permissions:
   - **Permissions**: Object Read & Write
   - **Zone Resources**: Include - All zones
   - **Account Resources**: Include - All accounts
7. Copy the credentials

### 🚀 Vercel Deployment
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Import your GitHub repository
3. Go to **Settings** → **General**
4. Copy **Project ID**
5. Go to **Account Settings** → **Tokens**
6. Create new token and copy it
7. For ORG_ID, check the URL: `vercel.com/[org-id]/project-name`

### 🚂 Railway Deployment
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Create new project from GitHub repo
3. Go to **Settings** → **Tokens**
4. Create new token and copy it

## Deployment Workflow

Once secrets are configured, the GitHub Actions workflow will:

1. **On every push/PR**: Run tests and build verification
2. **On main branch push**: 
   - Deploy frontend to Vercel
   - Deploy backend to Railway
   - Use configured environment variables

## Testing Deployment

### Local Testing First
```bash
# Make sure everything works locally
bun install
bun run build
bun test
bun dev
```

### Trigger Deployment
1. Push changes to main branch
2. Check **Actions** tab in GitHub
3. Monitor deployment progress
4. Verify live applications work

## Environment Variables in Production

The deployment will automatically set these environment variables:

### Frontend (Vercel)
- `NEXT_PUBLIC_API_URL` → Points to your Railway backend
- `NEXT_PUBLIC_WS_URL` → WebSocket URL for your Railway backend
- `NEXT_PUBLIC_POSTHOG_KEY` → Analytics key (optional)

### Backend (Railway)
- `SPOTIFY_CLIENT_ID` → Enables real music search
- `SPOTIFY_CLIENT_SECRET` → Enables real music search
- `S3_*` variables → Enables file upload functionality

## Troubleshooting

### Deployment Fails
1. Check **Actions** tab for error logs
2. Verify all required secrets are set
3. Ensure API credentials are valid
4. Check service status (Vercel/Railway)

### Features Not Working
- **No music search**: Check Spotify credentials
- **File upload fails**: Check R2 credentials
- **Analytics not tracking**: Check PostHog credentials

### Secret Management
- Secrets are encrypted and only visible during workflow runs
- Never commit actual secrets to git
- Use different secrets for staging/production environments

## Quick Setup Checklist

- [ ] GitHub repository secrets configured
- [ ] Spotify app created and credentials added
- [ ] Cloudflare R2 bucket created and credentials added
- [ ] Vercel project connected
- [ ] Railway project connected
- [ ] Test deployment triggered
- [ ] Production URLs updated in environment
- [ ] All features tested in production

## Security Notes

- All secrets are encrypted in GitHub
- Secrets are only available during workflow execution
- Never expose secrets in logs or client-side code
- Rotate API keys regularly
- Use minimum required permissions for each service
