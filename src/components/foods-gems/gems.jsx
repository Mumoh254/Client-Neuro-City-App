import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Carousel, Card, Form, Button, Badge, Container } from 'react-bootstrap';
import { FiStar, FiMapPin, FiHeart, FiClock, FiDollarSign } from 'react-icons/fi';

const Gems = () => {


  const categoryVariant = {
    street_food: 'warning',
    lunch_spots: 'success',
    date_night: 'danger',
    clubs: 'primary',
    cafes: 'info',
    rooftop_bars: 'dark'
  };

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(to bottom, #f8f9fa, #e9ecef)' }}>
      <header style={{ background: 'linear-gradient(to right, #6f42c1, #0d6efd)' }} className="text-white py-5 shadow">
        <Container>
          <h1 className="display-4 fw-bold mb-3">Nairobi Hidden Gems</h1>
          <p className="lead mb-0">Discover the best eats, meets, and beats in the city</p>
        </Container>
      </header>

      <Container className="py-5">
        {/* Top Spots Carousel */}
        <section className="mb-5">
          <h2 className="h3 fw-bold mb-4 d-flex align-items-center gap-2">
            <FiStar className="text-primary" /> Trending Spots
          </h2>
          <Carousel interval={5000} indicators={false}>
            {topSpots.map(spot => (
              <Carousel.Item key={spot._id}>
                <div className="position-relative">
                  <img
                    className="d-block w-100 rounded-3"
                    src={spot.image}
                    alt={spot.title}
                    style={{ height: '400px', objectFit: 'cover' }}
                  />
                  <div className="position-absolute bottom-0 start-0 end-0 p-4 text-white" 
                       style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h3 className="h4 mb-0">{spot.title}</h3>
                      <Badge pill bg={categoryVariant[spot.type]}>
                        {spot.type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <div className="d-flex justify-content-between small">
                      <div className="d-flex align-items-center gap-2">
                        <FiMapPin />
                        <span>{spot.location}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <FiHeart />
                        <span>{spot.likes} Likes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </section>

        {/* Add New Spot Form */}
        <section className="mb-5">
          <Card className="shadow">
            <Card.Body>
              <h2 className="h4 fw-bold mb-4 d-flex align-items-center gap-2">
                <FiStar className="text-primary" /> Share Your Discovery
              </h2>
              <Form onSubmit={handleSubmit}>
                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <Form.Group controlId="formTitle">
                      <Form.Label>Spot Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Eg. Mama Ngina Street Food"
                        value={newSpot.title}
                        onChange={(e) => setNewSpot({ ...newSpot, title: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </div>

                  <div className="col-md-6">
                    <Form.Group controlId="formType">
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        value={newSpot.type}
                        onChange={(e) => setNewSpot({ ...newSpot, type: e.target.value })}
                      >
                        <option value="street_food">Street Food</option>
                        <option value="lunch_spots">Lunch Spots</option>
                        <option value="date_night">Date Night Venues</option>
                        <option value="clubs">Night Clubs</option>
                        <option value="cafes">Coffee Shops</option>
                        <option value="rooftop_bars">Rooftop Bars</option>
                      </Form.Select>
                    </Form.Group>
                  </div>

           
                  
                </div>

                <Form.Group controlId="formDescription" className="mb-4">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Share details about the vibe, special dishes, or unique features..."
                    value={newSpot.description}
                    onChange={(e) => setNewSpot({ ...newSpot, description: e.target.value })}
                    required
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  <FiStar className="me-2" /> Share Your Gem
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </section>

        {/* All Spots Grid */}
        <section>
          <h2 className="h3 fw-bold mb-4 d-flex align-items-center gap-2">
            <FiMapPin className="text-primary" /> All City Gems
          </h2>
          <div className="row g-4">
            {spots.map(spot => (
              <div key={spot._id} className="col-md-6 col-lg-4">
                <Card className="h-100 shadow-sm hover-shadow transition">
                  <Card.Img 
                    variant="top" 
                    src={spot.image} 
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <Card.Title className="mb-0">{spot.title}</Card.Title>
                      <Badge pill bg={categoryVariant[spot.type]}>
                        {spot.type.replace(/_/g, ' ')}
                      </Badge>
                    </div>

                    <div className="d-flex align-items-center gap-2 mb-3 text-muted">
                      <FiMapPin />
                      <small>{spot.location}</small>
                    </div>

                    <div className="d-flex justify-content-between small text-muted mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <FiDollarSign />
                        <span>{spot.priceRange}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <FiClock />
                        <span>Best at {spot.bestTime}</span>
                      </div>
                    </div>

                    <Card.Text className="text-secondary mb-4">{spot.description}</Card.Text>

                    <div className="d-flex justify-content-between align-items-center">
                      <Button variant="link" onClick={() => handleLike(spot._id)} className="text-decoration-none">
                        <FiHeart className="me-1" /> {spot.likes} Likes
                      </Button>
                      <a 
                        href={`https://maps.google.com?q=${spot.location}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-link text-decoration-none"
                      >
                        <FiMapPin className="me-1" /> Directions
                      </a>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
};

export default Gems;