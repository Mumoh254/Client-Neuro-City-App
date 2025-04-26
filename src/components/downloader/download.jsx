import { useEffect, useState } from 'react';
import { getUserNameFromToken } from '../handler/tokenDecoder';

const Download = () => {
  const [username, setUserName] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Get user name from the token (for personalized greeting)
    const userName = getUserNameFromToken();
    setUserName(userName?.name || 'Guest');

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the default behavior to show the install prompt
      e.preventDefault();
      setDeferredPrompt(e); // Save the prompt event to trigger later
    });

    // Cleanup listener when the component is unmounted
    return () => {
      window.removeEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
      });
    };
  }, []);

  const handleInstall = async () => {
    // Ensure deferredPrompt is available
    if (deferredPrompt) {
      // Trigger the install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('✅ App installed successfully');
        trackInstall();
      } else {
        console.log('❌ App installation dismissed');
      }

      // Clear the deferredPrompt after prompt is shown
      setDeferredPrompt(null);
    } else {
      console.log('❗ Installation prompt not available');
    }
  };

  const trackInstall = async () => {
    // Tracking installation (optional)
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

      {/* Always show the install button */}
      <button onClick={handleInstall} className="install-button">
        Install App
      </button>

      {/* Developer Section */}
      <div className="developer-section">
        <img src="/images/dev.png" alt="Developer" />
        <h2>Peter Mumo</h2>
        <p>CEO & Founder Welt Tallis</p>
        <p>Developer & Creator of Neuro-City-Apps</p>
        <p>Contact: peteritumo2030@gmail.com</p>
        <p>Phone: +254740045355</p>
      </div>

      {/* Company Promotion Section */}
      <div className="company-section">
        <h3>Promoted by Welt Tallis Group .</h3>
        <p>We Believe in the Power of Technology to Change  Human Life.</p>
      </div>
    </div>
  );
};

export default Download;
