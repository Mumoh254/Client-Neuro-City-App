import React, { useState, useEffect } from 'react';
import { Button, Form, ListGroup, Spinner, Alert, Badge } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaAmbulance, FaPhoneAlt, FaMapMarkerAlt, FaShieldAlt } from 'react-icons/fa';
import styled from 'styled-components';

const TOMTOM_API_KEY = 'DlEzVnQ82dvbAocIfiwPCTBNZDAWKCKk';

// Custom Map Markers
const createIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const icons = {
  hospital: createIcon('red'),
  police: createIcon('green'),
  user: createIcon('blue')
};

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
`;

const HeaderSection = styled.div`
  background: linear-gradient(135deg, #2c3e50, #3498db);
  color: white;
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
`;

const SearchSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
`;

const MapContainerWrapper = styled.div`
  height: 60vh;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
`;

const ResultsSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const EmergencyButton = styled(Button)`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-2px);
  }
`;

const UpdateMapView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center]);
  return null;
};

const EmergencyServices = () => {
  const [location, setLocation] = useState('');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([-1.286389, 36.817223]); // Nairobi coordinates

  const getCurrentLocation = () => {
    setError('');
    setLoading(true);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(newLocation);
        setMapCenter([newLocation.lat, newLocation.lng]);
        setLoading(false);
      },
      (err) => {
        setError(`Unable to retrieve your location: ${err.message}`);
        setLoading(false);
      },
      { timeout: 10000, maximumAge: 600000 }
    );
  };

  const handleManualLocationSearch = async () => {
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(location)}.json?key=${TOMTOM_API_KEY}`
      );
      const data = await response.json();

      if (data.results?.length > 0) {
        const firstResult = data.results[0];
        const newLocation = {
          lat: firstResult.position.lat,
          lng: firstResult.position.lon
        };
        setUserLocation(newLocation);
        setMapCenter([newLocation.lat, newLocation.lng]);
      } else {
        setError('Location not found - try a different search term');
      }
    } catch (err) {
      setError('Failed to search location - check your connection');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmergencyPlaces = async () => {
    if (!userLocation) return;
    setLoading(true);
    
    try {
      const fetchPlaces = async (categorySet, type) => {
        const response = await fetch(
          `https://api.tomtom.com/search/2/nearbySearch/.json?lat=${userLocation.lat}&lon=${userLocation.lng}&radius=20000&categorySet=${categorySet}&key=${TOMTOM_API_KEY}`
        );
        const data = await response.json();
        return data.results?.map(item => ({
          id: item.id,
          name: item.poi?.name || `${type} Facility`,
          type,
          address: item.address?.freeformAddress || 'Address not available',
          phone: item.poi?.phone || null,
          distance: item.distance ? Math.round(item.distance / 1000) : 'N/A',
          position: {
            lat: item.position.lat,
            lng: item.position.lon
          }
        })) || [];
      };

      const [hospitals, policeStations] = await Promise.all([
        fetchPlaces(7321, 'Hospital'),
        fetchPlaces(7376, 'Police Station')
      ]);

      setPlaces([...hospitals, ...policeStations]);
    } catch (err) {
      setError('Failed to fetch emergency services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation) {
      fetchEmergencyPlaces();
    }
  }, [userLocation]);

  return (
    <Container>
      <HeaderSection>
        <h2 className="mb-4"><FaAmbulance /> Nairobi Emergency Services</h2>
        <div className="d-flex gap-3 justify-content-center">
          <EmergencyButton 
            variant="light" 
            onClick={getCurrentLocation}
          >
            <FaMapMarkerAlt className="me-2" />
            Use My Location
          </EmergencyButton>
          <EmergencyButton 
            variant="light" 
            href="tel:999"
          >
            <FaPhoneAlt className="me-2" />
            Emergency Call (999)
          </EmergencyButton>
        </div>
      </HeaderSection>

      <SearchSection>
        <Form.Group>
          <div className="d-flex gap-2">
            <Form.Control
              type="text"
              placeholder="🔍 Enter area (e.g., Thika, Westlands)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <EmergencyButton 
              variant="primary" 
              onClick={handleManualLocationSearch}
            >
              Search Area
            </EmergencyButton>
          </div>
        </Form.Group>
      </SearchSection>

      {error && (
        <Alert variant="danger" className="text-center">
          {error.includes('retrieve') ? (
            <>
              <strong>Location Error:</strong> {error}<br />
              Please enable location permissions or try manual search
            </>
          ) : error}
        </Alert>
      )}

      <MapContainerWrapper>
        <MapContainer center={mapCenter} zoom={13}>
          <TileLayer
            attribution='&copy; <a href="https://www.tomtom.com">TomTom</a>'
            url={`https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${TOMTOM_API_KEY}`}
          />
          <UpdateMapView center={mapCenter} />
          
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={icons.user}>
              <Popup>
                <strong>Your Location</strong><br />
                {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
              </Popup>
            </Marker>
          )}

          {places.map(place => (
            <Marker
              key={place.id}
              position={[place.position.lat, place.position.lng]}
              icon={place.type === 'Hospital' ? icons.hospital : icons.police}
            >
              <Popup>
                <div className="popup-content">
                  <h6>{place.name}</h6>
                  <p className="text-muted mb-1">{place.address}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <Badge bg={place.type === 'Hospital' ? 'danger' : 'success'}>
                      {place.distance} km
                    </Badge>
                    {place.phone && (
                      <Button 
                        variant="link" 
                        href={`tel:${place.phone}`}
                        className="p-0 text-decoration-none"
                      >
                        <FaPhoneAlt className="me-1" />
                        {place.phone}
                      </Button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </MapContainerWrapper>

      {places.length > 0 && (
        <ResultsSection>
          <h4 className="mb-4">
            <FaMapMarkerAlt className="me-2" />
            Nearby Services ({places.length})
          </h4>
          <ListGroup>
            {places.map(place => (
              <ListGroup.Item key={place.id} className="py-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="mb-1">
                      {place.type === 'Hospital' ? 
                        <><FaAmbulance /><span className="ms-2">{place.name}</span></> : 
                        <><FaShieldAlt /><span className="ms-2">{place.name}</span></>
                      }
                    </h5>
                    <p className="text-muted small mb-0">{place.address}</p>
                    {place.phone && (
                      <div className="mt-2">
                        <EmergencyButton 
                          variant="outline-danger" 
                          size="sm" 
                          href={`tel:${place.phone}`}
                        >
                          <FaPhoneAlt className="me-1" /> Call {place.phone}
                        </EmergencyButton>
                      </div>
                    )}
                  </div>
                  <Badge 
                    bg={place.type === 'Hospital' ? 'danger' : 'success'} 
                    className="ms-3"
                  >
                    {place.distance} km
                  </Badge>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </ResultsSection>
      )}

      {loading && (
        <div className="text-center py-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Locating nearby services...</p>
        </div>
      )}
    </Container>
  );
};

export default EmergencyServices;