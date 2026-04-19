# 🚀 Complete Build & Deployment Guide

## Overview

This project consists of three components:
1. **Frontend** - Next.js web application
2. **Backend** - Node.js/Express API server
3. **Desktop** - Electron application for Windows 10/11

## 📋 Prerequisites

- Node.js 18+ (LTS)
- npm or yarn
- Git
- GitHub account (for releases)
- Windows 10/11 (for testing desktop app)

## 🏢 Project Structure

```
gudangstokcendana/
├── frontend/        # Next.js web app
├── backend/         # Express API
├── desktop/         # Electron desktop app
└── mobile/          # React Native Android app
```

## 🔧 Frontend Deployment

### Build for Production

```bash
cd frontend
npm install
npm run build
npm start
```

### Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://appwrite.yourdomain.com/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### Deploy to Vercel (Recommended)

1. Push to GitHub
2. Connect project to Vercel
3. Vercel auto-deploys on push

### Deploy to Other Platforms

**Netlify:**
```bash
npm run build
# Deploy 'out' folder to Netlify
```

**Self-hosted:**
```bash
npm install -g serve
npm run build
serve -s out
```

## 🔌 Backend Deployment

### Local Development

```bash
cd backend
npm install
npm run dev
```

### Production Build

```bash
cd backend
npm install
NODE_ENV=production npm start
```

### Environment Variables

Create `.env`:
```
PORT=3001
NODE_ENV=production
DATABASE_URL=your_database_url
APPWRITE_ENDPOINT=https://appwrite.yourdomain.com/v1
APPWRITE_API_KEY=your_api_key
TELEGRAM_BOT_TOKEN=your_bot_token
```

### Deploy Options

**Docker (Recommended):**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

**Heroku:**
```bash
heroku create your-app-name
git push heroku main
```

**Railway.app:**
```bash
railway login
railway init
railway up
```

## 💻 Desktop App Deployment

### Build for Release

```bash
cd desktop
npm install
npm run dist:win
```

Output files:
- `dist/Gudang-Stok-Cendana-1.0.0.exe` - Installer
- `dist/Gudang-Stok-Cendana-1.0.0-portable.exe` - Portable

### Create GitHub Release

**Automated via GitHub Actions:**

1. Update version in `desktop/package.json`
2. Create Git tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. GitHub Actions automatically:
   - Builds Windows installer
   - Creates GitHub Release
   - Uploads artifacts

**Manual Release:**

1. Build locally:
   ```bash
   cd desktop
   npm run dist:win
   ```

2. Go to GitHub > Releases > Create Release
3. Upload `.exe` files
4. Set as latest release

### Auto-Update Support

Desktop app automatically checks for updates on startup.

Updates served from: `https://github.com/samuelindra123/gudangstokcendana/releases`

To trigger update check:
```typescript
// In src/main.ts
autoUpdater.checkForUpdatesAndNotify();
```

## 🌐 Web Deployment Platforms

### Vercel (Best for Next.js)
- ✅ Auto-deploy on push
- ✅ Serverless functions
- ✅ Global CDN
- ✅ Free tier available

```bash
npm i -g vercel
vercel login
vercel
```

### Netlify
- ✅ Easy deployment
- ✅ Form handling
- ✅ Analytics
- ✅ Free tier with limits

```bash
npm i -g netlify-cli
netlify login
netlify deploy --prod --dir=out
```

### Railway.app
- ✅ Database included
- ✅ Simple deployment
- ✅ Good for full-stack

```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

### AWS EC2
- ✅ Full control
- ✅ Scalable
- ✅ More complex

```bash
# Setup server
sudo apt update
sudo apt install nodejs npm git
git clone your-repo
cd your-repo/frontend
npm install && npm run build
npm run start
```

## 📱 Mobile App (Android)

### Build APK

```bash
cd mobile
ionic build
npx capacitor sync
cd android
./gradlew assembleDebug
```

APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Distribute

1. **Via Download Page:**
   - APK available at: `https://your-domain.com/download`
   - Users can download directly

2. **Via Google Play Store:**
   - More complex setup
   - Requires signing
   - Professional distribution

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

```
.github/workflows/
├── build-android.yml        # Build APK
└── build-windows-desktop.yml # Build Windows installer
```

### Setup New Workflow

1. Create `.github/workflows/your-workflow.yml`

```yaml
name: Your Workflow
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build
        run: npm install && npm run build
```

2. Push to GitHub
3. Workflow runs automatically

## 🧪 Testing

### Frontend Testing

```bash
cd frontend
npm test
npm run lint
```

### Backend Testing

```bash
cd backend
npm test
```

### Desktop App Testing

```bash
cd desktop
npm run build
npm start # Run in development
```

## 📊 Monitoring & Logging

### Frontend
- Vercel Analytics
- Sentry (error tracking)

### Backend
- PM2 (process management)
- Winston (logging)

### Desktop
- Electron logs: `%AppData%\Gudang-Stok-Cendana\logs`

## 🔐 Security Checklist

- [ ] All environments use HTTPS
- [ ] API keys stored in environment variables
- [ ] Database credentials not in code
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Update dependencies regularly
- [ ] Code review before merge

## 📈 Performance Optimization

### Frontend
- Build optimization: `npm run build`
- Image optimization: use Next.js Image
- Code splitting: automatic in Next.js
- Caching: configured in vercel.json

### Backend
- Database indexes
- Connection pooling
- Response caching
- Compression middleware

### Desktop
- Lazy loading
- Memory management
- Bundle optimization

## 🆘 Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Deployment Issues
- Check environment variables
- Verify API endpoints
- Check logs on hosting platform
- Ensure all dependencies installed

### Desktop App Won't Update
- Check network connection
- Verify GitHub release exists
- Check app logs

## 📚 Additional Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com)
- [Electron Documentation](https://www.electronjs.org/docs)
- [GitHub Actions](https://docs.github.com/en/actions)

## 💡 Best Practices

1. **Version Management**
   - Semantic versioning: MAJOR.MINOR.PATCH
   - Tag releases: `v1.0.0`

2. **Release Notes**
   - Document changes
   - List new features
   - Note breaking changes

3. **Testing**
   - Test locally first
   - Use staging environment
   - Get user feedback

4. **Monitoring**
   - Track errors
   - Monitor performance
   - Check user feedback

## 🎯 Next Steps

1. ✅ Build frontend
2. ✅ Deploy backend
3. ✅ Build & distribute desktop app
4. ✅ Build & distribute mobile app
5. ✅ Setup monitoring
6. ✅ Document API
7. ✅ Train support team

---

**Last Updated:** April 2026
**Maintained by:** Development Team
