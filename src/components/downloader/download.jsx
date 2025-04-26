import { useEffect, useState } from 'react';
import { getUserNameFromToken } from '../handler/tokenDecoder';

// Use the environment variable for API base URL
const BASE_URL = "process.env.REACT_APP_API_URL";

const Download = () => {
  const [username, setUserName] = useState('Guest');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Retrieve and set user name
    const user = getUserNameFromToken();
    if (user?.name) setUserName(user.name);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('📦 beforeinstallprompt event captured');
    };

    const handleAppInstalled = () => {
      console.log('✅ App was installed');
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);
  
  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('✅ App installed successfully');
          trackInstall();
        } else {
          console.log('❌ App installation dismissed');
        }
      } catch (error) {
        console.error('Installation error:', error);
      }
    } else {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        alert('App is already installed!');
      } else if (navigator.userAgent.includes('Chrome') || navigator.userAgent.includes('Edge')) {
        alert('Installation is available only on Chrome or Edge browsers.');
      } else {
        alert('Installation is not available. Please use Chrome or Edge on desktop, or Android Chrome.');
      }
    }
  };

  const trackInstall = async () => {
    try {
      const response = await fetch(`${BASE_URL}/track-install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: username }),
      });
      if (!response.ok) throw new Error('Tracking failed');
      console.log('✅ Installation tracked');
    } catch (error) {
      console.error('Tracking error:', error);
    }
  };

  return (
    <div className="installation-container">
      <h1>Hello {username}, Welcome to Neuro-City-Apps</h1>
      <button 
        className="install-button"
        onClick={handleInstall}
        disabled={isInstalled}
      >
        {isInstalled ? 'App Installed ✓' : 'Install App Now'}
      </button>

      <div className="developer-section">
        <img src="/images/dev.png" alt="Developer" />
        <h2>Peter Mumo</h2>
        <p>CEO & Founder Welt Tallis</p>
        <p>Developer & Creator of Neuro-City-Apps</p>
        <div className="contact-info">
          <p>📧 peteritumo2030@gmail.com</p>
          <p>📱 +254740045355</p>
        </div>
      </div>

      <div className="company-section">
        <h3>Promoted by Welt Tallis Group</h3>
        <p>We Believe in the Power of Technology to Change Human Life.</p>
      </div>
    </div>
  );
};

export default Download;
