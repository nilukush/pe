const { app, BrowserWindow, ipcMain } = require('electron');
const axios = require('axios');

function createWindow() {
  // Create the browser window
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true, // Enable Node.js integration in the renderer process
      contextIsolation: false, // Disable context isolation for accessing Electron APIs from the renderer process
    },
  });

  // Load the index.html file
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle the authenticate event from the renderer process
ipcMain.handle('authenticate', async (event) => {
  try {
    // Make an API request to authenticate the user
    const response = await axios.post('http://127.0.0.1:8080/authenticate');
    // Handle the response from the API as needed
    console.log(response.data);
  } catch (error) {
    // Handle any errors that occur during the API request
    console.error(error);
  }
});
