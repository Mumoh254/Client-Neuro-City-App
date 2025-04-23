import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { FiStar, FiMapPin, FiHeart, FiClock, FiDollarSign } from 'react-icons/fi';

const Gems = () => {
  const [spots, setSpots] = useState([]);
  const [topSpots, setTopSpots] = useState([]);
  const [newSpot, setNewSpot] = useState({
    title: '',
    type: 'street_food',
    location: '',
    description: '',
    image: '',
    priceRange: '$$',
    bestTime: '18:00'
  });

  const categoryColors = {
    street_food: 'bg-orange-100 text-orange-800',
    lunch_spots: 'bg-green-100 text-green-800',
    date_night: 'bg-pink-100 text-pink-800',
    clubs: 'bg-purple-100 text-purple-800',
    cafes: 'bg-blue-100 text-blue-800',
    rooftop_bars: 'bg-red-100 text-red-800'
  };

  useEffect(() => {
    fetchSpots();
    fetchTopSpots();
  }, []);

  const fetchSpots = async () => {
    const res = await axios.get('/api/spots');
    setSpots(res.data);
  };

  const fetchTopSpots = async () => {
    const res = await axios.get('/api/spots/top');
    setTopSpots(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/spots', newSpot);
      setNewSpot({
        title: '',
        type: 'street_food',
        location: '',
        description: '',
        image: '',
        priceRange: '$$',
        bestTime: '18:00'
      });
      fetchSpots();
      fetchTopSpots();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (id) => {
    await axios.put(`/api/spots/${id}/like`);
    fetchSpots();
    fetchTopSpots();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-purple-50">
      <header className="bg-gradient-to-r from-purple-700 to-blue-600 text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Nairobi Hidden Gems</h1>
          <p className="text-lg opacity-90">Discover the best eats, meets, and beats in the city</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Top Spots Carousel */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <FiStar className="text-purple-600" /> Trending Spots
          </h2>
          <Carousel showArrows infiniteLoop autoPlay interval={5000} showThumbs={false}>
            {topSpots.map(spot => (
              <div key={spot._id} className="relative rounded-xl overflow-hidden">
                <img 
                  src={spot.image} 
                  alt={spot.title} 
                  className="w-full h-96 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white text-2xl font-bold">{spot.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${categoryColors[spot.type]}`}>
                      {spot.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-200">
                    <div className="flex items-center gap-2">
                      <FiMapPin />
                      <span>{spot.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiHeart className="text-red-400" />
                      <span>{spot.likes} Likes</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </section>

        {/* Add New Spot Form */}
        <section className="bg-white rounded-xl shadow-xl p-6 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <FiStar className="text-purple-600" /> Share Your Discovery
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Spot Name</label>
                <input
                  type="text"
                  placeholder="Eg. Mama Ngina Street Food"
                  value={newSpot.title}
                  onChange={(e) => setNewSpot({ ...newSpot, title: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={newSpot.type}
                  onChange={(e) => setNewSpot({ ...newSpot, type: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="street_food">Street Food</option>
                  <option value="lunch_spots">Lunch Spots</option>
                  <option value="date_night">Date Night Venues</option>
                  <option value="clubs">Night Clubs</option>
                  <option value="cafes">Coffee Shops</option>
                  <option value="rooftop_bars">Rooftop Bars</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  placeholder="Eg. Westlands, Nairobi"
                  value={newSpot.location}
                  onChange={(e) => setNewSpot({ ...newSpot, location: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Image URL</label>
                <input
                  type="url"
                  placeholder="Paste image link here"
                  value={newSpot.image}
                  onChange={(e) => setNewSpot({ ...newSpot, image: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Price Range</label>
                <select
                  value={newSpot.priceRange}
                  onChange={(e) => setNewSpot({ ...newSpot, priceRange: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="$">Budget ($)</option>
                  <option value="$$">Medium ($$)</option>
                  <option value="$$$">Premium ($$$)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Best Time to Visit</label>
                <input
                  type="time"
                  value={newSpot.bestTime}
                  onChange={(e) => setNewSpot({ ...newSpot, bestTime: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                placeholder="Share details about the vibe, special dishes, or unique features..."
                value={newSpot.description}
                onChange={(e) => setNewSpot({ ...newSpot, description: e.target.value })}
                className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <FiStar /> Share Your Gem
            </button>
          </form>
        </section>

        {/* All Spots Grid */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <FiMapPin className="text-purple-600" /> All City Gems
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(topSpots || []).map((spot, index) => (
              <div key={spot._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <img 
                  src={spot.image} 
                  alt={spot.title} 
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-800">{spot.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${categoryColors[spot.type]}`}>
                      {spot.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <FiMapPin className="flex-shrink-0" />
                    <span>{spot.location}</span>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <FiDollarSign />
                      <span>{spot.priceRange}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiClock />
                      <span>Best at {spot.bestTime}</span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{spot.description}</p>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleLike(spot._id)}
                      className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
                    >
                      <FiHeart className="w-5 h-5" />
                      <span>{spot.likes} Likes</span>
                    </button>
                    <a 
                      href={`https://maps.google.com?q=${spot.location}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-600 hover:text-purple-600 flex items-center gap-1"
                    >
                      <FiMapPin /> Directions
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Gems;