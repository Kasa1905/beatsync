# ✅ Simple Deployment Checklist

## Before You Start
- [ ] I have my project code ready
- [ ] I can use Terminal/Command Prompt
- [ ] I have an email address

---

## Step 1: GitHub (Code Storage)
- [ ] Go to github.com
- [ ] Sign up for free account
- [ ] Verify my email
- [ ] Create new repository called "beatsync"

---

## Step 2: Upload Code to GitHub
```bash
# Copy these commands one by one:
cd /Users/kaushiksambe/Documents/pro/sample/Projects/Beatsync
git init
git add .
git commit -m "My music app ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/beatsync.git
git push -u origin main
```
- [ ] Replace YOUR_USERNAME with my GitHub username
- [ ] Run each command in terminal
- [ ] See my code on GitHub

---

## Step 3: Deploy Website (Vercel)
- [ ] Go to vercel.com
- [ ] Sign up with GitHub
- [ ] Import my "beatsync" repository
- [ ] Set Root Directory to: `apps/client`
- [ ] Click Deploy
- [ ] Wait 3 minutes
- [ ] Get my website URL: `https://something.vercel.app`

---

## Step 4: Deploy Server (Render)
- [ ] Go to render.com  
- [ ] Sign up with GitHub
- [ ] New Web Service
- [ ] Connect "beatsync" repository
- [ ] Settings:
  - [ ] Root Directory: `apps/server`
  - [ ] Build Command: `bun install`
  - [ ] Start Command: `bun run start`
- [ ] Add Environment Variables:
  - [ ] `PORT = 3001`
  - [ ] `NODE_ENV = production`
- [ ] Click Create Web Service
- [ ] Wait 10 minutes
- [ ] Get my server URL: `https://something.onrender.com`

---

## Step 5: Connect Website to Server
- [ ] Go back to vercel.com
- [ ] Click my project
- [ ] Settings → Environment Variables
- [ ] Add:
  - [ ] `NEXT_PUBLIC_WS_URL = https://my-server-url.onrender.com`
  - [ ] `NEXT_PUBLIC_API_URL = https://my-server-url.onrender.com`
- [ ] Redeploy website
- [ ] Wait 3 minutes

---

## Step 6: Test Everything
- [ ] Open my website URL
- [ ] Website loads properly
- [ ] Can upload music files
- [ ] Can create/join rooms
- [ ] Share with friend to test together

---

## 🎉 Success!
- [ ] My app is live on the internet
- [ ] It's completely FREE
- [ ] I can share the URL with anyone
- [ ] When I update code and push to GitHub, it auto-updates

---

## If Something Goes Wrong
1. **Wait 10-15 minutes** (services take time to start)
2. **Check spelling** of URLs and usernames  
3. **Try refreshing** the webpage
4. **Ask for help** with specific error message

---

**Total Time**: 30-45 minutes
**Total Cost**: $0
**Result**: Professional web app anyone can use! 🚀
