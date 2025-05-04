import React, { useState, useEffect, useRef } from 'react';
import Slider from 'react-slick';
import { 
  FaHeart, FaRegHeart, FaStar, FaComment, FaPlus, 
  FaGlobe, FaUsers, FaCalendarAlt, FaComments, 
  FaPhone, FaCheckCircle, FaRegClock, FaCheckDouble,
  FaCrown, FaUserTag, FaMapMarkerAlt, FaPaperPlane
} from 'react-icons/fa';
import { Modal, Button, Spinner, Form, ListGroup, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import axios from 'axios';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import "bootstrap/dist/css/bootstrap.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');

const styles = `
  :root {
    --primary-blue: #3b82f6;
    --secondary-blue: #2563eb;
    --primary-purple: #8b5cf6;
    --secondary-purple: #7c3aed;
    --primary-green: #10b981;
    --secondary-green: #059669;
  }

  .places-slider {
    padding: 20px 0;
    position: relative;
  }

  .gradient-header {
    background: linear-gradient(135deg, var(--primary-blue), var(--secondary-blue));
    color: white;
    border-radius: 15px;
  }

  .attraction-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border-radius: 15px;
    overflow: hidden;
    border: none;
    margin: 10px;
    background: white;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }

  .attraction-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px rgba(0,0,0,0.2);
  }

  .place-image {
    height: 250px;
    object-fit: cover;
    border-radius: 15px 15px 0 0;
  }

  .price-badge {
    background: var(--primary-purple);
    color: white;
    padding: 8px 15px;
    border-radius: 20px;
    font-size: 0.9rem;
  }

  .floating-add-btn {
    position: fixed;
    bottom: 30px;
    right: 30px;
    z-index: 1000;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--primary-green);
    border: none;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    transition: transform 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chat-container {
    height: 65vh;
    border-radius: 15px;
    background: #f0f2f5;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border: 1px solid #e5e7eb;
  }

  .chat-header {
    background: var(--primary-blue);
    color: white;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border-radius: 15px 15px 0 0;
  }

  .message-container {
    display: flex;
    margin-bottom: 15px;
    position: relative;
  }

  .message-bubble {
    max-width: 70%;
    padding: 12px 16px;
    border-radius: 1.25rem;
    position: relative;
    word-break: break-word;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .sent-message {
    flex-direction: row-reverse;
  }

  .sent-message .message-bubble {
    background: var(--primary-green);
    color: white;
    border-radius: 1.25rem 1.25rem 0 1.25rem;
  }

  .received-message .message-bubble {
    background: white;
    border-radius: 1.25rem 1.25rem 1.25rem 0;
  }

  .message-time {
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
  }

  .participant-list {
    background: white;
    padding: 1rem;
    border-radius: 15px;
    height: 65vh;
    overflow-y: auto;
  }

  .member-item {
    display: flex;
    align-items: center;
    padding: 12px;
    border-radius: 8px;
    transition: background 0.2s;
    gap: 12px;
  }

  .user-role-badge {
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 0.75rem;
  }

  .admin-badge {
    background: var(--primary-purple);
    color: white;
  }

  .parking-status {
    background: var(--primary-green);
    color: white;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 0.75rem;
  }

  .chat-input-container {
    background: white;
    padding: 16px;
    border-top: 1px solid #e9edef;
    display: flex;
    gap: 12px;
    align-items: center;
  }
`;

const PlacesCarousel = () => {
  const [places, setPlaces] = useState([]);
  const [groupPlans, setGroupPlans] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  
  const currentUser = {
    id: "smart_ke_WT_656759411",
    Name: "Neuro Apps Group",
    PhoneNumber: "0740045355",
    role: "USER",
    isAdmin: false,
    parkingRank: "Bronze",
    avatar: "https://ui-avatars.com/api/?name=Neuro+Apps+Group&background=random"
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 992, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } }
    ]
  };


  const BASE_URL = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [placesRes, plansRes] = await Promise.all([
          axios.get(`${BASE_URL}/places`),
          axios.get(`${BASE_URL}/plans`)
        ]);
        
        const enhancedPlans = plansRes.data.map(plan => ({
          ...plan,
          chat: [],
          creator: plan.participants.find(p => p.id === plan.creatorId)
        }));

        setPlaces(placesRes.data);
        setGroupPlans(enhancedPlans);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSendMessage = (planId, text) => {
    if (!text.trim()) return;

    const newMessage = {
      id: Date.now(),
      text,
      user: currentUser,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    setGroupPlans(prev => 
      prev.map(plan => 
        plan.id === planId 
          ? { ...plan, chat: [...plan.chat, newMessage] }
          : plan
      )
    );
    setMessageInput('');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="container py-5">
      <style>{styles}</style>

      <div className="gradient-header p-4 mb-5 text-center">
        <h1 className="display-4 fw-bold mb-3">Nairobi Explorer</h1>
        <p className="lead">Connect • Explore • Experience</p>
      </div>

      <Slider {...settings} className="places-slider">
        {places.map(place => (
          <div key={place.id} className="px-2">
            <div className="card h-100 attraction-card">
              <img 
                src={place.image} 
                className="card-img-top place-image"
                alt={place.name}
              />
              <div className="card-body">
                <h3 className="card-title fw-bold mb-3">{place.name}</h3>
                
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex gap-2">
                    <span className="price-badge">
                      Adult: KES {place.priceAdult}
                    </span>
                    <span className="price-badge">
                      Child: KES {place.priceChild}
                    </span>
                  </div>
                  <div className="d-flex align-items-center">
                    <FaStar className="text-warning me-1" />
                    <span>{place.rating || 'New'}</span>
                  </div>
                </div>

                <p className="card-text text-muted mb-4">{place.description}</p>

                <div className="d-flex justify-content-center mt-3">
                  <Button 
                    variant="primary"
                    onClick={() => setSelectedPlan(groupPlans.find(p => p.placeId === place.id))}
                    style={{ background: 'var(--primary-purple)', border: 'none' }}
                  >
                    <FaUsers className="me-2" />
                    View Group Plans
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>

      <PlanDetailsModal
        selectedPlan={selectedPlan}
        setSelectedPlan={setSelectedPlan}
        currentUser={currentUser}
        handleSendMessage={handleSendMessage}
        messageInput={messageInput}
        setMessageInput={setMessageInput}
      />

      <Button 
        variant="primary" 
        className="floating-add-btn"
        onClick={() => setShowGroupPlans(true)}
      >
        <FaPlus size={24} />
      </Button>
    </div>
  );
};

const PlanDetailsModal = ({ 
  selectedPlan, 
  setSelectedPlan,
  currentUser,
  handleSendMessage,
  messageInput,
  setMessageInput
}) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedPlan?.chat]);

  return (
    <Modal show={!!selectedPlan} onHide={() => setSelectedPlan(null)} size="xl">
      <div className="chat-header">
        <FaMapMarkerAlt className="flex-shrink-0" />
        <div>
          <h5 className="mb-0">{selectedPlan?.place?.name}</h5>
          <small>{selectedPlan?.participants?.length} participants</small>
        </div>
      </div>

      <Modal.Body>
        <div className="row g-4">
          <div className="col-md-8">
            <div className="chat-container">
              <div className="chat-messages p-3">
                {selectedPlan?.chat?.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`message-container ${
                      msg.user.id === currentUser.id ? 'sent-message' : 'received-message'
                    }`}
                  >
                    {msg.user.id !== currentUser.id && (
                      <div className="position-relative me-2">
                        <img 
                          src={msg.user.avatar}
                          className="rounded-circle"
                          style={{ width: '40px', height: '40px' }}
                          alt={msg.user.Name}
                        />
                        {msg.user.isAdmin && (
                          <FaCrown className="text-warning position-absolute bottom-0 end-0" />
                        )}
                      </div>
                    )}
                    <div className="message-bubble">
                      <p className="mb-0">{msg.text}</p>
                      <span className="message-time">
                        {timeAgo.format(new Date(msg.timestamp))}
                        {msg.user.id === currentUser.id && (
                          <span className="ms-2">
                            {msg.status === 'sent' ? <FaRegClock /> : <FaCheckDouble />}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(selectedPlan.id, messageInput);
                }} 
                className="chat-input-container"
              >
                <input
                  type="text"
                  className="form-control rounded-pill"
                  placeholder="Type a message"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                />
                <Button 
                  variant="primary" 
                  type="submit"
                  className="rounded-pill px-4"
                  style={{ 
                    background: 'var(--primary-purple)',
                    borderColor: 'var(--secondary-purple)'
                  }}
                >
                  <FaPaperPlane />
                </Button>
              </form>
            </div>
          </div>

          <div className="col-md-4">
            <div className="participant-list">
              <h5 className="mb-3"><FaUsers className="me-2" />Participants</h5>
              <div className="mb-4">
                <h6 className="text-muted mb-3">Organizer</h6>
                <div className="member-item bg-light rounded p-3">
                  <img 
                    src={selectedPlan?.creator?.avatar}
                    className="rounded-circle me-3"
                    style={{ width: '50px', height: '50px' }}
                    alt={selectedPlan?.creator?.Name}
                  />
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <strong>{selectedPlan?.creator?.Name}</strong>
                      <Badge bg="success">
                        <FaCheckCircle className="me-1" />
                        Verified
                      </Badge>
                    </div>
                    <small className="text-muted">{selectedPlan?.creator?.PhoneNumber}</small>
                    <div className="d-flex gap-2 mt-2">
                      <Badge className="user-role-badge admin-badge">
                        <FaCrown className="me-1" />
                        ADMIN
                      </Badge>
                      <Badge className="parking-status">
                        {selectedPlan?.creator?.parkingRank}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <h6 className="text-muted mb-3">Members</h6>
              <ListGroup variant="flush">
                {selectedPlan?.participants
                  ?.filter(p => p.id !== selectedPlan.creator.id)
                  ?.map((p, i) => (
                    <ListGroup.Item key={i} className="member-item border-0 px-0">
                      <div className="d-flex align-items-center">
                        <img 
                          src={p.avatar}
                          className="rounded-circle me-3"
                          style={{ width: '45px', height: '45px' }}
                          alt={p.Name}
                        />
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <span>{p.Name}</span>
                            {p.isAdmin && (
                              <Badge className="user-role-badge admin-badge">
                                <FaCrown className="me-1" />
                                ADMIN
                              </Badge>
                            )}
                          </div>
                          <small className="text-muted">{p.PhoneNumber}</small>
                          <div className="d-flex gap-2 mt-1">
                            <Badge className="user-role-badge user-badge">
                              <FaUserTag className="me-1" />
                              {p.role}
                            </Badge>
                            <Badge className="parking-status">
                              {p.parkingRank}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
              </ListGroup>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PlacesCarousel;