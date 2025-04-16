import React, { useState, useEffect } from 'react';
import { Button, Form, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaHospital, FaMapMarkerAlt } from 'react-icons/fa';

// Configure Leaflet markers
const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const EmergencyServices = () => {
  const [location, setLocation] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([-1.286389, 36.817223]); // Default to Nairobi

  const emergencyNumbers = {
    fire: '+254722123456',
    police: '+254733123456',
    ambulance: '+254711123456',
    emergency: '999'
  };

  const getCurrentLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setMapCenter([position.coords.latitude, position.coords.longitude]);
        setLoading(false);
      },
      (err) => {
        setError('Unable to retrieve your location');
        setLoading(false);
      }
    );
  };

  const handleManualLocationSearch = async () => {
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(location)}&apiKey=${process.env.REACT_APP_HERE_API_KEY}`
      );
      const data = await response.json();
      
      if (data.items?.length > 0) {
        const newLocation = {
          lat: data.items[0].position.lat,
          lng: data.items[0].position.lng
        };
        setUserLocation(newLocation);
        setMapCenter([newLocation.lat, newLocation.lng]);
      } else {
        setError('Location not found');
      }
    } catch (err) {
      setError('Failed to search location');
    }
    setLoading(false);
  };

  const searchHospitals = async () => {
    if (!userLocation) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://discover.search.hereapi.com/v1/discover?at=${userLocation.lat},${userLocation.lng}&q=hospital&apiKey=${process.env.REACT_APP_HERE_API_KEY}`
      );
      const data = await response.json();
      setHospitals(data.items?.map(item => ({
        ...item,
        distance: item.distance ? Math.round(item.distance / 1000) : 'N/A'
      })) || []);
    } catch (err) {
      setError('Failed to fetch hospitals');
    }
    setLoading(false);
  };

  const UpdateMapView = ({ center }) => {
    const map = useMap();
    map.setView(center, map.getZoom());
    return null;
  };

  useEffect(() => {
    if (userLocation) {
      searchHospitals();
    }
  }, [userLocation]);

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Emergency Services in Nairobi</h2>

      <div className="mb-5 emergency-buttons">
        <h4>Immediate Assistance</h4>
        <div className="d-flex flex-wrap gap-3">
          <Button variant="danger" href={`tel:${emergencyNumbers.fire}`}>
            <FaHospital className="me-2" /> Fire Department
          </Button>
          <Button variant="primary" href={`tel:${emergencyNumbers.police}`}>
            <FaHospital className="me-2" /> Police
          </Button>
          <Button variant="success" href={`tel:${emergencyNumbers.ambulance}`}>
            <FaHospital className="me-2" /> Ambulance
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <h4>Find Nearest Medical Facilities</h4>
        <Form.Group className="mb-3">
          <div className="d-flex gap-2">
            <Form.Control
              type="text"
              placeholder="Enter area or street name"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
            />
            <Button 
              variant="primary" 
              onClick={handleManualLocationSearch}
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search Area'}
            </Button>
            <Button 
              variant="outline-primary" 
              onClick={getCurrentLocation}
              disabled={loading}
            >
              {loading ? 'Locating...' : 'Use My Location'}
            </Button>
          </div>
        </Form.Group>
      </div>

      {error && <Alert variant="danger" className="my-3">{error}</Alert>}

      <div className="map-container mb-4">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '500px', borderRadius: '15px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <UpdateMapView center={mapCenter} />

          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>
                <strong>Your Location</strong>
                <div className="small">
                  {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                </div>
              </Popup>
            </Marker>
          )}

          {hospitals.map((hospital) => (
            <Marker
              key={hospital.id}
              position={[hospital.position.lat, hospital.position.lng]}
              icon={hospitalIcon}
            >
              <Popup>
                <div className="hospital-popup">
                  <h6 className="mb-2">{hospital.title}</h6>
                  <p className="small mb-1">{hospital.address.label}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="badge bg-danger">
                      {hospital.distance} km
                    </span>
                    <Button 
                      variant="link" 
                      href={`tel:${hospital.contacts?.[0]?.phone?.[0]?.value || emergencyNumbers.emergency}`}
                      className="p-0"
                    >
                      Emergency Call
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {hospitals.length > 0 && (
        <div className="hospital-list">
          <h5>Nearest Medical Facilities:</h5>
          <ListGroup>
            {hospitals.map((hospital) => (
              <ListGroup.Item key={hospital.id} className="py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">{hospital.title}</h6>
                    <p className="mb-1 text-muted small">
                      {hospital.address.label}
                    </p>
                    <div className="d-flex gap-2">
                      <span className="badge bg-danger">
                        {hospital.distance} km
                      </span>
                      {hospital.contacts?.[0]?.phone?.[0]?.value && (
                        <span className="badge bg-success">
                          {hospital.contacts[0].phone[0].value}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    href={`tel:${hospital.contacts?.[0]?.phone?.[0]?.value || emergencyNumbers.emergency}`}
                  >
                    Emergency Call
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      )}

      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Searching for emergency services...</p>
        </div>
      )}
    </div>
  );
};

export default EmergencyServices;