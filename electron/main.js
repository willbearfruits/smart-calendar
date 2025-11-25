const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');

let mainWindow;
let backendProcess;
let frontendServer;
const isDev = process.env.NODE_ENV === 'development';
const BACKEND_PORT = 3001;
const FRONTEND_PORT = 3000;

// Start frontend server (for production mode)
function startFrontendServer() {
  if (isDev) return Promise.resolve(); // Skip in dev mode

  console.log('Starting frontend server...');

  return new Promise((resolve, reject) => {
    const distPath = path.join(__dirname, '../dist');

    frontendServer = http.createServer((req, res) => {
      let filePath = path.join(distPath, req.url === '/' ? 'index.html' : req.url);

      // Security: prevent directory traversal
      if (!filePath.startsWith(distPath)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      // If file doesn't exist, serve index.html (for SPA routing)
      if (!fs.existsSync(filePath)) {
        filePath = path.join(distPath, 'index.html');
      }

      const ext = path.extname(filePath);
      const contentTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
      };

      const contentType = contentTypes[ext] || 'text/plain';

      fs.readFile(filePath, (error, content) => {
        if (error) {
          res.writeHead(500);
          res.end('Error loading file: ' + error.code);
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content, 'utf-8');
        }
      });
    });

    frontendServer.listen(FRONTEND_PORT, 'localhost', () => {
      console.log(`Frontend server running at http://localhost:${FRONTEND_PORT}`);
      resolve();
    });

    frontendServer.on('error', (error) => {
      console.error('Failed to start frontend server:', error);
      reject(error);
    });
  });
}

// Start backend server
function startBackendServer() {
  console.log('Starting backend server...');

  const serverPath = isDev
    ? path.join(__dirname, '../server/src/index.ts')
    : path.join(process.resourcesPath, 'server', 'dist', 'index.js');

  const nodeArgs = isDev
    ? ['--loader', 'ts-node/esm', serverPath]
    : [serverPath];

  backendProcess = spawn('node', nodeArgs, {
    env: {
      ...process.env,
      PORT: BACKEND_PORT,
      NODE_ENV: isDev ? 'development' : 'production',
      CORS_ORIGIN: `http://localhost:${FRONTEND_PORT}`
    },
    stdio: 'inherit'
  });

  backendProcess.on('error', (error) => {
    console.error('Failed to start backend server:', error);
    dialog.showErrorBox(
      'Backend Error',
      'Failed to start the backend server. Please ensure all dependencies are installed.'
    );
  });

  backendProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`Backend server exited with code ${code}`);
    }
  });

  // Give server time to start
  return new Promise((resolve) => setTimeout(resolve, 2000));
}

// Create main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: 'Smart Calendar - AI Calendar & Task Manager',
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    backgroundColor: '#f8fafc',
    show: false
  });

  // Load the app (always use HTTP server)
  const startURL = `http://localhost:${FRONTEND_PORT}`;

  mainWindow.loadURL(startURL);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

// App lifecycle
app.whenReady().then(async () => {
  try {
    await startFrontendServer();
    await startBackendServer();
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    dialog.showErrorBox(
      'Startup Error',
      'Failed to start Smart Calendar. Please check the logs and try again.'
    );
    app.quit();
  }
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Clean up on quit
app.on('before-quit', () => {
  if (frontendServer) {
    console.log('Stopping frontend server...');
    frontendServer.close();
  }
  if (backendProcess) {
    console.log('Stopping backend server...');
    backendProcess.kill();
  }
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  dialog.showErrorBox('Application Error', error.message);
});
