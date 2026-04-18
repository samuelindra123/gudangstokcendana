/**
 * Backend Configuration
 * Centralized configuration untuk backend services
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Telegram API Configuration
const TELEGRAM_API = {
  API_URL: `https://api.telegram.org/bot${BOT_TOKEN}`,
  BASE_DOMAIN: 'https://api.telegram.org',
  ENDPOINTS: {
    SET_DESCRIPTION: 'setMyDescription',
    SET_SHORT_DESCRIPTION: 'setMyShortDescription',
    SET_COMMANDS: 'setMyCommands',
    SET_DEFAULT_ADMINISTRATOR_RIGHTS: 'setMyDefaultAdministratorRights',
  }
};

// Bot Configuration
const BOT_CONFIG = {
  NAME: 'Gudang Stok Cendana',
  HANDLER: 'GudangStokCendana_bot',
  CREATOR: 'Samuel Indra Bastian',
  DESCRIPTION: 'Sistem manajemen inventaris realtime. Kelola workspace dan item stok langsung dari Telegram dengan mudah dan cepat! 📦\n\nDibuat oleh Samuel Indra Bastian',
  SHORT_DESCRIPTION: 'Manajemen inventaris realtime untuk Telegram 📦',
  WELCOME_MESSAGE: `Halo! 👋 Selamat datang di Gudang Stok Cendana 📦

Sistem manajemen inventaris yang dirancang khusus untuk memudahkan pengelolaan stok workspace Anda secara realtime melalui Telegram.

🎯 Yang Bisa Anda Lakukan:
✓ Lihat semua workspace dengan mudah
✓ Kelola item dan stok secara real-time
✓ Tambah/kurangi jumlah barang dengan 1 klik
✓ Pantau perubahan stok instan

🚀 Mulai sekarang dengan mengetik: /workspaces

Dibuat dengan ❤️ oleh Samuel Indra Bastian`,
  COMMANDS: [
    { command: 'start', description: 'Mulai menggunakan bot' },
    { command: 'workspaces', description: 'Lihat daftar workspace Anda' },
    { command: 'help', description: 'Tampilkan bantuan lengkap' }
  ]
};

// Action Types (for consistency across bot)
const ACTION_TYPES = {
  EDIT_NAME: 'edit_name',
  INCREMENT: 'increment',
  DECREMENT: 'decrement',
};

const INPUT_TYPES = {
  EDIT_NAME: 'edit_name',
  INCREMENT: 'inc',
  DECREMENT: 'dec',
};

// Server Configuration
const SERVER_CONFIG = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

module.exports = {
  TELEGRAM_API,
  BOT_CONFIG,
  ACTION_TYPES,
  INPUT_TYPES,
  SERVER_CONFIG,
  BOT_TOKEN
};
