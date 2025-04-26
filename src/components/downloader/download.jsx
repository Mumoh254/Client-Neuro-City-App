import { useEffect, useState } from 'react';

import { getUserNameFromToken } from '../handler/tokenDecoder';

const Download = () => {
  const [username, setUserName] = useState('');


  
  useEffect(() => {
    const userData = getUserNameFromToken();
    if (userData) {
      console.log(userData);
  
      setUserName(userData.name);

    }
  }, []);

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {

      e.preventDefault();
      console.log('📦 beforeinstallprompt event captured');
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {

      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {


    
    if (deferredPrompt) {
      try {
  
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
          console.log('✅ App installed successfully');
          setIsInstalled(true);
          trackInstall();
        } else {
          console.log('❌ App installation dismissed');
        }
      } catch (error) {
        console.error('Installation error:', error);
      } finally {
        setDeferredPrompt(null); 
      }
    } else {
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      const isEdge = /Edg/.test(navigator.userAgent);

      if (window.matchMedia('(display-mode: standalone)').matches) {
        alert('App is already installed!');
      } else if (isChrome || isEdge) {
        alert('Installation not available yet — try refreshing or check the install prompt.');
      } else {
        alert('Installation is only supported on Chrome or Edge browsers.');
      }
    }
  };

  const trackInstall = async () => {

    const BASE_URL = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke"; 

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

      {/* Custom Install Button */}
      <button
        className="install-button"
        onClick={handleInstall}
        disabled={!deferredPrompt || isInstalled}
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
