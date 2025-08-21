# Beatsync

Beatsync is a high-precision web audio player built for multi-device playback. The official app is [beatsync.gg](https://www.beatsync.gg/).

https://github.com/user-attachments/assets/2aa385a7-2a07-4ab5-80b1-fda553efc57b

## Features

- **Millisecond-accurate synchronization**: Abstracts [NTP-inspired](https://en.wikipedia.org/wiki/Network_Time_Protocol) time synchronization primitives to achieve a high degree of accuracy
- **Cross-platform**: Works on any device with a modern browser (Chrome recommended for best performance)
- **Spatial audio**: Allows controlling device volumes through a virtual listening source for interesting sonic effects
- **Real music search**: Integrated with Spotify Web API for real track discovery and streaming
- **Advanced mobile experience**: PWA with haptic feedback, touch optimizations, and mobile-first design
- **Polished UI/UX**: Comprehensive loading states, error boundaries, enhanced toasts, and smooth animations
- **Self-hostable**: Run your own instance with a few commands
- **Performance optimized**: Network-aware features, mobile-first PWA, offline support
- **Production ready**: Comprehensive deployment configurations included

### 🎵 Music Integration
- **Spotify Web API**: Real track search with artist, title, duration, and preview URLs
- **Provider fallback system**: Spotify → External Provider → Mock results for reliability
- **Smart search results**: Handles both legacy and modern response formats
- **Track metadata**: Rich information including album art, ISRC codes, and audio previews

### 📱 Mobile Experience
- **Progressive Web App (PWA)**: Full offline support with manifest optimization
- **Touch interactions**: Haptic feedback and mobile-optimized gesture handling
- **Responsive design**: Mobile-first CSS with device-specific optimizations
- **App shortcuts**: Quick access to rooms and search via PWA shortcuts

### 🎨 UI/UX Enhancements
- **Loading states**: Comprehensive spinners and skeleton states throughout the app
- **Error boundaries**: Robust error handling with PostHog analytics integration
- **Enhanced toasts**: Rich notification system with multiple color schemes
- **Motion animations**: Smooth transitions using Framer Motion
- **Empty states**: Helpful placeholder content when no results are available

> [!NOTE]
> Beatsync is in early development. Mobile support is working, but experimental. Please consider creating an issue or contributing with a PR if you run into problems!

## 🚀 Quick Deploy

Deploy your own BeatSync instance using the included deployment script:

```bash
./deploy.sh
```

The deployment script supports multiple platforms and provides guided setup for:
- **🌐 Frontend**: Vercel/Netlify deployment
- **🔧 Backend**: Railway/Render deployment  
- **💾 Storage**: Cloudflare R2 integration

### Manual Deployment Options:
- **Frontend**: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/beatsync&env=NEXT_PUBLIC_SERVER_URL,NEXT_PUBLIC_WS_URL)
- **Backend**: Use Railway or Render with the included configs

## Environment Variables

### Client Configuration (`apps/client/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key_here  # Optional: Analytics
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com  # Optional: Analytics
```

### Server Configuration (`apps/server/.env`)

```env
# Spotify Web API Integration (Optional)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Storage Configuration (Optional)
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_ACCESS_KEY_ID=your_cloudflare_access_key
CLOUDFLARE_SECRET_ACCESS_KEY=your_cloudflare_secret_key
CLOUDFLARE_BUCKET_NAME=your_bucket_name
CLOUDFLARE_R2_ENDPOINT=your_r2_endpoint
```

### 🎵 Setting up Spotify Integration

1. Create a Spotify app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Set redirect URI to `http://localhost:8080/callback` (for development)
3. Copy Client ID and Client Secret to your server `.env` file
4. Restart the server - Spotify search will now work with real music data!

**Note**: Without Spotify credentials, the app falls back to external providers and mock data.

## Quickstart

This project uses [Turborepo](https://turbo.build/repo).

Fill in the `.env` file in `apps/client` with the following:

```sh
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
```

Run the following commands to start the server and client:

```sh
bun install          # installs once for all workspaces
bun dev              # starts both client (:3000) and server (:8080)
```

| Directory         | Purpose                                                        |
| ----------------- | -------------------------------------------------------------- |
| `apps/server`     | Bun HTTP + WebSocket server with Spotify integration          |
| `apps/client`     | Next.js PWA frontend with mobile optimizations                |
| `packages/shared` | Type-safe schemas and functions shared between client & server |

### Key Recent Enhancements

**Code Cleanup & Optimization** ✅ (Latest)
- Removed 16+ unnecessary documentation files and redundant configs
- Fixed corrupted files and broken test cases
- Streamlined deployment configurations
- Improved build performance and project maintainability

**Phase A: Real Music Search Integration** ✅
- Spotify Web API integration with Client Credentials flow
- Enhanced MusicProviderManager with provider fallback system
- Updated response schemas for backward compatibility

**Phase B: Mobile Experience Optimization** ✅  
- PWA manifest with shortcuts and display overrides
- Mobile touch hooks with haptic feedback
- CSS optimizations for mobile-first responsive design

**Phase C: UI/UX Polish** ✅
- Comprehensive loading states and error boundaries
- Enhanced toast notifications with rich styling
- Smooth animations using Framer Motion throughout the app
