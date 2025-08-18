# Brave Browser Configuration for BeatSync

## Audio Streaming Permission Issues in Brave Browser

If you're experiencing audio capture issues in Brave browser, here are the specific steps to resolve them:

### 1. Site-Specific Permissions (Recommended)

#### Option A: Quick Fix via Shield Icon
1. Look for the **shield icon** in the address bar (🛡️)
2. Click on it to open site permissions
3. Set **"Site Microphone Use"** to **Allow**
4. Set **"Site Camera Use"** to **Allow** (needed for system audio)
5. Refresh the page and try again

#### Option B: Via Site Settings
1. Click the **lock icon** or **"Site settings"** in the address bar
2. Find **Microphone** and set to **Allow**
3. Find **Camera** and set to **Allow**
4. Find **Sound** and set to **Allow**
5. Refresh the page

### 2. Global Brave Settings

#### Audio/Microphone Settings:
1. Go to `brave://settings/content/microphone`
2. Ensure **"Ask before accessing (recommended)"** is selected
3. Add your site (e.g., `http://localhost:3000`) to the **"Allow"** list
4. Make sure it's not in the **"Block"** list

#### Sound Settings:
1. Go to `brave://settings/content/sound`
2. Ensure **"Allow sites to play sound (recommended)"** is selected
3. Add your site to the **"Allow"** list if needed

#### Camera Settings (for system audio):
1. Go to `brave://settings/content/camera`
2. Ensure **"Ask before accessing (recommended)"** is selected
3. Add your site to the **"Allow"** list

### 3. Advanced Fixes

#### If System Audio Still Doesn't Work:

1. **Enable Hardware Acceleration:**
   - Go to `brave://settings/system`
   - Enable **"Use hardware acceleration when available"**
   - Restart Brave

2. **Experimental Features:**
   - Go to `brave://flags/`
   - Search for "media"
   - Enable **"Experimental Web Platform features"**
   - Enable **"Media Session API"**
   - Restart Brave

3. **Privacy & Security Settings:**
   - Go to `brave://settings/privacy`
   - Set **Shields** to "Standard" (not Aggressive)
   - Disable **"Block fingerprinting"** temporarily
   - Make sure **"WebRTC IP handling policy"** is not set to "Disable non-proxied UDP"

### 4. HTTPS Requirements

For production deployment, system audio capture requires HTTPS. Make sure:
- Your site is served over HTTPS
- SSL certificate is valid
- No mixed content warnings

### 5. Troubleshooting Steps

If audio still doesn't work:

1. **Check Browser Console:**
   - Press F12 → Console tab
   - Look for specific error messages
   - Share error details if needed

2. **Try Different Audio Sources:**
   - **System Audio**: Captures computer audio (best quality)
   - **Microphone**: Captures mic input (most compatible)
   - **File Upload**: Upload audio files (fallback option)

3. **Test in Incognito Mode:**
   - Open `brave://settings/`
   - Go to **Extensions**
   - Enable **"Allow in Incognito"** for necessary extensions
   - Test in incognito window

### 6. Alternative Solutions

If Brave continues to block audio:

1. **Use Microphone Mode Instead:**
   - Click the "Mic" button instead of "System Audio"
   - This has better compatibility with Brave's privacy features

2. **Use File Upload Mode:**
   - Upload audio files directly
   - No browser permissions needed

3. **Switch to Chrome/Edge Temporarily:**
   - Chrome and Edge have better media API support
   - Use for audio streaming, return to Brave for other browsing

### 7. Error Messages and Solutions

| Error Message | Solution |
|---------------|----------|
| "Audio access denied" | Follow steps 1-2 above |
| "display-capture blocked by permissions policy" | Enable camera permissions (step 2) |
| "No microphone found" | Check system audio settings, try different USB port |
| "Audio capture not supported" | Enable experimental features (step 3.2) |

### 8. Contact Support

If none of these solutions work:
1. Note your Brave version: `brave://version/`
2. Note your operating system
3. Share console error messages
4. Try the solutions above in order

---

## Summary for Quick Reference:

**Most Common Fix for Brave:**
1. Click shield icon 🛡️ in address bar
2. Allow "Site Microphone Use"
3. Allow "Site Camera Use" 
4. Refresh page
5. Try microphone mode if system audio fails

**Still not working?** Go to `brave://settings/content/microphone` and add your site to "Allow" list.
