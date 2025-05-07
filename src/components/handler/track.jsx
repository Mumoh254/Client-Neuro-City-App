
export const trackPageView = (path) => {
    const payload = {
      path,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
  
    };
  
 
    fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  };

  export const setupTracking = (history) => {
    history.listen((location) => {
      trackPageView(location.pathname);
    });
  };