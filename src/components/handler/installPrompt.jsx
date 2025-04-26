import { useEffect, useState } from 'react';
import { Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const InstallPrompt = () => {
  
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [alreadyInstalled, setAlreadyInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed in standalone mode or via localStorage flag
    if (
      window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone || 
      localStorage.getItem('installed') === 'true' || 
      localStorage.getItem('installPrompted') === 'true'
    ) {
      setAlreadyInstalled(true);  // Skip showing prompt if already installed
      return;
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();  // Prevent default prompt
      setDeferredPrompt(e);
      setShowInstall(true);  // Show install button only when prompt is available
    };

    const handleAppInstalled = () => {
      localStorage.setItem('installed', 'true');
      setAlreadyInstalled(true);
      trackInstallation();
    };

    // Listen to events when the install prompt is triggered and when app is installed
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Track the installation and send the event to backend
  const trackInstallation = async () => {
    try {
      if (!localStorage.getItem('installTracked')) {
        await axios.post('/api/track-install');  // Send install info to backend
        localStorage.setItem('installTracked', 'true');
      }
    } catch (error) {
      console.error('Install tracking failed:', error);
    }
  };

  // Handle user clicking 'Install Now'
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();  // Show the native install prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      localStorage.setItem('installPrompted', 'true');  // Mark the prompt as shown
      setShowInstall(false);  // Hide the install prompt
      await trackInstallation();  // Track the installation
    }
  };

  // If the app is already installed or the prompt shouldn't show, return null
  if (alreadyInstalled || !showInstall) return null;

  return (
    <div className="install-prompt fixed-bottom m-3">
      <Alert variant="info" className="shadow-lg">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5>Install Our App!</h5>
            <p>For a better experience and offline access</p>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-info" onClick={() => setShowInstall(false)}>
              Later
            </Button>
            <Button variant="primary" onClick={handleInstallClick}>
              Install Now
            </Button>
          </div>
        </div>
      </Alert>
    </div>
  );
};

export default InstallPrompt;
