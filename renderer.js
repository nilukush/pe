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
// Receive the request token from the main process
on('requestToken', async (event, requestToken) => {
  try {
    // Handle the request token received from the main process
    console.log('Received request token:', requestToken);

    // Call the save-access-token API
    const response = await invoke('saveAccessToken', requestToken);

    // Check the response for success
    if (response.success) {
      // Access token saved successfully
      console.log('Access token saved successfully.');
    } else {
      // Handle the error when saving the access token
      console.error('Failed to save access token:', response.error);
    }

    // Save the response to permanent storage (e.g., file system, database, etc.)
    saveResponseToStorage(response);
  } catch (error) {
    console.error(error);
  }
});

function saveResponseToStorage(response) {
  try {
    // Send the response to the main process to save it to storage
    send('saveResponseToStorage', response);
    console.log('Response sent to the main process for saving:', response);
  } catch (error) {
    console.error('Error sending response to the main process:', error);
  }
}