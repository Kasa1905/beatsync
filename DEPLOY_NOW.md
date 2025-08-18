# 🚀 Quick Deploy Guide - BeatSync

## Free Deployment in 10 Minutes!

### Prerequisites
- [x] GitHub account
- [x] Your code is committed to GitHub

---

## Step 1: Deploy Frontend (Vercel) - 3 minutes

### 1.1 Sign Up & Connect
1. Go to **[vercel.com](https://vercel.com)**
2. Click **"Sign up"** → **"Continue with GitHub"**
3. Authorize Vercel to access your repositories

### 1.2 Import Project
1. Click **"New Project"**
2. Find your **`beatsync`** repository
3. Click **"Import"**

### 1.3 Configure Deployment
1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `apps/client`
3. **Build Command**: `npm run build`
4. **Output Directory**: `.next`
5. Click **"Deploy"**

### 1.4 Add Environment Variables
1. Go to **Project Settings** → **Environment Variables**
2. Add these variables:
```
NEXT_PUBLIC_SERVER_URL = https://your-app.up.railway.app
NEXT_PUBLIC_WS_URL = wss://your-app.up.railway.app/ws
NEXT_PUBLIC_ENVIRONMENT = production
```
*(You'll update the URLs after Step 2)*

---

## Step 2: Deploy Backend (Railway) - 4 minutes

### 2.1 Sign Up & Connect
1. Go to **[railway.app](https://railway.app)**
2. Click **"Login"** → **"Login with GitHub"**
3. Authorize Railway

### 2.2 Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your **`beatsync`** repository
4. Railway will automatically detect and deploy

### 2.3 Configure Service
1. Click on your deployed service
2. Go to **"Settings"** → **"Environment"**
3. Add these variables:
```
NODE_ENV = production
PORT = 8080
```

### 2.4 Get Your Backend URL
1. Go to **"Settings"** → **"Networking"**
2. Copy your **Railway domain** (e.g., `https://beatsync-production.up.railway.app`)

---

## Step 3: Connect Frontend & Backend - 2 minutes

### 3.1 Update Vercel Environment Variables
1. Go back to **Vercel** → Your project → **Settings** → **Environment Variables**
2. **Edit** the variables you added earlier:
```
NEXT_PUBLIC_SERVER_URL = https://YOUR-RAILWAY-URL
NEXT_PUBLIC_WS_URL = wss://YOUR-RAILWAY-URL/ws
```
*(Replace `YOUR-RAILWAY-URL` with the actual Railway domain)*

### 3.2 Redeploy Frontend
1. Go to **Vercel** → Your project → **Deployments**
2. Click **"Redeploy"** on the latest deployment
3. Select **"Use existing Build Cache"** → **"Redeploy"**

---

## Step 4: Test Your App - 1 minute

### 4.1 Access Your App
1. Go to your **Vercel URL** (e.g., `https://beatsync.vercel.app`)
2. Create a new room
3. Test audio functionality

### 4.2 Verify Backend
1. Visit your **Railway URL** (should show "BeatSync Server")
2. Check `YOUR-RAILWAY-URL/health` (should show health status)

---

## 🎉 You're Live!

Your BeatSync app is now deployed and accessible worldwide!

### Your URLs:
- **🌐 Frontend**: `https://your-project.vercel.app`
- **🔧 Backend**: `https://your-project.up.railway.app`

---

## 💡 Pro Tips

### Custom Domain (Optional)
1. **Vercel**: Settings → Domains → Add your domain
2. **Point DNS** to Vercel's servers

### Monitoring
1. **Vercel Analytics**: Built-in performance monitoring
2. **Railway Metrics**: CPU, memory, and network usage

### Automatic Deployments
- **Vercel**: Auto-deploys on every push to `main`
- **Railway**: Auto-deploys on every push to `main`

---

## 🔧 Troubleshooting

### Common Issues:

**❌ "WebSocket connection failed"**
- ✅ Check Railway URL in Vercel environment variables
- ✅ Ensure Railway service is running

**❌ "CORS error"**
- ✅ Verify frontend URL is allowed in backend CORS settings
- ✅ Check environment variables are set correctly

**❌ "Build failed"**
- ✅ Check build logs in Vercel/Railway dashboards
- ✅ Verify all dependencies are in package.json

### Need Help?
1. Check deployment logs in respective dashboards
2. Verify environment variables
3. Test locally with production URLs first

---

## 💰 Cost Breakdown

### Free Tier Limits:
- **Vercel**: 100GB bandwidth, unlimited requests
- **Railway**: $5 monthly credit (covers small apps)
- **Total Monthly Cost**: $0-5 (depends on traffic)

### Scaling:
- **High traffic**: Upgrade Vercel Pro ($20/month)
- **Heavy backend**: Railway Pro ($10/month)

---

**Ready to deploy? Start with Step 1! 🚀**
