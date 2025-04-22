import React, { useState } from 'react';
import Slider from 'react-slick';
import { FaHeart, FaRegHeart, FaStar, FaComment } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
 // Create this file for custom CSS

const placesData = [
  {
    id: 1,
    name: 'Nairobi National Park',
    image: 'https://example.com/nairobi-park.jpg',
    price: { adult: 25, child: 15 },
    description: 'Unique wildlife experience with city skyline backdrop',
    likes: 245,
    reviews: ['Amazing experience!', 'Must-visit for wildlife lovers']
  },
  // Add more places...
];

const PlacesCarousel = () => {
  // ... [keep previous state and handlers] ...

  return (
    <div className="container py-5">
      <h2 className="text-center mb-5 display-4 fw-bold text-primary">
        Must Visit Places in Nairobi
      </h2>

      <Slider {...settings} className="places-slider">
        {places.map(place => (
          <div key={place.id} className="px-2">
            <div className="card shadow-lg h-100 border-0 hover-scale">
              <img 
                src={place.image} 
                className="card-img-top place-image"
                alt={place.name}
              />
              <div className="card-body">
                <h3 className="card-title fw-bold mb-3">{place.name}</h3>
                
                <div className="d-flex gap-2 mb-3">
                  <span className="badge bg-primary fs-6">
                    Adult: KES {place.price.adult}
                  </span>
                  <span className="badge bg-success fs-6">
                    Child: KES {place.price.child}
                  </span>
                </div>

                <p className="card-text text-muted mb-4">{place.description}</p>

                <div className="d-flex justify-content-between align-items-center">
                  <button 
                    className="btn btn-link text-danger p-0"
                    onClick={() => handleLike(place.id)}
                  >
                    {place.likes > 0 ? <FaHeart /> : <FaRegHeart />}
                    <span className="ms-2">{place.likes}</span>
                  </button>

                  <button 
                    className="btn btn-dark"
                    onClick={() => setSelectedPlace(place)}
                  >
                    <FaComment className="me-2" />
                    Reviews ({place.reviews.length})
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>

      {/* Review Modal */}
      {selectedPlace && (
        <div className="modal fade show d-block">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  Reviews for {selectedPlace.name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSelectedPlace(null)}
                ></button>
              </div>
              
              <div className="modal-body">
                <div className="reviews-list mb-4">
                  {selectedPlace.reviews.map((review, index) => (
                    <div key={index} className="alert alert-light d-flex align-items-center">
                      <FaStar className="text-warning me-2" />
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
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100"
                  >
                    Submit Review
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacesCarousel;