const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// Remove these global variables - they're handled in the class
// let AutoLaunch;
// let autoLauncherInstance;
// let mainWindow;

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
            // Use dynamic import to avoid issues if module fails
            const AutoLaunch = require('auto-launch');
            this.appLauncher = new AutoLaunch({
                name: 'Pediatric Drug Calculator',
                path: app.getPath('exe'),
                isHidden: false
            });
            console.log('Auto-launch initialized successfully');
        } catch (error) {
            console.error('Auto-launch initialization failed:', error.message);
            this.appLauncher = null;
        }
    }

    createWindow() {
        // Create the browser window - REMOVED FULLSCREEN for better usability
        this.mainWindow = new BrowserWindow({
            width: 1400,
            height: 900,
            minWidth: 1000,
            minHeight: 700,
            fullscreen: false, // Changed from true to false for better usability
            frame: false, // Remove default window frame
            resizable: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true
            },
            icon: this.getIconPath(),
            title: 'Pediatric Drug Calculator - Emergency Drug Dosing',
            show: false, // Don't show until ready-to-show
            backgroundColor: '#2c3e50',
            titleBarStyle: 'hidden',
        });

        // Load the app
        this.mainWindow.loadFile('index.html');

        // Remove menu completely for kiosk mode
        this.mainWindow.setMenuBarVisibility(false);
        this.mainWindow.autoHideMenuBar = true;

        // Show window when ready to prevent visual flash
        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow.show();
            this.mainWindow.focus();
        });

        // Prevent window from being closed
        this.mainWindow.on('close', (event) => {
            if (!this.isQuitting) {
                event.preventDefault();
                this.minimizeToTray();
            }
        });

        // Handle window closed
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });

        // Handle window focus
        this.mainWindow.on('focus', () => {
            this.mainWindow.webContents.send('window-focused');
        });

        // Handle window blur
        this.mainWindow.on('blur', () => {
            this.mainWindow.webContents.send('window-blurred');
        });

        // Open DevTools in development
        if (process.env.NODE_ENV === 'development') {
            this.mainWindow.webContents.openDevTools();
        }

        // Setup auto-launch
        this.setupAutoLaunch();

        // Handle external links
        this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
            shell.openExternal(url);
            return { action: 'deny' };
        });
    }

    getIconPath() {
        try {
            // Try different possible icon locations
            const iconPaths = [
                path.join(__dirname, 'assets', 'icon.png'),
                path.join(__dirname, 'assets', 'icon.ico'),
                path.join(__dirname, 'icon.png'),
                path.join(__dirname, 'icon.ico'),
                path.join(process.resourcesPath, 'assets', 'icon.png'),
                path.join(process.resourcesPath, 'assets', 'icon.ico'),
            ];

            for (const iconPath of iconPaths) {
                if (fs.existsSync(iconPath)) {
                    return iconPath;
                }
            }
        } catch (error) {
            console.warn('Could not find app icon:', error.message);
        }
        return undefined; // Use default Electron icon
    }

    minimizeToTray() {
        if (this.mainWindow) {
            if (process.platform === 'darwin') {
                // On macOS, hide the window instead of minimizing
                this.mainWindow.hide();
            } else {
                this.mainWindow.minimize();
            }
        }
    }

    async setupAutoLaunch() {
        try {
            // Only enable auto-launch in production and if appLauncher is available
            if (process.env.NODE_ENV !== 'development' && this.appLauncher) {
                const isEnabled = await this.appLauncher.isEnabled();
                if (!isEnabled) {
                    await this.appLauncher.enable();
                    console.log('Auto-start enabled successfully');
                } else {
                    console.log('Auto-start is already enabled');
                }
            } else if (!this.appLauncher) {
                console.warn('Auto-launch not available - running in development mode or module failed to load');
            }
        } catch (error) {
            console.error('Auto-start setup failed:', error.message);
            // Don't show error dialog for auto-start failures as they're not critical
        }
    }

    async enableAutoLaunch() {
        try {
            if (this.appLauncher) {
                await this.appLauncher.enable();
                console.log('Auto-start enabled');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to enable auto-start:', error);
            return false;
        }
    }

    async disableAutoLaunch() {
        try {
            if (this.appLauncher) {
                await this.appLauncher.disable();
                console.log('Auto-start disabled');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to disable auto-start:', error);
            return false;
        }
    }

    async getAutoLaunchStatus() {
        try {
            if (this.appLauncher) {
                return await this.appLauncher.isEnabled();
            }
            return false;
        } catch (error) {
            console.error('Failed to get auto-start status:', error);
            return false;
        }
    }

    toggleFullscreen() {
        if (this.mainWindow) {
            const isFullscreen = this.mainWindow.isFullScreen();
            this.mainWindow.setFullScreen(!isFullscreen);
            
            // Send event to renderer
            this.mainWindow.webContents.send('fullscreen-changed', !isFullscreen);
        }
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

        return choice === 1; // Return true if user chose "Exit Anyway"
    }

    exitApp() {
        this.isQuitting = true;
        
        // Save any pending data or state here if needed
        this.saveApplicationState();
        
        app.quit();
    }

    saveApplicationState() {
        // Save current application state to a file if needed
        try {
            const state = {
                lastUsed: new Date().toISOString(),
                version: app.getVersion()
            };
            
            const statePath = path.join(app.getPath('userData'), 'app-state.json');
            fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
        } catch (error) {
            console.warn('Could not save application state:', error.message);
        }
    }

    restoreWindow() {
        if (this.mainWindow) {
            if (this.mainWindow.isMinimized()) {
                this.mainWindow.restore();
            }
            this.mainWindow.show();
            this.mainWindow.focus();
            
            // Bring to front
            this.mainWindow.setAlwaysOnTop(true);
            setTimeout(() => {
                this.mainWindow.setAlwaysOnTop(false);
            }, 100);
        }
    }

    // Add this missing method
    setAlwaysOnTop(alwaysOnTop) {
        if (this.mainWindow) {
            this.mainWindow.setAlwaysOnTop(alwaysOnTop);
        }
    }
}

// Create instance
const appWindow = new AppWindow();

// App event handlers
app.whenReady().then(() => {
    appWindow.createWindow();
    
    // IPC handlers for window control
    ipcMain.handle('minimize-window', () => {
        appWindow.minimizeToTray();
    });

    ipcMain.handle('toggle-fullscreen', () => {
        appWindow.toggleFullscreen();
    });

    ipcMain.handle('exit-app', () => {
        if (appWindow.showExitConfirmation()) {
            appWindow.exitApp();
            return true;
        }
        return false;
    });

    // Auto-launch management IPC handlers
    ipcMain.handle('enable-auto-launch', async () => {
        return await appWindow.enableAutoLaunch();
    });

    ipcMain.handle('disable-auto-launch', async () => {
        return await appWindow.disableAutoLaunch();
    });

    ipcMain.handle('get-auto-launch-status', async () => {
        return await appWindow.getAutoLaunchStatus();
    });

    ipcMain.handle('set-auto-launch', async (event, enabled) => {
        if (enabled) {
            return await appWindow.enableAutoLaunch();
        } else {
            return await appWindow.disableAutoLaunch();
        }
    });

    // Add missing IPC handler for always-on-top
    ipcMain.handle('set-always-on-top', async (event, enabled) => {
        appWindow.setAlwaysOnTop(enabled);
        return true;
    });

}).catch(console.error);

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    // Another instance is already running, focus it and quit
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, focus our window instead
        appWindow.restoreWindow();
        
        // Handle deep linking or command line arguments if needed
        if (commandLine.length > 1) {
            // Process command line arguments
            console.log('Command line arguments:', commandLine);
        }
    });
}

app.on('window-all-closed', (event) => {
    // Don't prevent default - let the app decide whether to quit
    // On macOS, keep app running even when all windows are closed
    if (process.platform !== 'darwin') {
        // For Windows/Linux, minimize to tray instead of quitting
        if (appWindow.mainWindow) {
            appWindow.minimizeToTray();
        }
    }
});

app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
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

app.on('will-quit', (event) => {
    // Perform any final cleanup here
    console.log('Application is quitting...');
});

app.on('web-contents-created', (event, contents) => {
    // Prevent navigation to external websites
    contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        
        if (parsedUrl.origin !== 'file://') {
            event.preventDefault();
            shell.openExternal(navigationUrl);
        }
    });
});

// Handle protocol for deep linking (optional)
app.setAsDefaultProtocolClient('pediatric-calculator');

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        shell.openExternal(navigationUrl);
    });
});

// Enable this for production to ignore certificate errors (if needed)
// app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
//     event.preventDefault();
//     callback(true);
// });

console.log('Pediatric Drug Calculator started successfully');