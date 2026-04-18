# 📋 Gudang Stok Cendana - Bot Telegram Setup Guide

## ✅ Informasi Bot yang Sudah Diatur

**Bot Name:** Gudang Stok Cendana  
**Bot Handler:** @GudangStokCendana_bot  
**Creator:** Samuel Indra Bastian  
**Versi:** 1.0.0

---

## 🤖 Commands yang Tersedia

Ketika user ketik `/` di Telegram, mereka akan melihat:

- `/start` - Mulai menggunakan bot
- `/workspaces` - Lihat daftar workspace Anda
- `/help` - Tampilkan bantuan lengkap

*(Note: Command `/login` diketik manual dengan format `/login TOKEN`, dan `halo` cukup diketik sebagai pesan biasa)*

---

## 📜 Deskripsi Bot yang Ditampilkan

### **Short Description**
```
Manajemen inventaris realtime untuk Telegram 📦
```

### **Full Description**
```
🎯 Gudang Stok Cendana Bot - Solusi Manajemen Inventaris

Pantau dan kelola workspace serta stok barang Anda secara real-time 
langsung melalui Telegram.

✨ Fitur Utama:
🏢 Lihat semua workspace Anda
📦 Kelola item dan stok inventaris
➕➖ Tambah/kurangi jumlah barang dengan 1 klik
⚡ Sinkronisasi otomatis dengan dashboard web
📊 Pantau perubahan stok real-time

🚀 Perintah Dasar:
/start - Mulai gunakan bot
/workspaces - Lihat daftar workspace Anda
/halo - Dapatkan bantuan

Dikembangkan oleh: Samuel Indra Bastian
```

---

## 🎨 Setup Gambar (Panduan Prompt Pribadi)

*Catatan: Anda dapat mengedit file ini sesuka hati Anda di VS Code. File ini hanya ada di workspace lokal Anda sehingga 100% privat dan tidak bisa dilihat orang lain kecuali Anda bagikan.*

### 1. **Foto Profil Bot (Profile Picture)**
Prompt untuk AI Image Generator (DALL-E 3 / Midjourney):
```text
A highly detailed, modern minimalist logo for an inventory management app called "Gudang Stok Cendana". The icon features a stylized modern warehouse with stacked glowing smart boxes. Color palette: deep dark blue (#1F2937), vibrant indigo (#4F46E5), and pristine white. 3D isometric vector style, clean lines, professional corporate tech identity, flat dark background, 8k resolution, UI/UX aesthetics --v 6.0
```

**Tools yang disarankan:** Midjourney, ChatGPT Plus (DALL-E 3), atau Bing Image Creator.

### 2. **Welcome Picture (Gambar Selamat Datang)**
Prompt untuk AI Image Generator:
```text
A sleek, futuristic dashboard interface for an inventory management application, displayed on a dark mode screen floating in a clean studio environment. Glowing indigo data charts, modern warehouse workspace cards with inventory stock counts. High-tech corporate aesthetic. Include subtle text "Gudang Stok Cendana". Studio lighting, highly detailed, photorealistic UI mockup, depth of field, 8k resolution, UI/UX design presentation --ar 16:9 --v 6.0
```

**Upload di:** Dashboard → Telegram Bot → Step 3

---

## 🔧 Setup Manual via BotFather (Jika Diperlukan)

1. **Chat BotFather:**
   ```
   Buka: https://t.me/botfather
   Ketik: /mybots
   Pilih bot Anda
   ```

2. **Commands (Biar bisa diklik tanpa ketik di tombol Menu):**
   ```
   /setcommands
   
   Paste ini:
   start - Mulai menggunakan bot
   workspaces - Lihat daftar workspace Anda
   help - Tampilkan bantuan lengkap
   ```

3. **Description:**
   ```
   /description
   [Paste deskripsi di atas]
   ```

4. **Foto Profil:**
   ```
   /setuserpic
   Upload gambar yang sudah di-generate
   ```

---

## 🚀 Testing Bot

1. **Buka Bot di Telegram:**
   ```
   https://t.me/GudangStokCendana_bot
   ```

2. **Test Commands:**
   - `/start` - Lihat welcome message
   - `halo` - Trigger greeting
   - `/workspaces` - Lihat workspace list (setelah login)

3. **Login Test:**
   - Buka Dashboard → Telegram Bot → Generate Token
   - Copy token
   - Kirim ke bot: `/login TOKENMMU`
   - Verify: Pesan login sukses muncul

---

## 📱 User Flow

```
1. User: /start
   Bot: Tampilkan welcome message + instruksi login

2. User: Buka dashboard di web
   User: Klik menu Telegram Bot
   User: Klik Generate Token
   User: Copy token

3. User: Kirim ke bot: /login TOKEN
   Bot: Verifikasi & link akun
   Bot: "✅ Akun berhasil tertaut"

4. User: /workspaces
   Bot: Tampilkan list workspace dengan inline buttons
   User: Klik workspace → Lihat items
   User: Klik item → Lihat stok, bisa tambah/kurangi

5. Real-time sync:
   Bot: Update otomatis ke database
   Web: Refresh dashboard, lihat perubahan stok
```

---

## 📊 Info Teknis

- **Backend Node:** Express.js + Telegraf
- **API:** Telegram Bot API
- **Database:** Appwrite
- **Setup Script:** `backend/src/bot/setupBotInfo.js`
- **Run Script:** `npm run dev` di folder backend

---

## 💡 Tips & Troubleshooting

**Q: Bot tidak merespons?**  
A: Pastikan backend running dengan: `cd backend && npm run dev`

**Q: Token tidak valid?**  
A: Token valid hanya 24 jam. Generate token baru di dashboard.

**Q: Workspace tidak muncul?**  
A: Pastikan Anda sudah login ke akun Google di web dashboard.

**Q: Stok tidak ter-update?**  
A: Refresh halaman web atau tunggu beberapa detik untuk sync real-time.

---

**Created by:** Samuel Indra Bastian  
**Date:** April 2026  
**Version:** 1.0.0
