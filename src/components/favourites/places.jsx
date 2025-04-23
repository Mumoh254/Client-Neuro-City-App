import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { FaHeart, FaRegHeart, FaStar, FaComment, FaPlus } from 'react-icons/fa';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const API_URL = 'https://sheetdb.io/api/v1/7jk1fedp87rbm';

const styles = `
  .places-slider {
    position: relative;
    padding: 20px 0;
  }

  .hover-scale {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border-radius: 15px;
    overflow: hidden;
  }

  .hover-scale:hover {
    transform: scale(1.05);
    box-shadow: 0 10px 20px rgba(0,0,0,0.15);
  }

  .place-image {
    height: 300px;
    object-fit: cover;
    border-radius: 15px 15px 0 0;
  }

  .modal-content {
    border-radius: 20px;
    border: none;
  }

  .review-star {
    color: #ffc107;
    font-size: 1.2rem;
  }

  .floating-add-btn {
    position: fixed;
    bottom: 30px;
    right: 30px;
    z-index: 1000;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  }

  .gradient-bg {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
`;

const PlacesCarousel = () => {
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [newReview, setNewReview] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlace, setNewPlace] = useState({
    name: '',
    image: '',
    price_adult: '',
    price_child: '',
    description: ''
  });

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 992,
        settings: { slidesToShow: 2, slidesToScroll: 1 }
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1, slidesToScroll: 1 }
      }
    ]
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      const { data } = await axios.get(API_URL);
      setPlaces(data.map(p => ({ ...p, liked: false })));
      setLoading(false);
    } catch (err) {
      setError('Failed to load places');
      setLoading(false);
    }
  };

  const handleLike = async (id) => {
    try {
      const place = places.find(p => p.id === id);
      const newLikes = parseInt(place.likes) + (place.liked ? -1 : 1);
      
      await axios.patch(`${API_URL}/id/${id}`, {
        data: { likes: newLikes }
      });

      setPlaces(places.map(p => 
        p.id === id ? { ...p, likes: newLikes, liked: !p.liked } : p
      ));
    } catch (err) {
      setError('Failed to update like');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.trim()) return;

    try {
      const reviews = [...selectedPlace.reviews, newReview];
      
      await axios.patch(`${API_URL}/id/${selectedPlace.id}`, {
        data: { reviews: JSON.stringify(reviews) }
      });

      setPlaces(places.map(p => 
        p.id === selectedPlace.id ? { ...p, reviews } : p
      ));
      setNewReview('');
    } catch (err) {
      setError('Failed to submit review');
    }
  };

  const handleAddPlace = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, { data: [newPlace] });
      await fetchPlaces();
      setShowAddForm(false);
      setNewPlace({
        name: '',
        image: '',
        price_adult: '',
        price_child: '',
        description: ''
      });
    } catch (err) {
      setError('Failed to add new place');
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Spinner animation="border" variant="primary" />
    </div>
  );

  return (
    <div className="container py-5">
      <style>{styles}</style>

      <h2 className="text-center mb-5 display-4 fw-bold text-white gradient-bg py-4 rounded-4">
        Nairobi's Top Attractions
      </h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Slider {...settings} className="places-slider">
        {places.map(place => (
          <div key={place.id} className="px-2">
            <div className="card shadow-lg h-100 border-0 hover-scale">
              <img 
                src={place.image || 'https://via.placeholder.com/300x200'} 
                className="card-img-top place-image"
                alt={place.name}
              />
              <div className="card-body">
                <h3 className="card-title fw-bold mb-3 text-primary">{place.name}</h3>
                
                <div className="d-flex gap-2 mb-3">
                  <span className="badge bg-primary fs-6">
                    Adult: KES {place.price_adult}
                  </span>
                  <span className="badge bg-success fs-6">
                    Child: KES {place.price_child}
                  </span>
                </div>

                <p className="card-text text-muted mb-4">{place.description}</p>

                <div className="d-flex justify-content-between align-items-center">
                  <button 
                    className="btn btn-link text-danger p-0"
                    onClick={() => handleLike(place.id)}
                  >
                    {place.liked ? <FaHeart /> : <FaRegHeart />}
                    <span className="ms-2">{place.likes}</span>
                  </button>

                  <button 
                    className="btn btn-dark"
                    onClick={() => setSelectedPlace(place)}
                  >
                    <FaComment className="me-2" />
                    Reviews ({place.reviews?.length || 0})
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>

      <Button 
        variant="primary" 
        className="floating-add-btn"
        onClick={() => setShowAddForm(true)}
      >
        <FaPlus size={24} />
      </Button>

      <Modal show={!!selectedPlace} onHide={() => setSelectedPlace(null)} centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>{selectedPlace?.name} Reviews</Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <div className="reviews-list mb-4">
            {(selectedPlace?.reviews || []).map((review, index) => (
              <div key={index} className="alert alert-light d-flex align-items-center mb-3">
                <FaStar className="review-star me-2" />
                {review}
              </div>
            ))}
          </div>

          <form onSubmit={handleReviewSubmit}>
            <textarea
              className="form-control mb-3"
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              placeholder="Share your experience..."
              rows="3"
            />
            <div className="d-grid">
              <Button variant="primary" type="submit">
                Submit Review
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <Modal show={showAddForm} onHide={() => setShowAddForm(false)} centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Add New Place</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleAddPlace}>
            <div className="mb-3">
              <label>Place Name</label>
              <input
                className="form-control"
                value={newPlace.name}
                onChange={(e) => setNewPlace({...newPlace, name: e.target.value})}
                required
              />
            </div>
            <div className="mb-3">
              <label>Image URL</label>
              <input
                className="form-control"
                value={newPlace.image}
                onChange={(e) => setNewPlace({...newPlace, image: e.target.value})}
                required
              />
            </div>
            <div className="row mb-3">
              <div className="col">
                <label>Adult Price</label>
                <input
                  type="number"
                  className="form-control"
                  value={newPlace.price_adult}
                  onChange={(e) => setNewPlace({...newPlace, price_adult: e.target.value})}
                  required
                />
              </div>
              <div className="col">
                <label>Child Price</label>
                <input
                  type="number"
                  className="form-control"
                  value={newPlace.price_child}
                  onChange={(e) => setNewPlace({...newPlace, price_child: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <label>Description</label>
              <textarea
                className="form-control"
                value={newPlace.description}
                onChange={(e) => setNewPlace({...newPlace, description: e.target.value})}
                required
              />
            </div>
            <Button variant="primary" type="submit" className="w-100">
              Add Place
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PlacesCarousel;