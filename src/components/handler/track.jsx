// utils/tracking.js
export const trackPageView = (path) => {
    const payload = {
      path,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      // Add any additional tracking data you need
    };
  
    // Send to your backend
    fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  };
  
  // Add this to your root component or App.js
  export const setupTracking = (history) => {
    history.listen((location) => {
      trackPageView(location.pathname);
    });
  };