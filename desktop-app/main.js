const { app, BrowserWindow } = require('electron');
const path = require('path');
const { execFile } = require('child_process');

let mainWindow;
let splash; 
let backendProcess;

function createWindow() {
  // Define the icon path once for re-use
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
    icon: iconPath // Shows icon on taskbar while splash is active
  });
  
  splash.loadFile(path.join(__dirname, 'splash.png'));

  // 2. Create the Main Application Window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "T&AS Inventory System",
    autoHideMenuBar: true,
    show: false, 
    icon: iconPath, // Shows icon on taskbar and window corner
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Attempt to load the server
  mainWindow.loadURL('http://127.0.0.1:8000');

  // Logic to handle backend startup delay
  mainWindow.webContents.on('did-fail-load', () => {
    console.log("Backend not ready, retrying...");
    setTimeout(() => {
      mainWindow.loadURL('http://127.0.0.1:8000');
    }, 1000); 
  });

  // 3. Transition from Splash to Main Window
  mainWindow.once('ready-to-show', () => {
    // Wait 3000ms (3 seconds) before switching windows
    setTimeout(() => {
      if (splash) {
        splash.destroy(); 
      }
      mainWindow.show(); 
      mainWindow.maximize(); 
    }, 1200); 
  });
}

app.whenReady().then(() => {
  // Path to your bundled FastAPI engine
  const backendPath = path.join(__dirname, '..', 'backend', 'dist', 'run_server', 'run_server.exe');
  
  // Start backend process
  backendProcess = execFile(backendPath);
  
  createWindow();
});

app.on('window-all-closed', () => {
  // Clean up backend process on exit
  if (backendProcess) backendProcess.kill();
  app.quit();
});