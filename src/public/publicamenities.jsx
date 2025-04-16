import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Spinner, Modal, Accordion } from 'react-bootstrap';
import { FaFilter, FaTrashAlt, FaTrain, FaMapMarkerAlt, FaClock, FaInfoCircle, FaPlus } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Configure leaflet markers
L.Icon.Default.mergeOptions({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const initialAreas = [
  'CBD', 'Westlands', 'Karen', 'Embakasi', 'Kasarani', 'Dagoretti'
];

const PublicAmenities = () => {
  const [amenities, setAmenities] = useState(() => {
    const saved = localStorage.getItem('amenities');
    return saved ? JSON.parse(saved) : [];
  });
  const [areas, setAreas] = useState(initialAreas);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newAmenity, setNewAmenity] = useState({
    name: '',
    type: 'sanitation',
    area: '',
    description: '',
    location: null,
    image: ''
  });
  const [mapCenter, setMapCenter] = useState([-1.286389, 36.817223]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('amenities', JSON.stringify(amenities));
  }, [amenities]);

  const handleSubmitAmenity = () => {
    if (!newAmenity.name || !newAmenity.area) return;
    
    const amenity = {
      ...newAmenity,
      id: Date.now(),
      rating: 0,
      reviews: [],
      timestamp: new Date().toISOString()
    };

    setAmenities([...amenities, amenity]);
    if (!areas.includes(newAmenity.area)) {
      setAreas([...areas, newAmenity.area]);
    }
    setShowForm(false);
    setNewAmenity({
      name: '',
      type: 'sanitation',
      area: '',
      description: '',
      location: null,
      image: ''
    });
  };

  const filteredAmenities = amenities.filter(amenity => {
    const typeMatch = selectedType === 'all' || amenity.type === selectedType;
    const areaMatch = selectedArea === 'all' || amenity.area === selectedArea;
    const searchMatch = amenity.name.toLowerCase().includes(searchQuery.toLowerCase());
    return typeMatch && areaMatch && searchMatch;
  });

  const groupedAmenities = amenities.reduce((acc, amenity) => {
    const area = amenity.area || 'Other';
    if (!acc[area]) acc[area] = [];
    acc[area].push(amenity);
    return acc;
  }, {});

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h2 className="display-5 fw-bold mb-3">
          <FaMapMarkerAlt className="text-primary me-2" />
          Nairobi Community Services
        </h2>
        <Button variant="success" onClick={() => setShowForm(true)}>
          <FaPlus className="me-2" /> Add New Service
        </Button>
      </div>

      {/* Add Amenity Modal */}
      <Modal show={showForm} onHide={() => setShowForm(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Community Service</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Service Name</Form.Label>
                  <Form.Control 
                    value={newAmenity.name}
                    onChange={(e) => setNewAmenity({...newAmenity, name: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Area/Neighborhood</Form.Label>
                  <Form.Control
                    value={newAmenity.area}
                    onChange={(e) => setNewAmenity({...newAmenity, area: e.target.value})}
                    list="areaSuggestions"
                  />
                  <datalist id="areaSuggestions">
                    {areas.map(area => <option key={area} value={area} />)}
                  </datalist>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Service Type</Form.Label>
                  <Form.Select
                    value={newAmenity.type}
                    onChange={(e) => setNewAmenity({...newAmenity, type: e.target.value})}
                  >
                    <option value="sanitation">Sanitation</option>
                    <option value="waste">Waste Management</option>
                    <option value="transport">Transport</option>
                    <option value="community">Community Space</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control 
                    as="textarea"
                    value={newAmenity.description}
                    onChange={(e) => setNewAmenity({...newAmenity, description: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitAmenity}>
            Submit Service
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Filters & Content */}
      <Row className="g-4">
        <Col lg={3}>
          <Card className="shadow-sm sticky-top">
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Control
                  type="search"
                  placeholder="Search services..."
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Filter by Area</Form.Label>
                <Form.Select 
                  value={selectedArea} 
                  onChange={(e) => setSelectedArea(e.target.value)}
                >
                  <option value="all">All Areas</option>
                  {areas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group>
                <Form.Label>Service Type</Form.Label>
                <div className="d-grid gap-2">
                  {['all', 'sanitation', 'waste', 'transport', 'community'].map((type) => (
                    <Button
                      key={type}
                      variant={selectedType === type ? 'primary' : 'outline-secondary'}
                      onClick={() => setSelectedType(type)}
                      className="text-start"
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={9}>
          <Accordion defaultActiveKey="0" alwaysOpen>
            {Object.entries(groupedAmenities).map(([area, amenities], index) => (
              <Accordion.Item eventKey={index.toString()} key={area}>
                <Accordion.Header>
                  <h5 className="mb-0">
                    {area} <Badge bg="secondary" className="ms-2">{amenities.length}</Badge>
                  </h5>
                </Accordion.Header>
                <Accordion.Body>
                  <Row className="g-4">
                    {amenities.map(amenity => (
                      <Col key={amenity.id} xs={12}>
                        <Card className="shadow-sm">
                          <Card.Body>
                            <div className="d-flex align-items-center mb-3">
                              <Badge bg="primary" className="me-3">
                                {amenity.type.toUpperCase()}
                              </Badge>
                              <Card.Title className="mb-0">{amenity.name}</Card.Title>
                            </div>
                            <Card.Text>{amenity.description}</Card.Text>
                            <div className="text-muted small">
                              <FaMapMarkerAlt className="me-1" /> 
                              {amenity.area} • Added {new Date(amenity.timestamp).toLocaleDateString()}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Col>
      </Row>

      {/* Interactive Map */}
      <Row className="mt-5">
        <Col>
          <Card className="shadow-lg">
            <Card.Body className="p-0" style={{ height: '500px' }}>
              <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                {amenities.map((amenity) => (
                  <Marker key={amenity.id} position={[amenity.location?.lat || -1.286389, amenity.location?.lng || 36.817223]}>
                    <Popup>
                      <div className="amenity-popup">
                        <h6>{amenity.name}</h6>
                        <p className="small text-muted mb-2">{amenity.description}</p>
                        <div className="small">
                          <Badge bg="info">{amenity.area}</Badge>
                          <Badge bg="secondary" className="ms-2">{amenity.type}</Badge>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PublicAmenities;