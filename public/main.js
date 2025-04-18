let deferredPrompt;
const installButton = document.getElementById('installBtn');

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome's mini-infobar
  e.preventDefault();
  deferredPrompt = e;

  // Show your custom install button
  installButton.style.display = 'block';

  installButton.addEventListener('click', async () => {
    // Show the prompt
    deferredPrompt.prompt();

    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // Reset the deferred prompt
    deferredPrompt = null;

    // Hide the button again
    installButton.style.display = 'none';
  });
});
