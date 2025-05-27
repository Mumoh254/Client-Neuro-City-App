import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Card, Carousel, Badge, Button, Spinner, Tabs, Tab, Modal, Form } from 'react-bootstrap';
import { StarHalf, CartPlus, GeoAlt, Clock, People, Envelope, PersonBadge  ,  StarFill , PinMapFill  ,   AwardFill , ClockHistory , CashCoin } from 'react-bootstrap-icons';
import { format, formatDistanceToNow } from 'date-fns';

const ChefProfile = ({ addToCart }) => {

  const  BASE_URL   =   "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke"
  
  const { id: chefId } = useParams();
  const [chef, setChef] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMealType, setSelectedMealType] = useState('all');
  const [showHireModal, setShowHireModal] = useState(false);
  const [hireDetails, setHireDetails] = useState({
    eventType: '',
    date: '',
    time: '',
    people: 1,
    notes: ''
  });
  const [requestStatus, setRequestStatus] = useState(null);

  // Color scheme
  const colors = {
    primary: '#2ecc71',
    primaryDark: '#2ecc71',
    danger: '#ef4444',
    dangerDark: '#dc2626',
    purple: '#2d3436',
    purpleDark: '#8b5cf6'
  };

  useEffect(() => {
    const fetchChefData = async () => {
      try {
        const [chefRes, foodsRes] = await Promise.all([
          fetch(`${BASE_URL}/chef/${chefId}`),
          fetch(`${BASE_URL}/foods?chefId=${chefId}`)
        ]);

        const chefData = await chefRes.json();
        const foodsData = await foodsRes.json();

        setChef(chefData?.data || null);
        setFoods(foodsData?.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChefData();
  }, [chefId]);

  const handleHireSubmit = async (e) => {
    e.preventDefault();
    setRequestStatus('loading');
    
    try {
      const response = await fetch('http://localhost:8000/apiV1/smartcity-ke/hire-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chefId,
          ...hireDetails,
          requestDate: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Request failed');
      
      setRequestStatus('success');
      setTimeout(() => setShowHireModal(false), 2000);
    } catch (error) {
      console.error('Hire request error:', error);
      setRequestStatus('error');
    }
  };

  const filteredFoods = foods.filter(food => 
    selectedMealType === 'all' || food.mealType?.toLowerCase() === selectedMealType
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" style={{ color: colors.primary }} />
      </div>
    );
  }

  if (!chef) return <div className="text-center py-5">Chef not found</div>;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
  {/* Chef Header */}
  <div style={{ 
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
    padding: '2rem 0',
    color: 'white',
    boxShadow: '0 1px 6px rgba(0, 0, 0, 0.08)'
  }}>
    <div className="container">
      <div className="d-flex flex-column flex-lg-row align-items-center gap-3">
        {/* Profile Image */}
        <div className="position-relative" style={{ lineHeight: 0 }}>
          <img
            src={'/images/chef.png'}
            alt={chef.user?.Name}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid rgba(255,255,255,0.95)',
              boxShadow: '0 3px 12px rgba(0,0,0,0.12)',
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: '4px',
            right: '4px',
            backgroundColor: colors.danger,
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
          }}>
            <StarFill style={{ color: 'white', fontSize: '0.8rem' }} />
          </div>
        </div>

        {/* Chef Info */}
        <div className="text-center text-lg-start" style={{ flex: 1 }}>
          <div className="mb-2">
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              marginBottom: '0.25rem',
              letterSpacing: '-0.015em',
              lineHeight: 1.3
            }}>
              {chef.user?.Name}
            </h1>
            <div style={{
              display: 'flex',
              gap: '0.375rem',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'rgba(255,255,255,0.85)',
              fontSize: '0.875rem'
            }}>
              <PinMapFill style={{ fontSize: '0.9rem' }} />
              <span>Location {chef?.location} • {chef.area}</span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="d-flex flex-wrap gap-1.5 justify-content-center">
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.09)',
              padding: '0.375rem 0.75rem',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              backdropFilter: 'blur(2px)',
              fontSize: '0.825rem'
            }}>
              <CashCoin style={{ fontSize: '0.95rem' }} />
              <span>Ksh {100} bob / Jikoni Culture</span>
            </div>

            <div style={{
              background: `linear-gradient(45deg, ${colors.success}, ${colors.teal})`,
              padding: '0.375rem 0.75rem',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.825rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
            }}>
              <ClockHistory style={{ fontSize: '0.95rem' }} />
              <span>{chef.experienceYears}y exp</span>
            </div>

            <div style={{
              backgroundColor: 'rgba(255,255,255,0.09)',
              padding: '0.375rem 0.75rem',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              backdropFilter: 'blur(2px)',
              fontSize: '0.825rem'
            }}>
              <AwardFill style={{ fontSize: '0.95rem' }} />
              <span>{chef.speciality}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>



      {/* Main Content */}
      <div className="container py-5">
        <Row className="g-4">
          {/* Chef Details Sidebar */}
          <Col lg={4}>
            <Card className="shadow-lg border-0">
              <Card.Body>
                <div className="mb-4">
                  <h4 className="fw-bold mb-3" style={{ color: colors.primary }}>About</h4>
                  <p className="text-muted lead">{chef.bio}</p>
                  
                  <div className="mt-4">
                    <h5 className="fw-bold mb-3" style={{ color: colors.purple }}>
                      <GeoAlt className="me-2" /> Location
                    </h5>    
                    <p className="mb-0"> <span className='red2'>{chef.location}</span>, {chef.city}</p>
                  </div>
                </div>

                <div className="border-top pt-4">
                  <h5 className="fw-bold mb-3" style={{ color: colors.primary }}>
                    <Envelope className="me-2" /> Contact
                  </h5>
                  <Button 
                   className='bgred border-0'
                    style={{ 
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '1.1rem'
                    }}
                    onClick={() => setShowHireModal(true)}
                  >
                    Hire Chef
                  </Button>
                  
                  {chef.socialLinks && (
                    <div className="mt-4">
                      <h5 className="fw-bold mb-3" style={{ color: colors.primary }}>Social Links</h5>
                      <div className="d-flex gap-2 flex-wrap">
                        {Object.entries(chef.socialLinks).map(([platform, url]) => (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary rounded-pill"
                            style={{ 
                              borderColor: colors.primary,
                              color: colors.primary
                            }}
                          >
                            <i className={`bi bi-${platform.toLowerCase()} me-2`} />
                            {platform}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {chef.certifications?.length > 0 && (
                  <div className="border-top pt-4 mt-4">
                    <h5 className="fw-bold mb-3" style={{ color: colors.primary }}>Certifications</h5>
                    <div className="d-flex flex-column gap-2">
                      {chef.certifications.map((cert, i) => (
                        <div key={i} className="d-flex align-items-center gap-2">
                          <div style={{
                            width: '30px',
                            height: '30px',
                            backgroundColor: colors.primary,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <span className="text-white">✓</span>
                          </div>
                          <span className="text-muted">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

{/* Auto-Scroll Foods Section */}
<div className="py-4 border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
  <div className="container">
    <h5 className="mb-3 fw-bold" style={{ 
      color: colors.primary,
      fontSize: '1.25rem',
      letterSpacing: '-0.015em'
    }}>
      <StarHalf className="me-2" style={{ width: '20px', height: '20px' }} /> 
      Signature Creations
    </h5>
    
    <div className="foods-scroll-container">
      <div className="foods-scroll">
        {foods.map(food => (
          <div key={food.id} className="food-scroll-item">
            <Card className="h-100 shadow-sm border-0 overflow-hidden" style={{
              borderRadius: '12px',
              transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              <div className="position-relative">
                <Carousel interval={null} indicators={food.photoUrls?.length > 1}>
                  {(food.photoUrls || []).map((img, i) => (
                    <Carousel.Item key={i}>
                      <div className="ratio ratio-1x1">
                        <img
                          src={img}
                          alt={`${food.title} - Photo ${i + 1}`}
                          className="card-img-top object-fit-cover"
                          style={{ 
                            filter: 'brightness(0.98)',
                            borderTopLeftRadius: '12px',
                            borderTopRightRadius: '12px'
                          }}
                          onError={(e) => (e.target.src = '/placeholder-food.jpg')}
                        />
                      </div>
                    </Carousel.Item>
                  ))}
                </Carousel>
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backdropFilter: 'blur(4px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                  <span style={{
                    color: colors.primary,
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}>
                    KES {food.price}
                  </span>
                </div>
              </div>

              <Card.Body className="d-flex flex-column" style={{ padding: '1.25rem' }}>
                <h6 className="fw-bold mb-2" style={{ 
                  color: colors.primary,
                  fontSize: '1rem',
                  lineHeight: 1.3
                }}>
                  {food.title}
                </h6>

                <div className="d-flex gap-2 flex-wrap mb-3">
                  <Badge pill className="small" style={{ 
                    backgroundColor: `${colors.purple}15`,
                    color: colors.purple,
                    padding: '0.35rem 0.7rem',
                    fontSize: '0.8rem'
                  }}>
                    {food.cuisineType}
                  </Badge>
                  <Badge pill className="small" style={{ 
                    backgroundColor: `${colors.danger}15`,
                    color: colors.danger,
                    padding: '0.35rem 0.7rem',
                    fontSize: '0.8rem'
                  }}>
                    {food.dietary}
                  </Badge>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  className="w-100 d-flex align-items-center justify-content-center"
                  style={{ 
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                    padding: '0.5rem',
                    fontSize: '0.9rem',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => addToCart(food)}
                >
                  <CartPlus className="me-2" style={{ width: '16px', height: '16px' }} />
                  Add to Cart
                </Button>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    </div>
  </div>

  <style jsx>{`
    .foods-scroll-container {
      position: relative;
      padding-bottom: 1rem;
    }

    .foods-scroll {
      display: flex;
      overflow-x: auto;
      gap: 1.5rem;
      padding-bottom: 1rem;
      -webkit-overflow-scrolling: touch;
      scroll-snap-type: x proximity;
      scrollbar-width: thin;
      scrollbar-color: ${colors.primary} #f1f1f1;
    }

    .food-scroll-item {
      flex: 0 0 280px;
      scroll-snap-align: start;
      transition: transform 0.2s ease;
    }

    .food-scroll-item:hover {
      transform: translateY(-4px);
    }

    .foods-scroll::-webkit-scrollbar {
      height: 4px;
    }

    .foods-scroll::-webkit-scrollbar-thumb {
      background-color: ${colors.primary};
      border-radius: 4px;
    }

    .foods-scroll::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }

    @media (max-width: 768px) {
      .food-scroll-item {
        flex: 0 0 240px;
      }
      
      h5 {
        font-size: 1.1rem !important;
      }
    }
  `}</style>
</div>
          {/* Menu Items */}
          <Col lg={8}>
            <Tabs 
              activeKey={selectedMealType} 
              onSelect={setSelectedMealType}
              className="mb-4"
              style={{
                '--bs-nav-link-color': colors.primary,
                '--bs-nav-link-hover-color': colors.primaryDark,
                '--bs-nav-tabs-link-active-color': 'white',
                '--bs-nav-tabs-link-active-bg': colors.primary
              }}
            >
              <Tab eventKey="all" title="All Meals" />
              <Tab eventKey="breakfast" title="Breakfast" />
              <Tab eventKey="lunch" title="Lunch" />
              <Tab eventKey="dinner" title="Dinner" />
            </Tabs>

            <Row xs={1} md={2} className="g-4">
              {filteredFoods.map(food => (
                <Col key={food.id}>
                  <Card className="h-100 shadow-sm border-0 overflow-hidden">
                    <Carousel interval={null} indicators={food.photoUrls?.length > 1}>
                      {(food.photoUrls || []).map((img, i) => (
                        <Carousel.Item key={i}>
                          <div className="ratio ratio-4x3">
                            <img
                              src={img}
                              alt={`${food.title} - Photo ${i + 1}`}
                              className="card-img-top object-fit-cover"
                              style={{ filter: 'brightness(0.95)' }}
                              onError={(e) => (e.target.src = '/placeholder-food.jpg')}
                            />
                          </div>
                        </Carousel.Item>
                      ))}
                    </Carousel>

                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h5 className="fw-bold mb-0" style={{ color: colors.primary }}>
                            {food.title}
                          </h5>
                          <small className="text-muted">
                            Posted {formatDistanceToNow(new Date(food.createdAt))} ago
                          </small>
                        </div>
                        <Badge 
                          
                          style={{ 
                            background: '#FF4532',
                            fontSize: '1rem',
                            padding: '0.5rem 1rem'
                          }}
                        
                        >
                          KES {food.price}
                        </Badge>
                      </div>

                      <p className="small text-secondary mb-3 flex-grow-1">{food.description}</p>

                      <div className="d-flex gap-2 flex-wrap mb-3">
                        <Badge pill style={{ backgroundColor: colors.primary }}>
                          {food.speciality}
                        </Badge>
                        <Badge pill style={{ backgroundColor: colors.purple }}>
                          {food.cuisineType}
                        </Badge>
                        <Badge pill style={{ backgroundColor: colors.danger }}>
                          {food.dietary}
                        </Badge>
                      </div>

                      <Button
                      
                        style={{
                       
                          padding: '0.75rem',
                          fontSize: '1.1rem'
                        }}
                        className="w-100  bgred border-0"
                        onClick={() => addToCart(food)}
                      >
                        <CartPlus className="me-2" /> Add to Cart
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </div>

      {/* Hire Chef Modal */}
      <Modal show={showHireModal} onHide={() => setShowHireModal(false)} centered>
        <Modal.Header 
          closeButton 
          style={{ borderColor: colors.primary }}
        >
          <Modal.Title style={{ color: colors.primary }}>
            Hire {chef.user?.Name}
          </Modal.Title>
        </Modal.Header>
        
        <Form onSubmit={handleHireSubmit}>
          <Modal.Body>
            {requestStatus === 'success' && (
              <div className="alert alert-success">Request sent successfully!</div>
            )}
            {requestStatus === 'error' && (
              <div className="alert alert-danger">Failed to send request. Please try again.</div>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Event Type</Form.Label>
              <Form.Select
                required
                value={hireDetails.eventType}
                onChange={(e) => setHireDetails({...hireDetails, eventType: e.target.value})}
                style={{ borderColor: colors.primary }}
              >
                <option value="">Select event type</option>
                <option>Wedding</option>
                <option>Corporate Event</option>
                <option>Birthday Party</option>
                <option>Private Dinner</option>
              </Form.Select>
            </Form.Group>

            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    required
                    value={hireDetails.date}
                    onChange={(e) => setHireDetails({...hireDetails, date: e.target.value})}
                    style={{ borderColor: colors.primary }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Time</Form.Label>
                  <Form.Control 
                    type="time" 
                    required
                    value={hireDetails.time}
                    onChange={(e) => setHireDetails({...hireDetails, time: e.target.value})}
                    style={{ borderColor: colors.primary }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Number of People</Form.Label>
              <Form.Control 
                type="number" 
                min="1"
                value={hireDetails.people}
                onChange={(e) => setHireDetails({...hireDetails, people: e.target.value})}
                style={{ borderColor: colors.primary }}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Special Requests</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3}
                value={hireDetails.notes}
                onChange={(e) => setHireDetails({...hireDetails, notes: e.target.value})}
                style={{ borderColor: colors.primary }}
              />
            </Form.Group>
          </Modal.Body>
          
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowHireModal(false)}
              style={{ color: colors.primary }}
            >
              Close
            </Button>
            <Button 
              type="submit" 
              style={{ 
                backgroundColor: colors.primary,
                borderColor: colors.primaryDark,
                color: 'white'
              }}
              disabled={requestStatus === 'loading'}
            >
              {requestStatus === 'loading' ? 'Sending...' : 'Send Request'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ChefProfile;