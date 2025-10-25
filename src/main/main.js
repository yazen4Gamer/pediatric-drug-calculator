// main.js
const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

class AppWindow {
    constructor() {
        this.mainWindow = null;
        this.isQuitting = false;
        this.appLauncher = null;

        // Initialize auto-launch safely
        this.initializeAutoLaunch();
    }

    initializeAutoLaunch() {
        try {
            const AutoLaunch = require('electron-auto-launch');
            this.appLauncher = new AutoLaunch({
                name: 'Pediatric Drug Calculator',
                path: app.getPath('exe'),
                isHidden: false,
            });
            console.log('✅ Auto-launch initialized successfully');
        } catch (error) {
            console.error('❌ Auto-launch initialization failed:', error.message);
            this.appLauncher = null;
        }
    }

    createWindow() {
        this.mainWindow = new BrowserWindow({
            fullscreen: app.isPackaged,         // Fullscreen in production only
            frame: false,
            resizable: !app.isPackaged,         // Allow resizing in dev
            minimizable: false,
            maximizable: false,
            movable: false,
            skipTaskbar: false,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                enableRemoteModule: true,
                preload: path.join(__dirname, 'preload.js'),
            },
            icon: this.getIconPath(),
            backgroundColor: '#2c3e50',
            title: 'Pediatric Drug Calculator - Emergency Drug Dosing',
            show: false,
            titleBarStyle: 'hidden',
        });

        // Force fullscreen in production (kiosk)
        if (app.isPackaged) {
            this.mainWindow.on('leave-full-screen', () => {
                this.mainWindow.setFullScreen(true);
            });
            this.mainWindow.on('unmaximize', () => {
                this.mainWindow.setFullScreen(true);
            });
        }

        this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
        this.mainWindow.on('minimize', (event) => event.preventDefault());

        this.mainWindow.setMenuBarVisibility(false);
        this.mainWindow.autoHideMenuBar = true;

        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow.show();
            this.mainWindow.focus();
        });

        this.mainWindow.on('close', (event) => {
            if (!this.isQuitting) {
                event.preventDefault();
                this.minimizeToTray();
            }
        });

        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });

        this.mainWindow.on('focus', () => {
            this.mainWindow.webContents.send('window-focused');
        });

        this.mainWindow.on('blur', () => {
            this.mainWindow.webContents.send('window-blurred');
        });

        // Open DevTools only in development
        if (!app.isPackaged) {
            this.mainWindow.webContents.openDevTools();
        }

        // Enable auto-launch
        this.setupAutoLaunch();

        // Handle external links safely
        this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
            shell.openExternal(url);
            return { action: 'deny' };
        });
    }

    getIconPath() {
        try {
            const iconPaths = [
                path.join(__dirname, 'assets', 'icon.png'),
                path.join(__dirname, 'assets', 'icon.ico'),
                path.join(__dirname, 'icon.png'),
                path.join(__dirname, 'icon.ico'),
                path.join(process.resourcesPath, 'assets', 'icon.png'),
                path.join(process.resourcesPath, 'assets', 'icon.ico'),
            ];
            for (const iconPath of iconPaths) {
                if (fs.existsSync(iconPath)) return iconPath;
            }
        } catch (error) {
            console.warn('⚠️ Could not find app icon:', error.message);
        }
        return undefined;
    }

    minimizeToTray() {
        if (!this.mainWindow) return;
        if (process.platform === 'darwin') this.mainWindow.hide();
        else this.mainWindow.minimize();
    }

    async setupAutoLaunch() {
        try {
            if (process.env.NODE_ENV !== 'development' && this.appLauncher) {
                const isEnabled = await this.appLauncher.isEnabled();
                if (!isEnabled) {
                    await this.appLauncher.enable();
                    console.log('🚀 Auto-start enabled successfully');
                } else {
                    console.log('ℹ️ Auto-start is already enabled');
                }
            } else if (!this.appLauncher) {
                console.warn('⚠️ Auto-launch not available - dev mode or module missing');
            }
        } catch (error) {
            console.error('❌ Auto-start setup failed:', error.message);
        }
    }

    async enableAutoLaunch() {
        try {
            if (this.appLauncher) {
                await this.appLauncher.enable();
                console.log('✅ Auto-start enabled');
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Failed to enable auto-start:', error);
            return false;
        }
    }

    async disableAutoLaunch() {
        try {
            if (this.appLauncher) {
                await this.appLauncher.disable();
                console.log('✅ Auto-start disabled');
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Failed to disable auto-start:', error);
            return false;
        }
    }

    async getAutoLaunchStatus() {
        try {
            if (this.appLauncher) return await this.appLauncher.isEnabled();
            return false;
        } catch (error) {
            console.error('❌ Failed to get auto-start status:', error);
            return false;
        }
    }

    toggleFullscreen() {
        if (!this.mainWindow) return;
        const isFullscreen = this.mainWindow.isFullScreen();
        this.mainWindow.setFullScreen(!isFullscreen);
        this.mainWindow.webContents.send('fullscreen-changed', !isFullscreen);
    }

    showExitConfirmation() {
        if (!this.mainWindow) return false;
        const choice = dialog.showMessageBoxSync(this.mainWindow, {
            type: 'question',
            buttons: ['Cancel', 'Exit Anyway'],
            defaultId: 0,
            cancelId: 0,
            title: 'Confirm Exit',
            message: 'Exit Pediatric Drug Calculator?',
            detail: 'This application is designed to run continuously for emergency access. Are you sure you want to exit?'
        });
        return choice === 1;
    }

    exitApp() {
        this.isQuitting = true;
        this.saveApplicationState();
        app.quit();
    }

    saveApplicationState() {
        try {
            const state = {
                lastUsed: new Date().toISOString(),
                version: app.getVersion(),
            };
            const statePath = path.join(app.getPath('userData'), 'app-state.json');
            fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
        } catch (error) {
            console.warn('⚠️ Could not save application state:', error.message);
        }
    }

    restoreWindow() {
        if (!this.mainWindow) return;
        if (this.mainWindow.isMinimized()) this.mainWindow.restore();
        this.mainWindow.show();
        this.mainWindow.focus();
        this.mainWindow.setAlwaysOnTop(true);
        setTimeout(() => this.mainWindow.setAlwaysOnTop(false), 100);
    }

    setAlwaysOnTop(alwaysOnTop) {
        if (this.mainWindow) this.mainWindow.setAlwaysOnTop(alwaysOnTop);
    }
}

// -------------------------------------------
// App Lifecycle
// -------------------------------------------
const appWindow = new AppWindow();

app.whenReady().then(() => {
    appWindow.createWindow();

    ipcMain.handle('minimize-window', () => appWindow.minimizeToTray());
    ipcMain.handle('toggle-fullscreen', () => appWindow.toggleFullscreen());
    ipcMain.handle('exit-app', () => {
        if (appWindow.showExitConfirmation()) {
            appWindow.exitApp();
            return true;
        }
        return false;
    });

    // Auto-launch IPC
    ipcMain.handle('enable-auto-launch', () => appWindow.enableAutoLaunch());
    ipcMain.handle('disable-auto-launch', () => appWindow.disableAutoLaunch());
    ipcMain.handle('get-auto-launch-status', () => appWindow.getAutoLaunchStatus());
    ipcMain.handle('set-auto-launch', async (event, enabled) =>
        enabled ? appWindow.enableAutoLaunch() : appWindow.disableAutoLaunch()
    );

    ipcMain.handle('set-always-on-top', (event, enabled) => {
        appWindow.setAlwaysOnTop(enabled);
        return true;
    });
}).catch(console.error);

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine) => {
        appWindow.restoreWindow();
        if (commandLine.length > 1) console.log('Command line arguments:', commandLine);
    });
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin' && appWindow.mainWindow) {
        appWindow.minimizeToTray();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        appWindow.createWindow();
    } else {
        appWindow.restoreWindow();
    }
});

app.on('before-quit', (event) => {
    if (!appWindow.isQuitting) {
        event.preventDefault();
        appWindow.minimizeToTray();
    }
});

app.on('will-quit', () => {
    console.log('🚪 Application is quitting...');
});

app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        if (parsedUrl.origin !== 'file://') {
            event.preventDefault();
            shell.openExternal(navigationUrl);
        }
    });

    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        shell.openExternal(navigationUrl);
    });
});

// Register custom protocol (optional)
app.setAsDefaultProtocolClient('pediatric-calculator');

console.log('✅ Pediatric Drug Calculator started successfully');
