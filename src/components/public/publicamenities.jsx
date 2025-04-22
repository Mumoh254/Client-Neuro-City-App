import { useState, useEffect, useRef } from 'react';
import { Alert, Spinner, Button } from 'react-bootstrap';
import { FaMapMarkerAlt, FaRoute } from 'react-icons/fa';

const TOMTOM_API_KEY = 'DlEzVnQ82dvbAocIfiwPCTBNZDAWKCKk';

const PublicAmenities = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [amenities, setAmenities] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mapContainer = useRef(null);

  // Sample amenities data (latitude, longitude)
  const nairobiAmenities = [
    {
      id: 1,
      name: 'CBD Upperhill Public Toilet',
      type: 'Toilet',
      coords: [-1.2921, 36.8219], // [lat, lon]
      hours: '6:00 AM - 10:00 PM',
      fee: 'Ksh 20'
    },
    {
      id: 2,
      name: 'City Market Restrooms',
      type: 'Bathroom',
      coords: [-1.2845, 36.8232],
      hours: '24/7',
      fee: 'Ksh 30'
    }
  ];

  useEffect(() => {
    let map;
    let tt;

    const loadTomTomSDK = () => {
      return new Promise((resolve, reject) => {
        if (window.tt && window.tt.Map) {
          return resolve(window.tt);
        }
    
        const script = document.createElement('script');
        script.src = 'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.23.0/maps/maps-web.min.js';
        script.async = true;
        script.onload = () => {
          const cssLink = document.createElement('link');
          cssLink.rel = 'stylesheet';
          cssLink.href = 'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.23.0/maps/maps.css';
          cssLink.onload = () => resolve(window.tt);
          cssLink.onerror = () => reject('Failed to load TomTom CSS');
          document.head.appendChild(cssLink);
        };
        script.onerror = () => reject('Failed to load TomTom Maps SDK');
        document.head.appendChild(script);
      });
    };
    

    const getLocation = () => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject('Geolocation not supported');
          return;
        }

        navigator.geolocation.getCurrentPosition(
          position => resolve([position.coords.longitude, position.coords.latitude]),
          error => reject(`Geolocation error: ${error.message}`),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
    };

    const initializeMap = async () => {
      try {
        // Load TomTom SDK
        tt = await loadTomTomSDK();
        
        if (!tt) throw new Error('TomTom SDK failed to load');

        // Get user location or fallback to Nairobi center
        let center;
        try {
          center = await getLocation();
        } catch {
          center = [36.8219, -1.2921]; // Nairobi center [lon, lat]
        }

        // Initialize map
        map = new tt.Map({
          key: TOMTOM_API_KEY,
          container: mapContainer.current,
          center: center,
          zoom: 14,
          style: 'tomtom://vector/1/basic-main',
        });
        

        // Add user marker
        new tt.Marker({ color: '#3b82f6' })
          .setLngLat(center)
          .addTo(map);

        // Add amenities
        const amenitiesData = nairobiAmenities.map(a => ({
          ...a,
          coords: [a.coords[1], a.coords[0]] // Convert to [lon, lat]
        }));

        amenitiesData.forEach(amenity => {
          const marker = new tt.Marker({ color: '#10b981' })
            .setLngLat(amenity.coords)
            .addTo(map);

          const popup = new tt.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h6 class="mb-1">${amenity.name}</h6>
                <p class="text-muted small mb-1">${amenity.type}</p>
                <p class="small mb-1">🕒 ${amenity.hours}</p>
                <p class="small mb-2">💵 ${amenity.fee}</p>
                <button class="btn btn-sm btn-primary" 
                  data-lon="${amenity.coords[0]}" 
                  data-lat="${amenity.coords[1]}">
                  <FaRoute /> Get Directions
                </button>
              </div>
            `);

          marker.setPopup(popup);
        });

        setMapInstance(map);
        setAmenities(amenitiesData);
        setUserLocation(center);
        setLoading(false);

      } catch (err) {
        setError(err.message || 'Failed to initialize map');
        setLoading(false);
      }
    };

    initializeMap();

    return () => {
      if (map) map.remove();
    };
  }, []);

  const calculateRoute = async (destination) => {
    if (!mapInstance || !userLocation) return;

    try {
      const response = await fetch(
        `https://api.tomtom.com/routing/1/calculateRoute/${userLocation.join(',')}:${destination.join(',')}/json?` +
        `key=${TOMTOM_API_KEY}&travelMode=pedestrian`
      );

      if (!response.ok) throw new Error('Routing failed');
      
      const data = await response.json();
      const route = data.routes[0];
      
      if (mapInstance.getSource('route')) {
        mapInstance.removeLayer('route');
        mapInstance.removeSource('route');
      }

      mapInstance.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: route.legs[0].points
          }
        },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 4
        }
      });

      setRouteData(route);
    } catch (err) {
      setError('Could not calculate route. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
        <span className="ms-2">Initializing map...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="danger">
          <h4>Map Error</h4>
          <p>{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Nairobi Public Amenities</h2>
        {routeData && (
          <div className="d-flex align-items-center">
            <FaClock className="me-2" />
            {Math.round(routeData.summary.travelTimeInSeconds / 60)} mins
            <Button variant="link" onClick={() => setRouteData(null)}>
              Clear Route
            </Button>
          </div>
        )}
      </div>

      <div 
        ref={mapContainer}
        style={{
          height: '600px',
          width: '100%',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      />

      {/* Add event listener for route buttons */}
      {mapInstance && useEffect(() => {
        const handleRouteClick = (e) => {
          if (e.target.closest('[data-lon]')) {
            const lon = parseFloat(e.target.dataset.lon);
            const lat = parseFloat(e.target.dataset.lat);
            calculateRoute([lon, lat]);
          }
        };

        mapContainer.current.addEventListener('click', handleRouteClick);
        return () => mapContainer.current.removeEventListener('click', handleRouteClick);
      }, [mapInstance])}
    </div>
  );
};

export default PublicAmenities;
