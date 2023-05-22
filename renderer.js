const { ipcRenderer } = require('electron');

const authenticateButton = document.getElementById('authenticateButton');
authenticateButton.addEventListener('click', async () => {
  await ipcRenderer.invoke('authenticate');
});
