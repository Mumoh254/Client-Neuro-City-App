let deferredPrompt;
const installButton = document.getElementById('installBtn');

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); // Prevent the mini-infobar from appearing
  deferredPrompt = e;

  // Show the custom install button
  installButton.style.display = 'block';

  installButton.addEventListener('click', async () => {
    deferredPrompt.prompt(); // Show the prompt

    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // Reset prompt and hide button
    deferredPrompt = null;
    installButton.style.display = 'none';

    // If accepted, you could trigger install count here if needed
    if (outcome === 'accepted') {
      console.log("User accepted the PWA install prompt");
    }
  });
});

// Listen for the appinstalled event
window.addEventListener('appinstalled', () => {
  console.log("App successfully installed");

  // Send POST request to your server to track the install
  fetch('http://localhost:8000/apiV1/smartcity-ke/track-install', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ installedAt: new Date().toISOString() }) // optional payload
  })
  .then(res => res.json())
  .then(data => console.log("Install tracked:", data))
  .catch(err => console.error("Error tracking install:", err));
});
