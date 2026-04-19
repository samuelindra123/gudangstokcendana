# Windows Desktop App Development Guide

## 📋 Prerequisites

- Node.js 18+ (LTS recommended)
- npm atau yarn
- Windows 10 or Windows 11
- Git

## 🚀 Quick Start

### 1. Setup Development Environment

```bash
cd desktop
npm install
```

### 2. Create .env File

```bash
cp .env.example .env
```

Edit `.env` dengan konfigurasi lokal Anda:
```
REACT_APP_API_URL=http://localhost:3001
REACT_APP_APPWRITE_ENDPOINT=https://your-appwrite-instance.com/v1
REACT_APP_APPWRITE_PROJECT_ID=your_project_id
```

### 3. Development Mode

```bash
npm run dev
```

This will:
- Start TypeScript compilation in watch mode
- Launch Electron with hot-reload capabilities
- Open DevTools for debugging

## 🔨 Build Commands

### Compile TypeScript Only
```bash
npm run build
```

### Build Installer
```bash
npm run dist:installer
```
Menghasilkan file installer NSIS (.exe) untuk instalasi paket lengkap.

### Build Portable
```bash
npm run dist:portable
```
Menghasilkan executable standalone tanpa memerlukan instalasi.

### Build Both Formats
```bash
npm run dist:win
```
Menghasilkan kedua format installer dan portable.

## 📦 Build Output

Hasil build akan berada di folder `dist/`:
- `Gudang-Stok-Cendana-1.x.x.exe` - Installer NSIS
- `Gudang-Stok-Cendana-1.x.x-portable.exe` - Portable version

## 🔐 Code Signing (Optional)

Untuk production deployment, Anda dapat menambahkan digital signature:

```json
// package.json
"win": {
  "certificateFile": "path/to/certificate.pfx",
  "certificatePassword": "your_password",
  "sign": "./signingScript.js"
}
```

## 🧪 Testing

### Manual Testing

1. **Installer Test**
   ```bash
   npm run dist:installer
   # Run the .exe file and test installation
   ```

2. **Portable Test**
   ```bash
   npm run dist:portable
   # Run the .exe file directly
   ```

3. **Upgrade Test**
   - Install version 1.0.0
   - Update version di package.json ke 1.0.1
   - Run `npm run dist:installer`
   - Test auto-update functionality

## 📝 File Structure

```
desktop/
├── src/
│   ├── main.ts           - Main Electron process
│   ├── preload.ts        - Preload script untuk IPC
│   └── types/
│       └── electron.d.ts - Electron type definitions
├── assets/
│   └── icon.ico         - Application icon
├── dist/                - Compiled JavaScript (auto-generated)
├── package.json         - Project dependencies & build scripts
├── tsconfig.json        - TypeScript configuration
└── README.md           - Dokumentasi aplikasi
```

## 🔄 GitHub Actions Workflow

### Automatic Build on Release

The workflow `.github/workflows/build-windows-desktop.yml`:
1. Triggered when pushing a tag (e.g., `git tag v1.0.0`)
2. Builds Windows installer dan portable versions
3. Creates GitHub Release dengan artifacts
4. Runs basic installer verification

### Manual Trigger

```bash
# Push tag untuk trigger workflow
git tag v1.0.0
git push origin v1.0.0
```

### Workflow Status

Check workflow status di: https://github.com/samuelindra123/gudangstokcendana/actions

## 🆕 Creating a New Release

### Step-by-Step

1. **Update Version**
   ```bash
   cd desktop
   # Update version di package.json
   # Contoh: "1.0.0" → "1.0.1"
   ```

2. **Commit Changes**
   ```bash
   git add desktop/package.json
   git commit -m "chore: bump version to 1.0.1"
   ```

3. **Create Release Tag**
   ```bash
   git tag -a v1.0.1 -m "Release version 1.0.1"
   git push origin main --tags
   ```

4. **Wait for GitHub Actions**
   - Cek https://github.com/samuelindra123/gudangstokcendana/actions
   - Workflow akan otomatis membangun installer & portable
   - Artifacts akan tersedia di GitHub Releases

5. **Download & Test**
   - Visit: https://github.com/samuelindra123/gudangstokcendana/releases
   - Download .exe files for testing
   - Verify digital signature (if applicable)

## 🐛 Troubleshooting

### Build Error: electron-builder not found
```bash
npm install
npm run build
```

### Dev Mode Not Starting
```bash
# Kill any existing electron processes
# Reinstall node_modules
rm -r node_modules
npm install
npm run dev
```

### Port 3000 Already in Use
Modify dev script atau change port dalam `src/main.ts`

### Build Too Large
Check `node_modules` size:
```bash
npm modclean -r --no-save
```

## 📚 Dependencies

- **electron** - Desktop app framework
- **electron-builder** - Build & packaging
- **electron-updater** - Auto-update support
- **TypeScript** - Type-safe development

## 🔗 Useful Links

- [Electron Documentation](https://www.electronjs.org/docs)
- [Electron Builder GitHub](https://github.com/electron-userland/electron-builder)
- [NSIS Installer](http://nsis.sourceforge.net/)

## 📞 Support

Untuk masalah atau pertanyaan:
1. Check [Issues](https://github.com/samuelindra123/gudangstokcendana/issues)
2. Create new issue dengan detail error
3. Attach logs dan reproduction steps
