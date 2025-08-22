# 🛠️ BeatSync Error Troubleshooting Guide

## ✅ Fixed Console Errors

### Error: `503 Server Response` ❌ → ✅ FIXED
**Was**: External service returning 503 errors
**Solution**: Disabled analytics with placeholder credentials
**Status**: ✅ No longer appears

### Error: `LaunchDarkly ERR_BLOCKED_BY_CLIENT` ❌ → ✅ FIXED  
**Was**: `events.launchdarkly.com: Failed to load resource: net::ERR_BLOCKED_BY_CLIENT`
**Cause**: Ad-blocker blocking analytics trackers
**Solution**: Improved PostHog provider to handle missing credentials gracefully
**Status**: ✅ No longer appears

### Error: PostHog Connection Attempts ❌ → ✅ FIXED
**Was**: PostHog trying to connect with placeholder credentials
**Solution**: Added proper credential validation in PostHogProvider
**Status**: ✅ Analytics properly disabled when no real keys provided

## 🔍 Console Messages You'll See (These are GOOD)

### ✅ Expected Server Messages:
```
Spotify API not configured. Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET
📊 Analytics disabled (no PostHog key configured)
R2/S3 storage not configured - returning empty list
📭 No backups found
✅ R2/S3 storage not configured. Skipping orphaned room cleanup.
```
**These are normal**: App gracefully falls back when services aren't configured

### ✅ Expected Client Messages:
```
📊 Analytics disabled (no PostHog key configured)
```
**This is good**: No unnecessary network requests to analytics services

## 🚨 Errors That Still Need Investigation

### If you see these, something is wrong:

#### `Failed to fetch` or Network Errors
- **Check**: Are both servers running? (`bun dev`)
- **Check**: Correct URLs in .env? (localhost:3000, localhost:8080)
- **Fix**: Restart servers, check firewall

#### `WebSocket connection failed`
- **Check**: Backend server running on port 8080?
- **Check**: No conflicting processes on port 8080?
- **Fix**: `lsof -ti:8080 | xargs kill -9` then restart

#### `Module not found` or Import Errors
- **Check**: Dependencies installed? (`bun install`)
- **Check**: TypeScript compilation? (`bun run build`)
- **Fix**: Reinstall dependencies, restart servers

#### Music Search Not Working
- **Check**: iTunes API accessible? (Test: https://itunes.apple.com/search?term=test)
- **Check**: Network connection?
- **Fix**: Try different music provider in MUSIC_ALTERNATIVES.md

## 🧪 Testing Console Health

Open browser dev tools (F12) → Console tab:

### ✅ Healthy Console (What you should see):
```
📊 Analytics disabled (no PostHog key configured)
[WebSocket] Connected to ws://localhost:8080
[Room] Joined room: abc123
```

### ❌ Unhealthy Console (Needs fixing):
```
Failed to load resource: http://localhost:8080/ws net::ERR_CONNECTION_REFUSED
Failed to fetch: TypeError: Failed to fetch
Uncaught (in promise): WebSocket connection failed
```

## 🔧 Quick Fixes

### Fix 1: Clear Browser Cache
```bash
# Hard refresh
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# Or clear all data
Dev Tools → Application → Storage → Clear storage
```

### Fix 2: Restart Everything
```bash
# Kill all processes
lsof -ti:8080 | xargs kill -9
lsof -ti:3000 | xargs kill -9

# Restart clean
bun dev
```

### Fix 3: Check Environment
```bash
# Verify setup
./setup-env.sh

# Check current environment
cat apps/server/.env
cat apps/client/.env
```

### Fix 4: Reinstall Dependencies
```bash
# Clean install
rm -rf node_modules apps/*/node_modules
rm bun.lock apps/*/bun.lock
bun install
```

## 📋 Debugging Checklist

Before reporting issues, verify:

- [ ] Both servers running (`bun dev` shows no errors)
- [ ] Browser console clear of red errors
- [ ] Can access http://localhost:3000 and http://localhost:8080
- [ ] Environment files configured (./setup-env.sh)
- [ ] Dependencies installed (`bun install`)
- [ ] Latest code pulled (`git pull`)

## 🎯 Performance Optimization

### Reduce Console Noise:
```bash
# Disable verbose logging
export NODE_ENV=production

# Or edit .env files to remove debugging
```

### Speed Up Development:
```bash
# Use cached builds
bun run build  # Pre-build once

# Start with cached assets
bun dev
```

## 📞 Still Having Issues?

1. **Run health check**: `./setup-env.sh`
2. **Check this guide**: Find your error above
3. **Test basic functionality**: Create room, search music
4. **Gather info**: Console errors, server logs, environment
5. **Try minimal setup**: Comment out optional features

## 🎉 Success Indicators

You know it's working when:
- ✅ No red errors in browser console
- ✅ Can create and join rooms
- ✅ Music search returns results
- ✅ WebSocket shows "Connected" 
- ✅ Multiple browser tabs sync properly

Your BeatSync should now be error-free and ready for testing! 🎵
