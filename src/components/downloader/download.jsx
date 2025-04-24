// Download.jsx
import { useEffect, useState } from 'react';
import { getUserNameFromToken } from '../handler/tokenDecoder';

const Download = () => {
  const [username, setUserName] = useState('');
  const [installable, setInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const userName = getUserNameFromToken();
    setUserName(userName?.name || 'Guest');

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    try {
      const result = await deferredPrompt.prompt();
      if (result.outcome === 'accepted') {
        console.log('PWA installation accepted');
        await trackInstall();
      }
      setInstallable(false);
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  const trackInstall = async () => {
    try {
      const response = await fetch(`${BASE_URL}/track-install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: username }),
      });
      return response.json();
    } catch (error) {
      console.error('Tracking error:', error);
    }
  };

  return (
    <div className="installation-container">
      <h1>Hello {username}, Welcome to City Neuro</h1>
      {installable ? (
        <button 
          onClick={handleInstall}
          className="install-button active"
        >
          Install App
        </button>
      ) : (
        <p className="install-status">
          {window.matchMedia('(display-mode: standalone)').matches 
            ? 'App installed ✅' 
            : 'Install not available'}
        </p>
      )}
    </div>
  );
};

export default Download;