const { app, BrowserWindow, ipcMain } = require('electron');
const axios = require('axios');
const http = require('http');
const path = require('path');
const fs = require('fs');

let redirectUriWindow;
let savedRequestToken;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile('index.html');

  redirectUriWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const server = http.createServer((req, res) => {
    const redirectUriFilePath = path.join(__dirname, 'redirect_uri.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync(redirectUriFilePath, 'utf-8'));
  });

  redirectUriWindow.webContents.on('did-navigate', (event, url) => {
    if (url.startsWith('http://localhost:8081/redirect_uri.html')) {
      redirectUriWindow.webContents.send('requestToken', savedRequestToken);
      redirectUriWindow.close();
    }
  });

  server.listen(8081, 'localhost');

  // Handle the authenticate event from the renderer process
  ipcMain.handle('authenticate', async (event) => {
    try {
      const redirectUri = `http://localhost:8081/redirect_uri.html`; // Specify the redirect_uri here

      const response = await axios.post('http://127.0.0.1:8080/authenticate', { redirect_uri: redirectUri });
      console.log(response.data);
      const requestToken = response.data.request_token.code;
      savedRequestToken = requestToken;
      const redirectUrl = `http://localhost:8081/redirect_uri.html?request_token=${requestToken}`;
      console.log('Request Token:', requestToken);
      console.log('Redirect URI:', redirectUrl);

      // Create a new BrowserWindow for the authorization URL
      const authWindow = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });
      authWindow.loadURL(`https://getpocket.com/auth/authorize?request_token=${requestToken}&redirect_uri=${redirectUrl}`);

      // Handle the navigation in the authWindow
      authWindow.webContents.on('did-navigate', (event, url) => {
        if (url.startsWith('http://localhost:8081/redirect_uri.html')) {
          const requestToken = url.substring(url.indexOf('=') + 1);
          win.webContents.send('requestToken', requestToken);
          authWindow.close();
        }
      });

      // Show the authWindow when it finishes loading
      authWindow.webContents.on('did-finish-load', () => {
        authWindow.show();
      });
    } catch (error) {
      console.error(error);
    }
  });

  // Handle the saveAccessToken event from the renderer process
  ipcMain.handle('saveAccessToken', async (event, requestToken) => {
    try {
      // Make the save-access-token API call with the requestToken
      const response = await axios.post('http://127.0.0.1:8080/save-access-token', { request_token: requestToken });

      console.log('save-access-token response:', response.data);

      // Return the response to the renderer process
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  });

  ipcMain.on('saveResponseToStorage', (event, response) => {
    try {
      // Implement your code to save the response to permanent storage here
      // For example, you can use the Node.js File System module to write the response to a file
      const filePath = 'response.json';
      fs.writeFileSync(filePath, JSON.stringify(response));
      console.log('Response saved to storage:', response);
    } catch (error) {
      console.error('Error saving response to storage:', error);
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
