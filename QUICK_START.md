# 🎓 Quick Start Guide - New Features

## 🚀 Getting Started

### 1. Environment Setup ✅

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=GudangStokCendana_bot
```

**Backend** (`.env`):
```env
TELEGRAM_BOT_TOKEN=your_token_here
CORS_ORIGIN=http://localhost:3000
```

### 2. Run Both Services

```bash
# Terminal 1 - Frontend
cd frontend
pnpm build  # or pnpm dev
pnpm start

# Terminal 2 - Backend
cd backend
npm run dev
```

---

## 📖 Using New Components

### Dashboard Components

```tsx
// Import
import { 
  StatsCard, 
  RecentActivityItem, 
  SearchFilter,
  EmptyState,
  LoadingSkeleton 
} from '@/components/dashboard/DashboardComponents';

// Stats Card
<StatsCard
  title="Total Items"
  value={42}
  icon={<Package className="h-5 w-5" />}
  color="blue"  // blue, emerald, amber, purple, rose
/>

// Recent Activity
<RecentActivityItem
  userName="John Doe"
  action="Added"
  itemName="Laptop"
  details="Increased from 10 to 15 (+5)"
  timestamp="14:30"
  badge="increment"  // increment, decrement, edit, create
/>

// Search
<SearchFilter
  searchTerm={search}
  onSearchChange={setSearch}
  placeholder="Search..."
/>

// Export
<ExportButton
  items={items}
  filename="export"
  label="Download"
/>

// Empty State
<EmptyState
  icon={<FolderOpen className="h-10 w-10" />}
  title="No Items"
  description="Create your first item"
  action={{ label: 'Create', onClick: () => {} }}
/>
```

---

## 🔧 Using Configuration Constants

### Frontend Constant Access

```tsx
import { TELEGRAM_BOT, API_CONFIG, DASHBOARD } from '@/lib/constants';

// Telegram Bot
TELEGRAM_BOT.USERNAME           // '@GudangStokCendana_bot'
TELEGRAM_BOT.HANDLER            // 'GudangStokCendana_bot'
TELEGRAM_BOT.DIRECT_LINK()      // 'https://t.me/GudangStokCendana_bot'

// API
API_CONFIG.BASE_URL             // 'http://localhost:3001'
API_CONFIG.ENDPOINTS.HEALTH     // '/api/health'

// Dashboard
DASHBOARD.ITEMS_PER_PAGE        // 20
DASHBOARD.REFRESH_INTERVAL      // 5000 (ms)
DASHBOARD.CHART_COLORS          // ['#4f46e5', ...]
```

### Backend Constant Access

```javascript
const { TELEGRAM_API, BOT_CONFIG, ACTION_TYPES } = require('./config/constants');

// Telegram
TELEGRAM_API.API_URL            // 'https://api.telegram.org/bot...'
TELEGRAM_API.ENDPOINTS.*        // Action names

// Bot
BOT_CONFIG.NAME                 // 'Gudang Stok Cendana'
BOT_CONFIG.HANDLER              // 'GudangStokCendana_bot'
BOT_CONFIG.DESCRIPTION          // Full description text
BOT_CONFIG.COMMANDS             // [{command, description}, ...]

// Actions
ACTION_TYPES.EDIT_NAME          // 'edit_name'
ACTION_TYPES.INCREMENT          // 'increment'
ACTION_TYPES.DECREMENT          // 'decrement'
```

---

## 📊 Dashboard Features

### 1. Real-Time Activity Tracking ✨
```
Recent Activities panel shows:
- Last 10 changes
- User who made change
- Action type (colored badge)
- Item affected
- Exact details (before → after)
- Timestamp
```

### 2. Workspace Search 🔍
```
- Type in search box
- Auto-filters workspace list
- Case-insensitive
- Shows matching results only
```

### 3. CSV Export 📥
```
Click "Export Workspaces" button
↓
Download workspaces-YYYY-MM-DD.csv
↓
Open in Excel/Sheets
```

### 4. Smart Workspace Cards
```
Each workspace card shows:
✓ Workspace name
✓ Number of items
✓ Total stock quantity
⚠️ Count of low stock items (if any)
```

### 5. Statistics Overview
```
Displays:
📁 Total Workspaces
📦 Total Item Types
📊 Total Stock Quantity  
⚠️  Items with Low Stock
```

---

## 🎨 Color System

| Color | Use | Hex |
|-------|-----|-----|
| Blue | Workspaces, Info | `#4f46e5` |
| Emerald | Items, Success | `#10b981` |
| Amber | Stock, Warning | `#f59e0b` |
| Rose | Alerts, Errors | `#ef4444` |
| Purple | Create, Actions | `#8b5cf6` |

---

## 🔄 Export Format

**CSV Structure:**
```csv
name,TotalBarang,TotalStok
Warehouse A,45,1250
Warehouse B,32,890
Warehouse C,18,450
```

---

## ⚙️ Configuration Options

### Change Telegram Bot
1. Update `.env`:
   ```env
   NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=YourNewBot
   ```
2. Frontend automatically uses new bot URL

### Change API URL
1. Update `.env`:
   ```env
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```
2. All API calls use this URL

### Adjust Dashboard Settings
1. Edit `src/lib/constants.ts`:
   ```tsx
   DASHBOARD: {
     ITEMS_PER_PAGE: 50,        // Change pagination
     REFRESH_INTERVAL: 10000,   // Change refresh time
   }
   ```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Bot link not working | Check `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` in `.env.local` |
| Export not working | Make sure items array is not empty |
| Search not filtering | Ensure workspace names match search term |
| Stats not updating | Reload page or check data fetch |

---

## 📚 File Reference

| File | Purpose |
|------|---------|
| `lib/constants.ts` | Frontend configuration |
| `config/constants.js` | Backend configuration |
| `lib/export.tsx` | CSV export utilities |
| `components/dashboard/DashboardComponents.tsx` | Reusable UI components |
| `.env.local` | Environment variables |

---

## 🎯 Common Tasks

### Add New Statistic Card
```tsx
<StatsCard
  title="Your Title"
  value={yourValue}
  icon={<YourIcon className="h-5 w-5" />}
  color="blue"
/>
```

### Add New Feature Flag
```tsx
// In constants.ts
export const FEATURES = {
  ENABLE_NEW_FEATURE: process.env.NEXT_PUBLIC_FEATURE_FLAG === 'true',
};

// Usage
if (FEATURES.ENABLE_NEW_FEATURE) { ... }
```

### Export Different Data
```tsx
const { exportToCSV } = useExportToCSV();

exportToCSV({
  items: customData,
  filename: 'custom-export'
});
```

---

## ✅ Checklist for Deployment

- [ ] Update `.env.local` with production URLs
- [ ] Update `.env` (backend) with production tokens
- [ ] Run `pnpm build` (frontend)
- [ ] Run `npm run dev` (backend)
- [ ] Test all features
- [ ] Verify exports work
- [ ] Test search functionality
- [ ] Check recent activities feed
- [ ] Validate bot link

---

**Last Updated:** April 18, 2026  
**Version:** 1.0.0
