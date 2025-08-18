# Environment Variables for Production Deployment

## Frontend (.env.local for Vercel)
NEXT_PUBLIC_SERVER_URL=https://your-server.up.railway.app
NEXT_PUBLIC_WS_URL=wss://your-server.up.railway.app/ws
NEXT_PUBLIC_ENVIRONMENT=production

# PostHog Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

## Backend (Railway Environment Variables)
NODE_ENV=production
PORT=8080

# Database (if using Railway PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database

# Storage (Optional - for R2/S3)
S3_REGION=auto
S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com
S3_BUCKET=beatsync-storage
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key

# CORS Settings
ALLOWED_ORIGINS=https://your-app.vercel.app,https://beatsync.com

## Instructions:

### For Vercel (Frontend):
1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add each NEXT_PUBLIC_ variable above
4. Replace "your-server.up.railway.app" with your actual Railway domain

### For Railway (Backend):
1. Go to your Railway project dashboard
2. Click "Variables" tab
3. Add each backend variable above
4. Replace placeholder values with actual values

### Getting the URLs:
- **Railway Backend URL**: Available after deployment in Railway dashboard
- **Vercel Frontend URL**: Available after deployment in Vercel dashboard

### Optional Services:
- **PostHog**: Free analytics, sign up at posthog.com
- **Cloudflare R2**: Free tier storage, sign up at cloudflare.com
- **Railway PostgreSQL**: Add from Railway marketplace (free tier available)
