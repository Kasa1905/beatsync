#!/bin/bash

# BeatSync Deployment Script
echo "🚀 BeatSync Deployment Script"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is initialized and committed
check_git_status() {
    print_status "Checking Git status..."
    
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not a git repository. Please initialize git first."
        echo "Run: git init && git add . && git commit -m 'Initial commit'"
        exit 1
    fi
    
    if [[ -n $(git status --porcelain) ]]; then
        print_warning "You have uncommitted changes. Committing them now..."
        git add .
        git commit -m "Pre-deployment commit $(date)"
    fi
    
    print_success "Git status OK"
}

# Build and test the application
build_and_test() {
    print_status "Building and testing the application..."
    
    # Test client build
    print_status "Building client..."
    cd apps/client
    npm run build
    if [ $? -ne 0 ]; then
        print_error "Client build failed!"
        exit 1
    fi
    cd ../..
    
    # Test server
    print_status "Type-checking server..."
    cd apps/server
    npm run type-check
    if [ $? -ne 0 ]; then
        print_error "Server type check failed!"
        exit 1
    fi
    cd ../..
    
    print_success "Build and tests passed!"
}

# Deploy to GitHub (prerequisite for other deployments)
deploy_to_github() {
    print_status "Pushing to GitHub..."
    
    # Check if remote origin exists
    if ! git remote get-url origin > /dev/null 2>&1; then
        print_error "No GitHub remote found. Please add your GitHub repository:"
        echo "git remote add origin https://github.com/yourusername/beatsync.git"
        exit 1
    fi
    
    git push origin main
    print_success "Pushed to GitHub!"
}

# Create deployment instructions
create_deployment_instructions() {
    print_status "Creating deployment instructions..."
    
    cat > DEPLOY_NOW.md << 'EOF'
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
EOF

    print_success "Created deployment instructions in DEPLOY_NOW.md"
}

# Main deployment flow
main() {
    echo "Starting deployment preparation..."
    echo ""
    
    check_git_status
    echo ""
    
    build_and_test
    echo ""
    
    deploy_to_github
    echo ""
    
    create_deployment_instructions
    echo ""
    
    print_success "🎉 Deployment preparation complete!"
    echo ""
    echo "Next steps:"
    echo "1. Read DEPLOY_NOW.md for detailed instructions"
    echo "2. Deploy frontend to Vercel"
    echo "3. Deploy backend to Railway"
    echo "4. Update environment variables"
    echo "5. Test your live application!"
    echo ""
    echo "Your app will be live at:"
    echo "📱 Frontend: https://your-app.vercel.app"
    echo "🔧 Backend: https://your-app.up.railway.app"
    echo ""
    print_success "Happy deploying! 🚀"
}

# Run the main function
main "$@"
