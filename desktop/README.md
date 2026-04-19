# Gudang Stok Cendana - Desktop Application

Desktop application untuk Gudang Stok Cendana yang berjalan di Windows 10 dan 11.

## Fitur
- Manajemen stok barang
- Laporan real-time
- Integrasi Telegram Bot
- Auto-update support

## Persyaratan Sistem
- **OS**: Windows 10 atau Windows 11
- **RAM**: Minimum 2GB
- **Storage**: Minimum 100MB untuk instalasi

## Instalasi

### Dari GitHub Releases
1. Download installer dari [Releases](https://github.com/samuelindra123/gudangstokcendana/releases)
2. Jalankan installer `Gudang-Stok-Cendana-x.x.x.exe`
3. Ikuti petunjuk instalasi
4. Buka aplikasi dari Start Menu atau Desktop Shortcut

### Portable Version
1. Download file `Gudang-Stok-Cendana-x.x.x-portable.exe`
2. Jalankan langsung tanpa instalasi
3. Tidak perlu admin rights

## Development

```bash
# Install dependencies
npm install

# Development dengan hot-reload
npm run dev

# Build untuk production
npm run dist:win

# Build installer NSIS
npm run dist:installer

# Build portable executable
npm run dist:portable
```

## Build Manual

```bash
# Compile TypeScript
npm run build

# Run development version
npm start

# Create distributable
npm run dist
```

## Auto-Update
Aplikasi akan otomatis memeriksa update saat startup. Jika ada update yang tersedia, notifikasi akan ditampilkan.

## Troubleshooting

### Aplikasi tidak bisa dibuka
- Pastikan Anda memiliki minimal 2GB RAM
- Coba disable antivirus sementara saat install
- Run as Administrator

### Update error
- Cek koneksi internet
- Hapus folder AppData\Local\gudangstokcendana\
- Reinstall aplikasi

## License
ISC
