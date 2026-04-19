# 🏢 Gudang Stok Cendana

Sistem manajemen stok barang terintegrasi dengan aplikasi desktop Windows, web, dan mobile Android. Mendukung real-time synchronization, Telegram Bot integration, dan reporting otomatis.

## ✨ Fitur Utama

### 💻 Desktop App (Windows)
- ✅ Instalasi mudah di Windows 10 & 11
- ✅ Offline support
- ✅ Auto-update built-in
- ✅ High performance
- ✅ Real-time sync saat online

### 🌐 Web Application
- ✅ Responsive design
- ✅ Dashboard analytics
- ✅ Export ke Excel/CSV
- ✅ Access dari browser manapun
- ✅ Mobile-friendly

### 📱 Mobile App (Android)
- ✅ Native Android performance  
- ✅ Camera integration
- ✅ Offline mode
- ✅ Push notifications
- ✅ Optimized for low bandwidth

### 🤖 Backend & API
- ✅ RESTful API
- ✅ Telegram Bot integration
- ✅ Real-time updates via Appwrite
- ✅ Secure authentication
- ✅ Cloud-ready architecture

## 📦 Komponen Proyek

```
gudangstokcendana/
├── frontend/          # Next.js web application
├── backend/           # Express.js REST API
├── desktop/           # Electron desktop app
├── mobile/            # React Native Android app
└── docs/              # Documentation
```

## 🚀 Quick Start

### Desktop App (Windows)
```bash
# Download dari halaman downloads
# https://gudangstokcendana.dev/download

# Atau build sendiri
cd desktop
npm install
npm run dist:win
```

### Web Application
```bash
cd frontend
npm install
npm run dev
# Akses di http://localhost:3000
```

### Backend API
```bash
cd backend
npm install
npm run dev
# Akses di http://localhost:3001
```

## 💻 Sistem Requirements

### Desktop (Windows)
- **OS:** Windows 10 atau Windows 11 (64-bit)
- **RAM:** Minimum 2GB
- **Storage:** Minimum 100MB
- **Internet:** Untuk auto-update (recommended)

### Web Browser
- Chrome/Edge (recommended)
- Firefox
- Safari
- Minimal screen width 768px

### Mobile (Android)
- Android 5.0+
- RAM: 2GB+
- Storage: 50MB+

## 🔧 Instalasi Lengkap

### 1. Frontend Setup

```bash
cd frontend
npm install

# Buat .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
EOF

npm run dev
```

### 2. Backend Setup

```bash
cd backend
npm install

# Buat .env
cat > .env << EOF
PORT=3001
NODE_ENV=development
DATABASE_URL=your_database_url
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_API_KEY=your_api_key
TELEGRAM_BOT_TOKEN=your_bot_token
EOF

npm run dev
```

### 3. Desktop Setup

```bash
cd desktop
npm install

# Development mode
npm run dev

# Build installer
npm run dist:win
```

## 📥 Unduh Aplikasi

### Windows Desktop
👉 [Download Installer / Portable](https://gudangstokcendana.dev/download)

- **Installer:** Setup wizard lengkap
- **Portable:** Langsung jalankan tanpa instalasi

### Android Mobile
👉 [Download APK](https://gudangstokcendana.dev/download)

- Direct download dari halaman downloads
- Atau dari [GitHub Releases](https://github.com/samuelindra123/gudangstokcendana/releases)

## 🌐 Deploy

### Frontend (Vercel Recommended)
```bash
# Auto-deploy saat push ke main
# Atau manual:
vercel deploy --prod
```

### Backend (Railway / Heroku)
```bash
# Railway
railway deploy

# Atau Heroku  
git push heroku main
```

### Desktop App
```bash
# Release otomatis via GitHub Actions
git tag v1.0.0
git push origin v1.0.0
# Workflow build dan release otomatis
```

## 📖 Dokumentasi

- [**BUILD_AND_DEPLOYMENT.md**](./BUILD_AND_DEPLOYMENT.md) - Complete build & deployment guide
- [**Desktop Development Guide**](./desktop/DEVELOPMENT.md) - Windows app development
- [**Backend Setup**](./backend/BOT_SETUP_GUIDE.md) - Backend & Bot configuration
- [**Frontend Enhancements**](./FRONTEND_ENHANCEMENTS.md) - UI/UX improvements

## 🔐 Konfigurasi Penting

### Environment Variables

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=xxx
```

**Backend (.env):**
```
PORT=3001
NODE_ENV=development
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_API_KEY=xxx
TELEGRAM_BOT_TOKEN=xxx
```

**Desktop (.env):**
```
REACT_APP_API_URL=http://localhost:3001
REACT_APP_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
REACT_APP_APPWRITE_PROJECT_ID=xxx
```

## 🤖 Telegram Bot Integration

Bot otomatis mengirim notifikasi untuk:
- Stok barang low stock
- Penjualan harian report
- Notifikasi area tertentu
- User manual commands

Setup:
```bash
cd backend
npm run dev
# Bot akan listen ke telegram updates
```

## 📊 API Endpoints

```
GET  /api/releases          - Get latest app versions
GET  /api/logs              - Get activity logs
POST /api/sync              - Sync data
GET  /api/reports           - Generate reports
POST /api/auth/login        - User login
POST /api/auth/logout       - User logout
```

## 🧪 Testing

### Frontend
```bash
cd frontend
npm test
npm run lint
```

### Backend
```bash
cd backend
npm test
```

### Desktop
```bash
cd desktop
npm run dist:win
# Manual testing installer
```

## 🐛 Known Issues

- Desktop app auto-update memerlukan internet connection
- Offline mode di desktop memiliki data sync delay
- Mobile app memerlukan Android 5.0+ untuk features tertentu

## 📝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push ke branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

## 📄 License

Distributed under ISC License. See `LICENSE` file for details.

## 👥 Support

### Report Issues
- GitHub Issues: https://github.com/samuelindra123/gudangstokcendana/issues
- Email: support@gudangstokcendana.dev

### Documentation
- [Online Docs](https://docs.gudangstokcendana.dev)
- [FAQ](https://gudangstokcendana.dev/faq)
- [Tutorials](https://gudangstokcendana.dev/tutorials)

## 🔗 Useful Links

- 🌐 [Website](https://gudangstokcendana.dev)
- 📱 [Downloads](https://gudangstokcendana.dev/download)
- 💬 [Discussions](https://github.com/samuelindra123/gudangstokcendana/discussions)
- 📦 [Releases](https://github.com/samuelindra123/gudangstokcendana/releases)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Desktop with [Electron](https://www.electronjs.org/)
- Mobile with [Capacitor](https://capacitorjs.com/)
- Backend with [Express.js](https://expressjs.com/)
- Data with [Appwrite](https://appwrite.io/)

---

**Last Updated:** April 2026 | **Status:** Active Development ✅
