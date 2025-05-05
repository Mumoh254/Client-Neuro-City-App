import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { 
  FaComment, 
  FaThumbsUp, 
  FaShareAlt,
  FaPlus,
  FaRegHeart,
  FaHeart,
  FaMapMarker,
  FaUtensils,
  FaGem,
  FaArrowRight
} from 'react-icons/fa';
import { getUserNameFromToken } from '../handler/tokenDecoder';

const Favourites = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newReview, setNewReview] = useState({ content: '', images: [] });
  const navigate = useNavigate();

  // Navigation buttons configuration
  const sections = [
    { 
      title: "Must Visit Places",
      icon: <FaMapMarker className="fs-2" />,
      action: () => navigate("/nairobi-must-visit-places"),
      color: "danger"
    },
    { 
      title: "Street Foods",
      icon: <FaUtensils className="fs-2" />,
      action: () => navigate("/nairobi-foods"),
      color: "warning"
    },
    { 
      title: "Hidden Gems",
      icon: <FaGem className="fs-2" />,
      action: () => navigate("/nairobi-hidden-gems"),
      color: "info"
    },
    { 
      title: "create  a favourite spot ",
      icon: <FaGem className="fs-2" />,
      action: () => navigate("/nairobi-hidden-gems"),
      color: "info"
    },
    { 
      title: "Know  You $ Route & Sacco",
      icon: <FaMapMarker className="fs-2" />,
      action: () => navigate("/nairobi-must-visit-places"),
      color: "danger"
    },
  ];

const   [  username  ,  setUsername]  =  useState(null)
  useEffect(() => {
      const userData = getUserNameFromToken();
      if (userData) setUsername(userData.name);
    }, []);
  

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const mockReviews = [
          { id: 1, author: "Local Guide", content: "Amazing street food experience at Mama Ngina!", likes: 42, comments: 8 },
          { id: 2, author: "Traveler", content: "Found this hidden art gallery - absolutely stunning!", likes: 28, comments: 3 }
        ];
        setReviews(mockReviews);
      } catch (err) {
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    setReviews([...reviews, { ...newReview, id: Date.now(), likes: 0, comments: 0 }]);
    setNewReview({ content: '', images: [] });
  };

  return (
    <Card className="shadow-lg border-0 rounded-3 my-5">
      <Card.Body className="p-5">
        <div className="text-center mb-5">
        
          <p className="text-black fw-bold">
         <span>Hellow <span>{username}</span> Discover   Best Dish Spots && Hidden Gems </span>
            <br /> 
          </p>
        </div>

        <Row className="g-4 mb-5">
          {sections.map((section, index) => (
            <Col key={index} md={4}>
              <Button
                variant={section.color}
                onClick={section.action}
                className="d-flex align-items-center justify-content-between p-4 w-100 h-100 text-start shadow-sm"
                style={{ borderRadius: "15px" }}
              >
                <div>
                  <div className="mb-3 text-white">{section.icon}</div>
                  <h3 className="h5 text-white mb-0">{section.title}</h3>
                </div>
                <FaArrowRight className="text-white ms-3" />
              </Button>
            </Col>
          ))}
        </Row>

        <div className="mb-5">
          <h2 className="h4 fw-bold mb-4">Share Your Experience</h2>
          <Card className="shadow-sm border-0 p-4 mb-4">
            <Form onSubmit={handleSubmitReview}>
              <Form.Group>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Share your Nairobi experience..."
                  value={newReview.content}
                  onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                  className="mb-3"
                />
                <div className="d-flex justify-content-between align-items-center">
                  <Button variant="primary" type="submit">
                    Post Review
                  </Button>
                  <Button variant="outline-secondary">
                    <FaPlus className="me-2"/> Add Photo
                  </Button>
                </div>
              </Form.Group>
            </Form>
          </Card>
        </div>

        <div className="mt-4">
          <h2 className="h4 fw-bold mb-4">Latest Reviews</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border"/></div>
          ) : (
            <Row className="g-4">
              {reviews.map(review => (
                <Col key={review.id} md={6}>
                  <Card className="shadow-sm border-0 h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary text-white rounded-circle p-2 me-2">
                            {review.author[0]}
                          </div>
                          <div>
                            <h5 className="mb-0">{review.author}</h5>
                            <small className="text-muted">2 hours ago</small>
                          </div>
                        </div>
                        <Button variant="link" className="text-danger p-0">
                          <FaHeart className="me-1"/>{review.likes}
                        </Button>
                      </div>
                      <p className="text-muted">{review.content}</p>
                      <div className="d-flex justify-content-end gap-3">
                        <Button variant="link" className="text-muted">
                          <FaComment className="me-2"/>{review.comments} comments
                        </Button>
                        <Button variant="link" className="text-muted">
                          <FaShareAlt className="me-2"/> Share
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default Favourites;