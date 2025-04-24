import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {getUserNameFromToken }  from '../handler/tokenDecoder';

const BASE_URL = 'https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke';

const Download = () => {
  const [username, setUserName] = useState('');
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);
   
  useEffect(() => {
    const userName = getUserNameFromToken();

    setUserName(userName.name);
    
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const trackInstall = async () => {
    try {
      const response = await fetch(`${BASE_URL}/track-install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error('Tracking failed');
      
      const data = await response.json();
      console.log('✅ Install tracked:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to track install:', error);
      throw error;
    }
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      setDeferredPrompt(null);
      setShowButton(false);

      if (outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
        await trackInstall();
      } else {
        console.log('🚫 User dismissed the install prompt');
      }
    } catch (error) {
      console.error('❌ Installation error:', error);
    } finally {
      navigate('/downloads');
    }
  };

  return (
    <div className="download-container text-center mt-5 p-4">
      <h1 className="mb-4 text-3xl font-bold text-gray-800">
        <span>
          {`Hello ${username}, Welcome to City Neuro App`}
        </span>
      </h1>
      
      <p className="text-gray-600 mb-6">
        Enhance your city experience with our neuro-enhanced features
      </p>

      {showButton && (
        <button
          className="install-button bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          onClick={handleInstall}
        >
          Download App
        </button>
      )}

      {!deferredPrompt && (
        <p className="text-gray-500 mt-4">
          The app is already installed on your device. Happy exploring!
        </p>
      )}
    </div>
  );
};

export default Download;
