import React, { useState, useEffect } from 'react';
// Add Modal to the react-bootstrap imports
import { 
  Container, 
  Row, 
  Col, 
  Form, 
  Button, 
  ListGroup, 
  Card, 
  Spinner, 
  Alert, 
  Badge, 
  Modal  // Add this line
} from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { FiTrash2, FiClock, FiMapPin, FiPlus, FiNavigation, FiCheckCircle, FiAlertTriangle, FiImage } from 'react-icons/fi';
import axios from 'axios';
import styled from 'styled-components';
import Swal from 'sweetalert2';

const API_URL = 'http://localhost:8000/apiV1/smartcity-ke';

// Styled Components
const WasteContainer = styled(Container)`
  background: linear-gradient(to bottom right, #f8fafc, #f1f5f9);
  min-height: 100vh;
  padding: 2rem;
  font-family: 'Segoe UI', system-ui, sans-serif;
`;

const EcoCard = styled(Card)`
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(8px);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const EcoMap = styled(Card)`
  border: none;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 24px rgba(0,0,0,0.1);
  height: 65vh;
`;

const StatusStepper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1.5rem;
  background: #f1f5f9;
  border-radius: 12px;
  margin: 1.5rem 0;

  .step {
    flex: 1;
    text-align: center;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      width: 50%;
      height: 2px;
      background: #cbd5e1;
      top: 20px;
      right: -25%;
    }

    &:last-child::after {
      display: none;
    }

    &.active {
      .icon {
        background: #10b981;
        color: white;
      }
      &::after {
        background: #10b981;
      }
    }

    .icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #cbd5e1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
    }
  }
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;

  .gallery-item {
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.03);
    }

    img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }

    .caption {
      position: absolute;
      bottom: 0;
      background: linear-gradient(transparent, rgba(0,0,0,0.7));
      color: white;
      width: 100%;
      padding: 1rem;
    }
  }
`;

const GarbageManagementSystem = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [dropPoints, setDropPoints] = useState([]);
  const [collectionRequests, setCollectionRequests] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    capacity: 'Medium',
    wasteType: 'General',
    scheduleTime: '',
    location: null
  });
  const [loading, setLoading] = useState(false);
  const [reminders] = useState([
    "🌧️ Rainy season alert! Schedule pickup to prevent waterlogging",
    "♻️ 3 neighbors recycled this week - join them!",
    "📸 Share your clean-up story for community rewards"
  ]);

  // Enhanced location handling
 // In the getLocation function, modify the Swal.fire error handling:
const getLocation = async () => {
  setLoading(true);
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve, 
        reject,
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
    
    setUserLocation({
      lat: position.coords.latitude,
      lng: position.coords.longitude
    });
    Swal.fire({
      icon: 'success',
      title: 'Location Found!',
      text: 'We\'ve located your position for better service',
      timer: 2000
    });
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Location Required',
      html: 'Please enable location services<br>We use this to find nearest eco-points',
      confirmButtonText: 'Try Again',
    }).then((result) => {
      if (result.isConfirmed) {
        getLocation(); // Instead of window.location.reload()
      }
    });
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    getLocation();
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [pointsRes, requestsRes] = await Promise.all([
        axios.get(`${API_URL}/drop-points`),
        axios.get(`${API_URL}/collection-requests`)
      ]);
      setDropPoints(pointsRes.data);
      setCollectionRequests(requestsRes.data);
    } catch (error) {
      Swal.fire('Error', 'Failed to load eco-points data', 'error');
    }
  };

  // Enhanced submission handlers
  const handleCreatePoint = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/drop-points`, {
        ...formData,
        status: 'Active'
      });
      setDropPoints([...dropPoints, res.data]);
      setShowCreateModal(false);
      Swal.fire('🏆 Point Created!', 'New eco-point added to community map', 'success');
    } catch (error) {
      Swal.fire('Error', 'Failed to create eco-point', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCollectionRequest = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/collection-requests`, {
        ...formData,
        userLocation,
        status: 'Scheduled'
      });
      setCollectionRequests([...collectionRequests, res.data]);
      Swal.fire({
        title: '🚛 Pickup Scheduled!',
        html: `<p>We'll arrive on <strong>${new Date(formData.scheduleTime).toLocaleDateString()}</strong></p>
              <small>You'll receive reminders 24hrs before</small>`,
        icon: 'success'
      });
    } catch (error) {
      Swal.fire('Error', 'Failed to schedule pickup', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <WasteContainer fluid>
      {/* Create Point Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>🏭 New Eco-Point</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>📌 Point Name</Form.Label>
              <Form.Control 
                placeholder="E.g. Riverside Recycling Hub"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>📍 Current Location</Form.Label>
              <Button 
                variant={formData.location ? 'success' : 'primary'}
                onClick={() => setFormData({...formData, location: userLocation})}
                className="w-100"
                disabled={!userLocation}
              >
                {formData.location ? (
                  <>
                    <FiCheckCircle /> Location Saved!
                  </>
                ) : (
                  <>
                    <FiMapPin /> {userLocation ? 'Save Current Position' : 'Locating...'}
                  </>
                )}
              </Button>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCreatePoint} disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Create Eco-Point 🌱'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Row className="g-4">
        {/* Left Panel */}
        <Col md={4}>
          <EcoCard className="p-4">
            <div className="d-flex align-items-center gap-3 mb-4">
              <FiTrash2 size={32} className="text-primary" />
              <h3 className="mb-0">eWaste Nairobi</h3>
            </div>

            {/* Smart Reminders */}
            <EcoCard className="mb-4">
              <Card.Body>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <FiAlertTriangle className="text-warning" />
                  <h5 className="mb-0">Smart Reminders</h5>
                </div>
                <ListGroup variant="flush">
                  {reminders.map((reminder, i) => (
                    <ListGroup.Item key={i} className="d-flex gap-2">
                      <div className="text-warning">•</div>
                      {reminder}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </EcoCard>

            {/* Schedule Form */}
            <EcoCard className="mb-4">
              <Card.Body>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <FiClock className="text-primary" />
                  <h5 className="mb-0">Schedule Pickup</h5>
                </div>
                <Form onSubmit={handleCollectionRequest}>
                  <Form.Group className="mb-3">
                    <Form.Label>🗑️ Waste Type</Form.Label>
                    <Form.Select
                      value={formData.wasteType}
                      onChange={(e) => setFormData({...formData, wasteType: e.target.value})}
                    >
                      <option>General Household</option>
                      <option>Electronics</option>
                      <option>Construction Debris</option>
                      <option>Organic Waste</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>⏰ Preferred Time</Form.Label>
                    <Form.Control 
                      type="datetime-local"
                      value={formData.scheduleTime}
                      onChange={(e) => setFormData({...formData, scheduleTime: e.target.value})}
                      required
                    />
                  </Form.Group>

                  <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                    {loading ? <Spinner size="sm" /> : 'Schedule Now 🚛'}
                  </Button>
                </Form>
              </Card.Body>
            </EcoCard>

            {/* Progress Stepper */}
            <StatusStepper>
              <div className="step active">
                <div className="icon"><FiClock /></div>
                Scheduled
              </div>
              <div className="step">
                <div className="icon"><FiNavigation /></div>
                En Route
              </div>
              <div className="step">
                <div className="icon"><FiCheckCircle /></div>
                Completed
              </div>
            </StatusStepper>
          </EcoCard>
        </Col>

        {/* Main Map */}
        <Col md={8}>
          <EcoMap>
            {userLocation ? (
              <MapContainer 
                center={[userLocation.lat, userLocation.lng]} 
                zoom={14} 
                style={{ height: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                
                {/* User Location */}
                <Marker position={[userLocation.lat, userLocation.lng]}>
                  <Popup>
                    <h6>📍 Your Location</h6>
                    <div className="small">
                      {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                    </div>
                  </Popup>
                </Marker>

                {/* Eco-Points */}
                {dropPoints.map(point => (
                  <Marker key={point._id} position={[point.location.lat, point.location.lng]}>
                    <Popup>
                      <div className="text-center">
                        <h6>♻️ {point.name}</h6>
                        <Badge bg="success" className="mb-2">
                          {point.capacity} Capacity
                        </Badge>
                        <Button 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${point.location.lat},${point.location.lng}`}
                          target="_blank"
                          size="sm" 
                          variant="primary"
                          className="w-100"
                        >
                          <FiNavigation className="me-2" />
                          Get Directions
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="text-center p-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">Mapping Eco-Points...</p>
              </div>
            )}
          </EcoMap>

          {/* Community Gallery */}
          <div className="mt-4">
            <h4 className="d-flex align-items-center gap-2">
              <FiImage className="text-success" />
              Community Impact Gallery
            </h4>
            <GalleryGrid>
              {[1,2,3,4].map((item) => (
                <div className="gallery-item" key={item}>
                  <img src={`https://picsum.photos/400/300?random=${item}`} alt="Cleanup" />
                  <div className="caption">
                    <div className="small">Before → After</div>
                    <div className="small">Kibera Community • 2 days ago</div>
                  </div>
                </div>
              ))}
            </GalleryGrid>
          </div>
        </Col>
      </Row>
    </WasteContainer>
  );
};

export default GarbageManagementSystem;