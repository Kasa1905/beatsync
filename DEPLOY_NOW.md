# 🚀 Deploy BeatSync Now!

Your code is ready for deployment! Follow these steps:

## 1. Deploy Frontend to Vercel

### Option A: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/beatsync)

### Option B: Manual Deploy
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub: Select your `beatsync` repository
4. Framework: Next.js (auto-detected)
5. Root Directory: `apps/client`
6. Click "Deploy"

### Environment Variables for Vercel:
```
NEXT_PUBLIC_SERVER_URL=https://your-app.up.railway.app
NEXT_PUBLIC_WS_URL=wss://your-app.up.railway.app/ws
NEXT_PUBLIC_ENVIRONMENT=production
```

## 2. Deploy Backend to Railway

### Step-by-Step:
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `beatsync` repository
4. Railway will auto-detect and deploy

### Environment Variables for Railway:
```
NODE_ENV=production
PORT=8080
```

## 3. Update Configuration

After both deployments:

1. **Get your Railway URL** (e.g., `https://beatsync-production.up.railway.app`)
2. **Update Vercel environment variables** with the Railway URL
3. **Redeploy Vercel** to pick up new environment variables

## 4. Test Your Deployment

1. Visit your Vercel URL (e.g., `https://beatsync.vercel.app`)
2. Create a room and test audio functionality
3. Check browser console for any errors

## 🎉 You're Live!

Your BeatSync app is now deployed and accessible worldwide!

### Monitoring & Maintenance:
- **Vercel Dashboard**: Monitor frontend performance
- **Railway Dashboard**: Monitor backend uptime
- **GitHub Actions**: Set up CI/CD for automatic deployments

### Custom Domain (Optional):
- Add your custom domain in Vercel settings
- Configure DNS to point to Vercel

## Troubleshooting

### Common Issues:
1. **WebSocket connection fails**: Check Railway URL in Vercel env vars
2. **CORS errors**: Verify allowed origins in server configuration
3. **Build fails**: Check the build logs in respective dashboards

### Need Help?
- Check deployment logs in Vercel/Railway dashboards
- Review environment variables
- Test locally first with production URLs
