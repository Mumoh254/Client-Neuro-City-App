import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const TrackPageView = () => {
  const location = useLocation();
  const startTimeRef = useRef(Date.now());
  const previousPageRef = useRef(location.pathname);

  useEffect(() => {
    const currentTime = Date.now();
    const timeSpent = Math.round((currentTime - startTimeRef.current) / 1000); // in seconds


    if (previousPageRef.current !== location.pathname) {
      const pageData = {
        from: previousPageRef.current,
        to: location.pathname,
        duration: timeSpent,
        timestamp: new Date().toISOString(),
      };

      console.log("Tracked Page:", pageData);


      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pageData),
      });

   
      previousPageRef.current = location.pathname;
      startTimeRef.current = currentTime;
    }


    if (previousPageRef.current === location.pathname) {
      startTimeRef.current = currentTime;
    }
  }, [location]);

  return null;
};

export default TrackPageView;
