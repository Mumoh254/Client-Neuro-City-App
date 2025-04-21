import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Carousel, Badge, Form } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaClock, FaMapMarkerAlt, FaFire, FaStar, FaPhone, FaEnvelope, FaGlobe, FaLink } from 'react-icons/fa';
import { GiModernCity } from 'react-icons/gi';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import Marquee from 'react-fast-marquee';

const ServicesList = () => {
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

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`http://localhost:8000/apiV1/smartcity-ke/get/services?category=${selectedCategory}`);
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
      const response = await fetch(`http://localhost:8000/apiV1/smartcity-ke/services/${serviceId}/like`, {
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
    <div className="p-4 bg-light">
      {/* Emergency Hotlines Marquee */}
      <Marquee className="bg-danger text-white py-2 mb-4" speed={50}>
        {hotlines.map((line, index) => (
          <span key={index} className="mx-5">{line}</span>
        ))}
      </Marquee>

      {/* Top Services Carousel */}
      <div className="mb-4 position-relative">
        <h3 className="mb-3 text-primary">
          <FaFire className="me-2" /> Most Popular Services
        </h3>
        
        <Carousel interval={3000} indicators={true} className="shadow-sm rounded-3 overflow-hidden">
          {topServices.map(service => (
            <Carousel.Item key={service._id} style={{ height: '300px' }}>
              <div className="position-relative h-100">
                <img 
                  className="d-block w-100 h-100 object-cover"
                  src={service.images[0]} 
                  alt={service.name}
                />
                <div className="carousel-overlay p-3 d-flex flex-column justify-content-between">
                  <Badge bg="warning" className="align-self-start">
                    <FaStar className="me-1" /> {service.likes.length} Likes
                  </Badge>
                  
                  <div className="text-white">
                    <h5 className="fw-bold mb-2">{service.name}</h5>
                    <div className="d-flex flex-wrap gap-2 small">
                      {service.phone && (
                        <a href={`tel:${service.phone}`} className="text-white">
                          <FaPhone className="me-1" /> {service.phone}
                        </a>
                      )}
                      {service.email && (
                        <a href={`mailto:${service.email}`} className="text-white">
                          <FaEnvelope className="me-1" /> Email
                        </a>
                      )}
                      {service.website && (
                        <a href={service.website} target="_blank" rel="noreferrer" className="text-white">
                          <FaGlobe className="me-1" /> Website
                        </a>
                      )}
                    </div>
                    <Button 
                      variant="link" 
                      className="text-white p-0 mt-2"
                      onClick={() => handleLike(service._id)}
                    >
                      {service.likes.includes(userId) ? 
                        <FaHeart className="text-danger" /> : 
                        <FaRegHeart />}
                    </Button>
                  </div>
                </div>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>

      {/* Enhanced Service Card */}
      {services.map(service => (
        <Col key={service._id} lg={4} md={6}>
          <Card className="h-100 border-0 shadow-sm hover-shadow transition-all">
            <div className="position-relative">
              <Card.Img 
                variant="top" 
                src={service.images[0]} 
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <Badge bg="primary" className="position-absolute top-0 start-0 m-2">
                {service.category}
              </Badge>
            </div>
            
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <Card.Title className="text-primary fs-5">{service.name}</Card.Title>
                <Button 
                  variant="link" 
                  className="p-0"
                  onClick={() => handleLike(service._id)}
                >
                  {service.likes.includes(userId) ? 
                    <FaHeart className="text-danger fs-5" /> : 
                    <FaRegHeart className="text-muted fs-5" />}
                  <span className="ms-1 small">{service.likes.length}</span>
                </Button>
              </div>
              
              <Card.Text className="text-muted small mb-2">{service.description}</Card.Text>
              
              <div className="mt-auto">
                <div className="d-flex flex-wrap gap-2 small mb-2">
                  {service.phone && (
                    <a href={`tel:${service.phone}`} className="text-decoration-none">
                      <FaPhone className="me-1 text-primary" /> {service.phone}
                    </a>
                  )}
                  {service.email && (
                    <a href={`mailto:${service.email}`} className="text-decoration-none">
                      <FaEnvelope className="me-1 text-primary" /> Email
                    </a>
                  )}
                </div>

                <div className="d-flex flex-wrap gap-2 small mb-2">
                  {service.website && (
                    <a href={service.website} target="_blank" rel="noreferrer" className="text-decoration-none">
                      <FaGlobe className="me-1 text-primary" /> Website
                    </a>
                  )}
                  {service.socialLink && (
                    <a href={service.socialLink} target="_blank" rel="noreferrer" className="text-decoration-none">
                      <FaLink className="me-1 text-primary" /> Social
                    </a>
                  )}
                </div>

                <div className="d-flex justify-content-between align-items-center small">
                  <span className="text-muted">
                    <FaClock className="me-1" />
                    {service.is24hr ? '24/7' : `${service.openingHours?.opening} - ${service.openingHours?.closing}`}
                  </span>
                  {service.locationUrl && (
                    <a 
                      href={service.locationUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-decoration-none"
                    >
                      <FaMapMarkerAlt className="me-1 text-primary" /> Map
                    </a>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </div>
  );
};


export default ServicesList;