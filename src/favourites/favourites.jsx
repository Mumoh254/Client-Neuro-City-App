import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, 
  Carousel, ProgressBar, Badge, Form, Modal,
  Spinner, Alert
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  FaUtensils, FaBed, FaHeart, FaPlus, 
  FaThumbsUp, FaMapMarkerAlt, FaCoins, FaStar,
  FaBuilding, FaTimes
} from 'react-icons/fa';
import styled from 'styled-components';
import axios from 'axios';

const Favourites = () => {
  const [places, setPlaces] = useState([]);
  const [filters, setFilters] = useState({ 
    type: '', 
    budget: '', 
    category: '' 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newPlace, setNewPlace] = useState({
    name: '',
    type: 'food',
    category: 'street_food',
    description: '',
    budget: 'medium',
    images: []
  });
  const [analytics, setAnalytics] = useState({
    totalPlaces: 0,
    totalVotes: 0,
    verifiedPlaces: 0,
    taxProgress: 72
  });

  // Fetch places from API
  const fetchPlaces = async () => {
    try {
      const params = new URLSearchParams(filters).toString();
      const { data } = await axios.get(`http://localhost:8000/apiV1/smartcity-ke/places?${params}`);
      setPlaces(data);
      setAnalytics({
        totalPlaces: data.length,
        totalVotes: data.reduce((sum, place) => sum + place.votes, 0),
        verifiedPlaces: data.filter(place => place.isVerified).length,
        taxProgress: 72
      });
    } catch (err) {
      setError('Failed to load places. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [filters]);

  const handleVote = async (placeId) => {
    try {
      await axios.post(`http://localhost:8000/apiV1/smartcity-ke/votes`, {
        placeId,
        userId: localStorage.getItem('userId') || 'guest' // Simple user tracking
      });
      fetchPlaces(); // Refresh data
    } catch (err) {
      setError('Voting failed. Please try again.');
    }
  };

  const handleCreatePlace = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/apiV1/smartcity-ke/places', newPlace);
      setShowModal(false);
      fetchPlaces();
    } catch (err) {
      setError('Failed to create place. Please check your input.');
    }
  };

  const categories = [
    { 
      title: "Street Food",
      type: "food",
      icon: <FaUtensils />,
      examples: ['Mayai Pasua', 'Smokie Mayai', 'Mutura', 'Githeri Special']
    },
    {
      title: "Affordable Stays",
      type: "hotel",
      icon: <FaBed />,
      examples: ['Budget Hostels', 'Airbnb Rooms', 'Guest Houses', 'Backpackers']
    },
    {
      title: "Residential Areas",
      type: "residential",
      icon: <FaBuilding />,
      examples: ['Kileleshwa', 'Kilimani', 'Runda', 'Langata']
    }
  ];

  return (
    <ExploreContainer fluid>
      {/* Hero Section */}
      <HeroSection className="text-white">
        <div className="hero-content">
          <h1>Experience Nairobi</h1>
          <p className="lead">Discover authentic street food, hidden gems, and local favorites</p>
          
          <FilterControls>
            <Form.Select
              value={filters.type}
              onChange={e => setFilters({...filters, type: e.target.value})}
            >
              <option value="">All Categories</option>
              <option value="food">🍴 Food & Drinks</option>
              <option value="hotel">🏨 Accommodation</option>
              <option value="residential">🏡 Residential Areas</option>
            </Form.Select>

            <Form.Select
              value={filters.budget}
              onChange={e => setFilters({...filters, budget: e.target.value})}
            >
              <option value="">Any Budget</option>
              <option value="low">💰 Budget</option>
              <option value="medium">💰💰 Moderate</option>
              <option value="high">💰💰💰 Premium</option>
            </Form.Select>

            <Button variant="primary" onClick={() => setShowModal(true)}>
              <FaPlus className="me-2" /> Add Spot
            </Button>
          </FilterControls>
        </div>
      </HeroSection>

      {/* Main Content */}
      <Container className="py-5">
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Category Highlights */}
        <Row className="g-4 mb-5">
          {categories.map((category, i) => (
            <Col key={i} md={6} lg={4}>
              <CategoryCard>
                <div className="icon">{category.icon}</div>
                <h3>{category.title}</h3>
                <div className="examples">
                  {category.examples.map((ex, j) => (
                    <Badge key={j} bg="light" text="dark">{ex}</Badge>
                  ))}
                </div>
                <Button 
                  variant="outline-primary" 
                  onClick={() => setFilters({
                    type: category.type,
                    budget: '',
                    category: ''
                  })}
                >
                  Explore {category.title}
                </Button>
              </CategoryCard>
            </Col>
          ))}
        </Row>

        {/* Places Grid */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {places.map(place => (
              <Col key={place._id}>
                <PlaceCard>
                  {place.images?.length > 0 && (
                    <div 
                      className="place-image"
                      style={{ backgroundImage: `url(${place.images[0]})` }}
                    />
                  )}
                  <div className="place-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h4>{place.name}</h4>
                        <Badge bg="secondary">{place.category}</Badge>
                      </div>
                      <Badge bg={place.isVerified ? 'success' : 'warning'}>
                        {place.isVerified ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="description">{place.description}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => handleVote(place._id)}
                      >
                        <FaThumbsUp className="me-2" /> {place.votes}
                      </Button>
                      <Badge bg="light" text="dark">
                        {place.budget}
                      </Badge>
                    </div>
                  </div>
                </PlaceCard>
              </Col>
            ))}
          </Row>
        )}

        {/* Tax Campaign */}
        <TaxCampaignCard className="mt-5">
          <div className="campaign-content">
            <FaCoins className="icon" />
            <h4>Tulipe Ushuru Kwa Furaha</h4>
            <p className="text-muted">Support Nairobi's development</p>
            <ProgressBar now={analytics.taxProgress} variant="warning" />
            <Button 
              variant="light" 
              className="mt-3"
              onClick={() => window.open('https://itax.kra.go.ke/', '_blank')}
            >
              Pay Taxes Now
            </Button>
          </div>
        </TaxCampaignCard>
      </Container>

      {/* Add Place Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Suggest New Place</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PlaceForm onSubmit={handleCreatePlace}>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group controlId="name">
                  <Form.Label>Place Name</Form.Label>
                  <Form.Control 
                    type="text" 
                    required
                    value={newPlace.name}
                    onChange={e => setNewPlace({...newPlace, name: e.target.value})}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group controlId="type">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={newPlace.type}
                    onChange={e => setNewPlace({...newPlace, type: e.target.value})}
                  >
                    <option value="food">Food & Drinks</option>
                    <option value="hotel">Accommodation</option>
                    <option value="residential">Residential Area</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="budget">
                  <Form.Label>Price Range</Form.Label>
                  <Form.Select
                    value={newPlace.budget}
                    onChange={e => setNewPlace({...newPlace, budget: e.target.value})}
                  >
                    <option value="low">Budget</option>
                    <option value="medium">Moderate</option>
                    <option value="high">Premium</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group controlId="description">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={newPlace.description}
                    onChange={e => setNewPlace({...newPlace, description: e.target.value})}
                  />
                </Form.Group>
              </Col>

              <div className="text-center mt-4">
                <Button variant="primary" type="submit">
                  Submit Place
                </Button>
              </div>
            </Row>
          </PlaceForm>
        </Modal.Body>
      </Modal>
    </ExploreContainer>
  );
};

// Styled Components
const ExploreContainer = styled(Container)`
  background: #f8f9fa;
  min-height: 100vh;
`;

const HeroSection = styled.div`
  height: 60vh;
  background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)),
    url('https://images.unsplash.com/photo-1552566626-52f8b828add9');
  background-size: cover;
  background-position: center 70%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;

  .hero-content {
    max-width: 800px;
  }
`;

const FilterControls = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr 1fr auto;
  max-width: 800px;
  margin: 2rem auto 0;

  select, button {
    height: 50px;
    border-radius: 8px;
    border: none;
  }

  button {
    padding: 0 2rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CategoryCard = styled(Card)`
  height: 100%;
  border: none;
  overflow: hidden;
  transition: transform 0.3s ease;
  padding: 2rem;
  text-align: center;
  background: white;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  }

  .icon {
    font-size: 2.5rem;
    color: #2c3e50;
    margin-bottom: 1rem;
  }

  .examples {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
    margin: 1rem 0;
  }
`;

const PlaceCard = styled(Card)`
  border: none;
  overflow: hidden;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-3px);
  }

  .place-image {
    height: 200px;
    background-size: cover;
    background-position: center;
  }

  .place-body {
    padding: 1.5rem;
    background: white;

    h4 {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
    }

    .description {
      font-size: 0.9rem;
      color: #666;
      height: 60px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }
  }
`;

const TaxCampaignCard = styled(Card)`
  background: linear-gradient(45deg, #2c3e50, #3498db);
  color: white;
  border: none;
  overflow: hidden;

  .campaign-content {
    padding: 3rem 2rem;
    text-align: center;

    .icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    h4 {
      margin-bottom: 0.5rem;
    }

    button {
      border-radius: 30px;
      padding: 0.75rem 2rem;
    }
  }
`;

const PlaceForm = styled(Form)`
  .form-label {
    font-weight: 600;
    color: #333;
  }

  .form-control, .form-select {
    border-radius: 8px;
    padding: 0.75rem 1rem;
    border: 1px solid #ddd;
  }
`;

export default Favourites;