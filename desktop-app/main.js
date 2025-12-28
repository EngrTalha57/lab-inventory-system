const { app, BrowserWindow } = require('electron');
const path = require('path');
const { execFile } = require('child_process');

let mainWindow;
let splash; 
let backendProcess;

function createWindow() {
  const iconPath = path.join(__dirname, 'icon.ico');

  // 1. Create the Splash Screen Window
  splash = new BrowserWindow({
    width: 422, 
    height: 312, 
    transparent: true, 
    frame: false,      
    alwaysOnTop: true, 
    center: true,      
    resizable: false,
    hasShadow: true,
    icon: iconPath 
  });
  
  splash.loadFile(path.join(__dirname, 'splash.png'));

  // 2. Create the Main Application Window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "T&AS Inventory System",
    autoHideMenuBar: true,
    show: false, // Prevents white flash during initial load
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Recursive retry logic to wait for the backend server
  const loadURLWithRetry = () => {
    mainWindow.loadURL('http://127.0.0.1:8000').catch(() => {
      console.log("Backend not ready yet, retrying in 1 second...");
      setTimeout(loadURLWithRetry, 1000); 
    });
  };

  loadURLWithRetry();

  // 3. Transition from Splash to Main Window
  mainWindow.once('ready-to-show', () => {
    // Ensuring the window only shows once content is fully ready
    setTimeout(() => {
      if (splash && !splash.isDestroyed()) {
        splash.destroy(); 
      }
      mainWindow.show(); 
      mainWindow.maximize(); 
    }, 1500); 
  });
}

app.whenReady().then(() => {
  // CORRECTED PRODUCTION PATH LOGIC
  // In production, electron-builder places extraResources in process.resourcesPath
  const backendPath = app.isPackaged 
    ? path.join(process.resourcesPath, 'run_server', 'run_server.exe') 
    : path.join(__dirname, '..', 'backend', 'dist', 'run_server', 'run_server.exe');
  
  console.log("Starting backend at:", backendPath);

  // Start backend process
  backendProcess = execFile(backendPath, {
    windowsHide: true,
    cwd: path.dirname(backendPath) // Ensures relative paths in backend work correctly
  }, (err) => {
    if (err) console.error("Backend Error:", err);
  });
  
  createWindow();
});

app.on('window-all-closed', () => {
  // Robust cleanup of the backend process on exit
  if (backendProcess) {
    const { exec } = require('child_process');
    exec('taskkill /F /IM run_server.exe /T'); 
  }
  app.quit();
});