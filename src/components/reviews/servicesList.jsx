import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Carousel, Badge, Form } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaClock, FaMapMarkerAlt, FaFire, FaStar, FaPhone, FaEnvelope, FaGlobe, FaLink } from 'react-icons/fa';
import { GiModernCity } from 'react-icons/gi';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import Marquee from 'react-fast-marquee';
import styled, { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {
    --city-primary: #2A3F5F;
    --city-secondary: #4A90E2;
    --city-accent: #FF6B6B;
    --city-dark: #1A2B3C;
    --city-light: #F8F9FA;
    --city-surface: #FFFFFF;
    --city-success: #00C853;
    --city-warning: #FFD600;
  }

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    background: var(--city-light);
  }

  .city-gradient {
    background: linear-gradient(135deg, var(--city-primary) 0%, var(--city-dark) 100%);
  }
`;

const ServicesList = styled.div`
  padding: 2rem 1rem;
  background: var(--city-light);
  
  .emergency-marquee {
    background: var(--city-dark);
    color: white;
    font-weight: 500;
    padding: 0.75rem 0;
    border-bottom: 2px solid var(--city-accent);
    
    span {
      letter-spacing: 0.5px;
    }
  }

  .service-carousel {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    
    .carousel-item {
      height: 400px;
      
      img {
        filter: brightness(0.8);
      }
    }
  }

  .carousel-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent 0%, rgba(0,0,0,0.7) 100%);
    color: white;
    padding: 2rem;
    
    h5 {
      font-weight: 600;
      font-size: 1.5rem;
    }
    
    .badge {
      background: var(--city-accent) !important;
      color: var(--city-dark);
    }
  }

  .service-card {
    border: none;
    border-radius: 12px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    overflow: hidden;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    }
    
    .card-img-top {
      border-radius: 12px 12px 0 0;
      height: 220px;
      object-fit: cover;
    }
    
    .card-body {
      padding: 1.5rem;
    }
    
    .card-title {
      color: var(--city-primary);
      font-weight: 600;
      font-size: 1.1rem;
    }
    
    .service-category {
      background: var(--city-secondary);
      color: white;
      font-size: 0.8rem;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 20px;
    }
    
    .service-meta {
      font-size: 0.9rem;
      color: var(--city-primary);
      
      svg {
        color: var(--city-secondary);
        margin-right: 0.5rem;
      }
    }
    
    .like-button {
      transition: all 0.3s ease;
      
      &:hover {
        transform: scale(1.1);
      }
      
      .fa-heart {
        color: var(--city-accent);
      }
    }
  }
`;


const ServicesLists = () => {
  const [services, setServices] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const userId = localStorage.getItem('userId'); // Assuming you store user ID

  // Emergency hotlines marquee content
  const hotlines = [
    "Emergency: 112 | Police: 999 | Fire: 998 | Ambulance: 997",
    "City Helpline: 0800 222 111 | Women's Safety: 0800 333 444",
    "Electricity Emergency: 0800 555 666 | Water Department: 0800 777 888"
  ];

  const  BASE_URl = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";
 
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${BASE_URl}/get/services?category=${selectedCategory}`);
        const data = await response.json();
        
        setServices(data);
        const sorted = [...data].sort((a, b) => b.likes.length - a.likes.length).slice(0, 5);
        setTopServices(sorted);
        setIsLoading(false);
      } catch (err) {
        Swal.fire('Error', 'Failed to load services', 'error');
        setIsLoading(false);
      }
    };
    
    fetchServices();
  }, [selectedCategory]);

  const handleLike = async (serviceId) => {
    try {
      const response = await fetch(`${BASE_URl}/services/${serviceId}/like`, {
        method: 'PATCH',
        
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log(response.ok)
        const updatedService = await response.json();
        setServices(services.map(s => 
          s._id === serviceId ? { ...s, likes: updatedService.likes } : s
        ));
        setTopServices(topServices.map(s =>
          s._id === serviceId ? { ...s, likes: updatedService.likes } : s
        ));
      }
    } catch (err) {
      Swal.fire('Error', 'Failed to update like', 'error');
    }
  };

  return (
    <>
    <GlobalStyle />
    <ServicesList>
      {/* Emergency Hotlines Marquee */}
      <Marquee className="emergency-marquee" speed={40} gradient={false}>
        {hotlines.map((line, index) => (
          <span key={index} className="mx-5">{line}</span>
        ))}
      </Marquee>

      {/* Top Services Carousel */}
      <div className="container-lg py-5">
        <h3 className="mb-4 d-flex align-items-center">
          <GiModernCity className="me-2 text-city-primary" />
          <span className="text-city-dark">Featured City Services</span>
        </h3>
        
        <Carousel className="service-carousel">
          {topServices.map(service => (
            <Carousel.Item key={service._id}>
              <div className="position-relative h-100">
                <img 
                  className="d-block w-100 h-100"
                  src={service.images[0]} 
                  alt={service.name}
                />
                <div className="carousel-overlay">
                  <Badge pill className="mb-3">
                    <FaStar className="me-1" /> {service.likes.length} Likes
                  </Badge>
                  
                  <h5>{service.name}</h5>
                  <div className="d-flex flex-wrap gap-3 mt-2">
                    {service.phone && (
                      <Button variant="light" size="sm" href={`tel:${service.phone}`}>
                        <FaPhone className="me-1" /> Call Now
                      </Button>
                    )}
                    {service.locationUrl && (
                      <Button variant="light" size="sm" href={service.locationUrl} target="_blank">
                        <FaMapMarkerAlt className="me-1" /> Directions
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>

      {/* Services Grid */}
      <div className="container-lg py-4">
        <Row className="g-4">
          {services.map(service => (
            <Col key={service._id} xl={4} lg={6}>
              <Card className="service-card h-100">
                <div className="position-relative">
                  <Card.Img variant="top" src={service.images[0]} />
                  <Badge className="service-category position-absolute top-0 start-0 m-3">
                    {service.category}
                  </Badge>
                </div>
                
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <Card.Title>{service.name}</Card.Title>
                    <Button 
                      variant="link" 
                      className="like-button p-0"
                      onClick={() => handleLike(service._id)}
                    >
                      {service.likes.includes(userId) ? 
                        <FaHeart size={24} /> : 
                        <FaRegHeart size={24} className="text-city-primary" />}
                    </Button>
                  </div>
                  
                  <Card.Text className="text-muted small mb-3">{service.description}</Card.Text>
                  
                  <div className="mt-auto service-meta">
                    <div className="d-flex flex-column gap-2">
                      <div>
                        <FaClock /> {service.is24hr ? '24/7 Service' : `${service.openingHours?.opening} - ${service.openingHours?.closing}`}
                      </div>
                      
                      {service.phone && (
                        <div>
                          <FaPhone /> {service.phone}
                        </div>
                      )}
                      
                      {service.locationUrl && (
                        <a href={service.locationUrl} target="_blank" rel="noreferrer" className="text-decoration-none">
                          <FaMapMarkerAlt /> View on Map
                        </a>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </ServicesList>
  </>
);
};


export default ServicesLists;