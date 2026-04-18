/**
 * Application Constants & Configuration
 * Centralized configuration untuk menghindari hardcoding nilai
 */

// Telegram Bot Configuration
export const TELEGRAM_BOT = {
  USERNAME: '@GudangStokCendana_bot',
  HANDLER: 'GudangStokCendana_bot',
  WEB_URL: () => `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'GudangStokCendana_bot'}`,
  DIRECT_LINK: () => {
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'GudangStokCendana_bot';
    return `https://t.me/${botUsername}`;
  }
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  TIMEOUT: 10000,
  ENDPOINTS: {
    HEALTH: '/api/health',
  }
};

// Dashboard Configuration
export const DASHBOARD = {
  ITEMS_PER_PAGE: 20,
  REFRESH_INTERVAL: 5000, // ms
  CHART_COLORS: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'],
  STATUS_BADGES: {
    LOW_STOCK: { label: 'Stok Rendah', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
    NORMAL: { label: 'Normal', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
    HIGH_STOCK: { label: 'Stok Tinggi', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  }
};

// Feature Flags
export const FEATURES = {
  ENABLE_EXPORT: true,
  ENABLE_BULK_ACTIONS: true,
  ENABLE_TEMPLATES: true,
  ENABLE_ANALYTICS: true,
  ENABLE_REAL_TIME_SYNC: true,
};

// App Metadata
export const APP_META = {
  NAME: 'Gudang Stok Cendana',
  DESCRIPTION: 'Manajemen inventaris realtime untuk Telegram',
  CREATOR: 'Samuel Indra Bastian',
  VERSION: '1.0.0',
};
