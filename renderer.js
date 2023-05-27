// renderer.js
const { invoke, on, send } = window.electronIPC;

// Add event listener for the button click
const authenticateButton = document.getElementById('authenticateButton');
authenticateButton.addEventListener('click', async () => {
  try {
    await invoke('authenticate');
  } catch (error) {
    console.error(error);
  }
});

// Receive the request token from the main process
on('requestToken', (event, requestToken) => {
  // Handle the request token received from the main process
  console.log('Received request token:', requestToken);
  // TODO: Process the request token and perform necessary actions
});