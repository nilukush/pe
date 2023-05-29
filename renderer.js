// renderer.js
document.addEventListener('DOMContentLoaded', () => {
  const { invoke, on, send, shell, remote } = window.electronIPC;

  // Add event listener for the button click
  const authenticateButton = document.getElementById('authenticateButton');
  if (authenticateButton) {
    authenticateButton.addEventListener('click', async () => {
      try {
        // Show the loader
        showLoader();

        // Call the authenticate API
        await invoke('authenticate');

        // Hide the loader
        hideLoader();
      } catch (error) {
        console.error(error);
      }
    });
  }

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

        // Save the response to permanent storage (e.g., file system, database, etc.)
        saveResponseToStorage(response);

        // Redirect to home_page.html
        window.location.href = 'home_page.html';
        // Remove the loader element from the DOM
        loader.remove();
      } else {
        // Handle the error when saving the access token
        console.error('Failed to save access token:', response.error);
      }
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

  const accountIcon = document.querySelector('#account-icon');
  const menu = document.querySelector('#menu');
  const logoutLink = document.querySelector('#logout-link');

  // Show/hide the menu when account icon is clicked
  if (accountIcon) {
    accountIcon.addEventListener('click', () => {
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });
  }

  // Handle logout link click
  if (logoutLink) {
    logoutLink.addEventListener('click', () => {
      send('deleteResponseFile');
    });
  }

  // Listen for the response from the main process after deleting the file
  on('responseFileDeleted', () => {
    window.location.href = 'index.html';
  });

  // Create a loader element
  const loader = document.createElement('div');
  loader.classList.add('loader'); // Add a CSS class for styling
  const spinner = document.createElement('div');
  spinner.classList.add('spinner'); // Add a CSS class for the spinner animation
  loader.appendChild(spinner);
  document.body.appendChild(loader);

  // Function to show the loader
  function showLoader() {
    // Position the loader at the center of the button
    const buttonRect = authenticateButton.getBoundingClientRect();
    const loaderSize = 50; // Adjust the loader size as needed
    const loaderTop = buttonRect.top + buttonRect.height / 2 - loaderSize / 2;
    const loaderLeft = buttonRect.left + buttonRect.width / 2 - loaderSize / 2;
    loader.style.top = `${loaderTop}px`;
    loader.style.left = `${loaderLeft}px`;

    // Show the loader
    loader.style.display = 'block';
  }

  // Function to hide the loader
  function hideLoader() {
    loader.style.display = 'none';
  }
});
