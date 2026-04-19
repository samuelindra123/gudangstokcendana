import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import * as path from 'path';
import { autoUpdater } from 'electron-updater';

const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

// Enable live reload in development
if (isDev) {
  try {
    require('electron-reloader')(module as any, {
      debug: true,
      watchRenderer: false,
    });
  } catch (e) {
    console.log('electron-reloader not available');
  }
}

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  const appPath = app.getAppPath();
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(appPath, 'assets', 'icon.ico').replace('\\', '/'),
    webPreferences: {
      preload: path.join(appPath, 'dist', 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  const startURL = isDev
    ? 'http://localhost:3000'
    : 'https://gudangstokcendana.vercel.app/';

  mainWindow.loadURL(startURL).catch((err) => {
    console.error('Failed to load URL:', err);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Setup auto-updater
  setupAutoUpdater();
};

const setupAutoUpdater = () => {
  try {
    autoUpdater.checkForUpdatesAndNotify().catch(() => {
      // Update check failed, continue anyway
    });

    autoUpdater.on('update-available', () => {
      console.log('Update available');
      mainWindow?.webContents.send('update-available');
    });

    autoUpdater.on('update-downloaded', () => {
      console.log('Update downloaded');
      mainWindow?.webContents.send('update-downloaded');
    });

    autoUpdater.on('error', (err) => {
      console.error('Auto-updater error:', err);
    });
  } catch (err) {
    console.log('Auto-updater not available in dev mode');
  }
};

app.on('ready', () => {
  createWindow();
  createMenu();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

const createMenu = () => {
  const menu = Menu.buildFromTemplate([
    {
      label: 'Berkas',
      submenu: [
        {
          label: 'Keluar',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
      ],
    },
    {
      label: 'Tampilan',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Full Screen', accelerator: 'F11', role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Bantuan',
      submenu: [
        {
          label: 'Tentang',
          click: () => {
            // Show about dialog
          },
        },
      ],
    },
  ]);

  Menu.setApplicationMenu(menu);
};

// IPC handlers for app updates
ipcMain.on('quit-and-install', () => {
  autoUpdater.quitAndInstall();
});

ipcMain.handle('get-version', () => {
  return app.getVersion();
});
