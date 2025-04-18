import React, { useState, useEffect } from 'react';
import {
  Card, Form, Button, Spinner, Alert,
  Badge, Modal, ListGroup
} from 'react-bootstrap';
import {
  FaComment, FaThumbsUp, FaPaperPlane, FaBriefcase,
  FaUsers, FaPlus, FaStar, FaCalendarAlt, FaMapMarkerAlt,
  FaEnvelope, FaHandsHelping, FaMoneyBillWave, FaUser,
  FaPhone, FaLink, FaClock, FaFacebook, FaTwitter, FaWhatsapp
} from 'react-icons/fa';
import axios from 'axios';
import emailjs from 'emailjs-com';
import DatePicker from 'react-datepicker';
import styled from 'styled-components';
import 'react-datepicker/dist/react-datepicker.css';

// Styled Components
const HubContainer = styled.div`
  background: #f8f9fa;
  min-height: 100vh;
`;

const HeroSection = styled.div`
  background: linear-gradient(135deg, #2c3e50, #3498db);
  color: white;
  padding: 4rem 2rem;
  text-align: center;
  
  h1 { font-weight: 300; margin-bottom: 1rem; }
  p { font-size: 1.2rem; opacity: 0.9; }
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const ChatContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const PostBubble = styled.div`
  background: ${props => props.$even ? '#DCF8C6' : '#FFFFFF'};
  border-radius: 15px;
  padding: 15px;
  margin: 10px 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  position: relative;
  &::after {
    content: '';
    position: absolute;
    left: ${props => props.$even ? '-10px' : 'auto'};
    right: ${props => props.$even ? 'auto' : '-10px'};
    top: 15px;
    width: 0;
    height: 0;
    border: 10px solid transparent;
    border-right-color: ${props => props.$even ? '#DCF8C6' : '#FFFFFF'};
    border-left-color: ${props => props.$even ? 'transparent' : '#FFFFFF'};
    transform: ${props => props.$even ? 'rotate(180deg)' : 'none'};
  }
`;

const CommentBubble = styled.div`
  background: #f0f2f5;
  border-radius: 15px;
  padding: 10px;
  margin: 5px 0 5px 20px;
  font-size: 0.9em;
`;

const ServiceCardWrapper = styled(Card)`
  margin: 15px 0;
  border-radius: 15px;
  transition: transform 0.2s;
  &:hover { transform: translateY(-5px); }
`;

const JobCardWrapper = styled(Card)`
  margin: 15px 0;
  border-left: 4px solid #3498db;
  border-radius: 8px;
`;

const NavBar = styled.nav`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  background: white;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const NavButton = styled.button`
  border: none;
  background: ${props => props.$active ? '#3498db' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#2c3e50'};
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover { background: ${props => props.$active ? '#2980b9' : '#f8f9fa'}; }
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`;

const ReviewSection = () => {
  const [activeTab, setActiveTab] = useState('reviews');
  const [posts, setPosts] = useState([]);
  const [services, setServices] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    review: { content: '', stickers: [] },
    service: { 
      type: 'Cleaning', 
      areas: [], 
      rate: '',
      phone: '',
      email: '',
      socialMedia: { facebook: '', whatsapp: '' }
    },
    job: { 
      title: '', 
      description: '', 
      salary: '',
      type: 'Full-time',
      startDate: new Date(),
      deadline: new Date(),
      applicationLink: '',
      contactEmail: ''
    },
    booking: { date: new Date(), time: '09:00', address: '' }
  });
  const [selectedService, setSelectedService] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCommentInput, setShowCommentInput] = useState({});
  const [commentTexts, setCommentTexts] = useState({});

  const SERVICE_TYPES = ['Cleaning', 'Laundry', 'Cooking', 'Repairs', 'Childcare'];
  const STICKERS = ['👍', '❤️', '🚀', '💡', '🎉', '👏'];
  const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance'];

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        setLoading(true);
        const [postsRes, servicesRes, jobsRes] = await Promise.all([
          axios.get('http://localhost:8000/apiV1/smartcity-ke/posts'),
          axios.get('/api/services'),
          axios.get('/api/jobs')
        ]);
        
        setPosts(postsRes?.data || []);
        setServices(servicesRes?.data || []);
        setJobs(jobsRes?.data || []);
      } catch (err) {
        setError('Failed to load community data');
      } finally {
        setLoading(false);
      }
    };
    fetchCommunityData();
  }, []);

  const handleServiceBooking = async () => {
    try {
      await axios.post('/api/bookings', {
        ...formData.booking,
        serviceId: selectedService?.id
      });

      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        {
          to_email: selectedService?.email,
          service_type: selectedService?.type,
          date: formData.booking.date.toLocaleDateString(),
          time: formData.booking.time,
          address: formData.booking.address
        },
        process.env.REACT_APP_EMAILJS_USER_ID
      );

      setShowBooking(false);
      setSuccess('Booking confirmed! Service provider notified');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Booking failed. Please try again.');
      console.error(err);
    }
  };

  const handleReviewSubmit = async () => {
    try {
      const newPost = await axios.post('/api/reviews', formData.review);
      setPosts(prev => [newPost.data, ...prev]);
      setFormData(prev => ({...prev, review: { content: '', stickers: [] }}));
      setSuccess('Review posted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to post review');
      console.error(err);
    }
  };

  const handleServiceSubmit = async () => {
    try {
      const newService = await axios.post('/api/services', formData.service);
      setServices(prev => [newService.data, ...prev]);
      setFormData(prev => ({
        ...prev, 
        service: { 
          ...prev.service,
          type: 'Cleaning',
          areas: [],
          rate: '',
          phone: '',
          email: '',
          socialMedia: { facebook: '', whatsapp: '' }
        }
      }));
      setSuccess('Service registered successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Service registration failed');
      console.error(err);
    }
  };

  const handleJobSubmit = async () => {
    try {
      const newJob = await axios.post('/api/jobs', formData.job);
      setJobs(prev => [newJob.data, ...prev]);
      setFormData(prev => ({
        ...prev, 
        job: { 
          title: '', 
          description: '', 
          salary: '',
          type: 'Full-time',
          startDate: new Date(),
          deadline: new Date(),
          applicationLink: '',
          contactEmail: ''
        }
      }));
      setSuccess('Job posted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Job post failed');
      console.error(err);
    }
  };

  const handleToggleCommentInput = (postId) => {
    setShowCommentInput(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleCommentTextChange = (postId, text) => {
    setCommentTexts(prev => ({
      ...prev,
      [postId]: text
    }));
  };

  const handleCommentSubmit = async (postId) => {
    const content = commentTexts[postId];
    if (!content?.trim()) return;

    try {
      const newComment = await axios.post(`/api/posts/${postId}/comments`, {
        content,
        author: { name: "Current User" } // Replace with actual user data
      });

      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                comments: [...(post.comments || []), newComment.data] 
              }
            : post
        )
      );

      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
      setShowCommentInput(prev => ({ ...prev, [postId]: false }));
      setSuccess('Comment posted successfully!');
    } catch (err) {
      setError('Failed to post comment');
    }
  };

  const ServiceCard = ({ service, index }) => (
    <ServiceCardWrapper>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>{service.type}</h4>
          <div className="d-flex align-items-center">
            <FaStar className="text-warning me-1" /> 
            <span>{service.rating || '4.5'}</span>
          </div>
        </div>
        
        <div className="mb-3">
          <FaMapMarkerAlt className="me-2" />
          {service.areas?.join(', ') || 'Nairobi'}
        </div>
        
        <div className="mb-3">
          <FaMoneyBillWave className="me-2" />
          Ksh {service.rate}/hour
        </div>

        <div className="contact-section mb-4">
          <h5>Contact Information:</h5>
          <div className="d-flex align-items-center mb-2">
            <FaPhone className="me-2" />
            <a href={`tel:${service.phone}`} className="text-decoration-none">
              {service.phone}
            </a>
          </div>
          {service.email && (
            <div className="d-flex align-items-center mb-2">
              <FaEnvelope className="me-2" />
              <a href={`mailto:${service.email}`} className="text-decoration-none">
                {service.email}
              </a>
            </div>
          )}
          <div className="social-links d-flex gap-2 mt-2">
            {service.socialMedia?.facebook && (
              <a href={service.socialMedia.facebook} target="_blank" rel="noopener noreferrer">
                <FaFacebook className="text-primary fs-5" />
              </a>
            )}
            {service.socialMedia?.whatsapp && (
              <a href={`https://wa.me/${service.socialMedia.whatsapp}`} target="_blank" rel="noopener noreferrer">
                <FaWhatsapp className="text-success fs-5" />
              </a>
            )}
          </div>
        </div>

        <Button 
          variant="outline-primary" 
          className="w-100"
          onClick={() => {
            setSelectedService(service);
            setShowBooking(true);
          }}
        >
          <FaCalendarAlt className="me-2" /> Book Service
        </Button>
      </Card.Body>
    </ServiceCardWrapper>
  );

  const JobCard = ({ job, index }) => (
    <JobCardWrapper>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>{job.title}</h4>
          <Badge bg="info">{job.type || 'Full-time'}</Badge>
        </div>
        
        <div className="d-flex flex-wrap gap-3 mb-3 text-muted">
          <div>
            <FaMoneyBillWave className="me-2" />
            Ksh {job.salary}
          </div>
          <div>
            <FaCalendarAlt className="me-2" />
            Start: {new Date(job.startDate).toLocaleDateString()}
          </div>
          <div>
            <FaClock className="me-2" />
            Apply by: {new Date(job.deadline).toLocaleDateString()}
          </div>
        </div>

        <p className="mb-3">{job.description}</p>

        <div className="d-flex flex-wrap gap-2">
          {job.applicationLink && (
            <Button 
              variant="primary" 
              onClick={() => window.open(job.applicationLink, '_blank')}
              className="d-flex align-items-center"
            >
              <FaLink className="me-2" /> Apply Online
            </Button>
          )}
          {job.contactEmail && (
            <Button 
              variant="outline-primary" 
              onClick={() => window.location.href = `mailto:${job.contactEmail}`}
              className="d-flex align-items-center"
            >
              <FaEnvelope className="me-2" /> Email Application
            </Button>
          )}
        </div>
      </Card.Body>
    </JobCardWrapper>
  );

  const PostCard = ({ post, index }) => (
    <PostBubble $even={index % 2 === 0}>
      <div className="d-flex align-items-center mb-2">
        <UserAvatar>
          {post.author?.name?.[0] || <FaUser />}
        </UserAvatar>
        <div className="ms-3">
          <h5 className="mb-0">{post.author?.name || 'Anonymous'}</h5>
          <small className="text-muted">
            {new Date(post.createdAt).toLocaleDateString()}
          </small>
        </div>
      </div>

      <p className="mb-2">{post.content}</p>
      
      {post.stickers?.length > 0 && (
        <div className="stickers mb-2">
          {post.stickers.map((sticker, i) => (
            <span key={i} className="me-2">{sticker}</span>
          ))}
        </div>
      )}

      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex gap-2">
          <Button variant="link" className="p-0">
            <FaThumbsUp /> {post.likes?.length || 0}
          </Button>
          <Button 
            variant="link" 
            className="p-0"
            onClick={() => handleToggleCommentInput(post.id)}
          >
            <FaComment /> {post.comments?.length || 0}
          </Button>
        </div>
        <small className="text-muted">{post.location || 'Nairobi'}</small>
      </div>

      {post.comments?.length > 0 && (
        <div className="comments mt-3">
          {post.comments.map(comment => (
            <CommentBubble key={comment.id}>
              <div className="d-flex align-items-center mb-1">
                <small className="fw-bold me-2">{comment.author?.name}</small>
                <small className="text-muted">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </small>
              </div>
              <p className="mb-0">{comment.content}</p>
            </CommentBubble>
          ))}
        </div>
      )}

      {showCommentInput[post.id] && (
        <div className="comment-input mt-3">
          <Form.Control
            as="textarea"
            rows={2}
            value={commentTexts[post.id] || ''}
            onChange={(e) => handleCommentTextChange(post.id, e.target.value)}
            placeholder="Write a comment..."
            className="mb-2"
          />
          <div className="d-flex justify-content-end gap-2">
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => handleToggleCommentInput(post.id)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => handleCommentSubmit(post.id)}
            >
              Post Comment
            </Button>
          </div>
        </div>
      )}
    </PostBubble>
  );

  return (
    <HubContainer>
      <HeroSection>
        <h1>Nairobi Community Empowerment Hub</h1>
        <p>Connecting Nairobians through services, jobs, and community support</p>
      </HeroSection>

      <ContentWrapper>
        <NavBar>
          <NavButton 
            $active={activeTab === 'reviews'} 
            onClick={() => setActiveTab('reviews')}
          >
            <FaComment /> Community Reviews
          </NavButton>
          <NavButton 
            $active={activeTab === 'services'} 
            onClick={() => setActiveTab('services')}
          >
            <FaUsers /> Mamafua Services
          </NavButton>
          <NavButton 
            $active={activeTab === 'jobs'} 
            onClick={() => setActiveTab('jobs')}
          >
            <FaBriefcase /> Job Board
          </NavButton>
        </NavBar>

        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

        {activeTab === 'reviews' && (
          <ChatContainer>
            <Card className="mb-4">
              <Card.Body>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.review.content}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    review: { ...prev.review, content: e.target.value }
                  }))}
                  placeholder="Share your experience with the community..."
                  className="mb-3"
                />
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex gap-2">
                    {STICKERS.map((sticker, i) => (
                      <Button
                        key={i}
                        variant="outline-secondary"
                        className="p-1"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          review: { 
                            ...prev.review, 
                            stickers: [...prev.review.stickers, sticker] 
                          }
                        }))}
                      >
                        {sticker}
                      </Button>
                    ))}
                  </div>
                  <Button variant="primary" onClick={handleReviewSubmit}>
                    <FaPaperPlane /> Post Review
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {posts.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))}
          </ChatContainer>
        )}

        {activeTab === 'services' && (
          <div>
            <Card className="mb-4">
              <Card.Body>
                <h4><FaHandsHelping /> Register Your Service</h4>
                <Form.Select
                  value={formData.service.type}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    service: { ...prev.service, type: e.target.value }
                  }))}
                  className="mb-3"
                >
                  {SERVICE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Form.Select>
                
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <Form.Control
                      type="tel"
                      placeholder="Phone Number *"
                      required
                      value={formData.service.phone}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        service: { ...prev.service, phone: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <Form.Control
                      type="email"
                      placeholder="Email (optional)"
                      value={formData.service.email}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        service: { ...prev.service, email: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <Form.Control
                      placeholder="Facebook Profile (optional)"
                      value={formData.service.socialMedia.facebook}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        service: { 
                          ...prev.service, 
                          socialMedia: {
                            ...prev.service.socialMedia,
                            facebook: e.target.value
                          }
                        }
                      }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <Form.Control
                      placeholder="WhatsApp Number (optional)"
                      value={formData.service.socialMedia.whatsapp}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        service: { 
                          ...prev.service, 
                          socialMedia: {
                            ...prev.service.socialMedia,
                            whatsapp: e.target.value
                          }
                        }
                      }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleServiceSubmit} 
                  variant="success" 
                  className="w-100"
                >
                  <FaPlus /> Register Service
                </Button>
              </Card.Body>
            </Card>

            <div>
              {services.map((service, index) => (
                <ServiceCard key={service.id} service={service} index={index} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div>
            <Card className="mb-4">
              <Card.Body>
                <h4><FaBriefcase /> Post a Job Opportunity</h4>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <Form.Control
                      placeholder="Job Title *"
                      value={formData.job.title}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        job: { ...prev.job, title: e.target.value }
                      }))}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <Form.Select
                      value={formData.job.type}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        job: { ...prev.job, type: e.target.value }
                      }))}
                    >
                      {JOB_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </Form.Select>
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <Form.Control
                      type="number"
                      placeholder="Salary (Ksh) *"
                      value={formData.job.salary}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        job: { ...prev.job, salary: e.target.value }
                      }))}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <DatePicker
                      selected={formData.job.deadline}
                      onChange={date => setFormData(prev => ({
                        ...prev,
                        job: { ...prev.job, deadline: date }
                      }))}
                      minDate={new Date()}
                      placeholderText="Application Deadline *"
                      className="form-control"
                    />
                  </div>
                </div>

                <Form.Control
                  as="textarea"
                  placeholder="Job Description *"
                  rows={4}
                  className="mb-3"
                  value={formData.job.description}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    job: { ...prev.job, description: e.target.value }
                  }))}
                  required
                />

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <Form.Control
                      type="url"
                      placeholder="Application Link (optional)"
                      value={formData.job.applicationLink}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        job: { ...prev.job, applicationLink: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <Form.Control
                      type="email"
                      placeholder="Contact Email *"
                      value={formData.job.contactEmail}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        job: { ...prev.job, contactEmail: e.target.value }
                      }))}
                      required
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleJobSubmit} 
                  variant="primary" 
                  className="w-100"
                >
                  <FaPaperPlane /> Post Job
                </Button>
              </Card.Body>
            </Card>

            <div>
              {jobs.map((job, index) => (
                <JobCard key={job.id} job={job} index={index} />
              ))}
            </div>
          </div>
        )}
      </ContentWrapper>

      <Modal show={showBooking} onHide={() => setShowBooking(false)} size="lg">
        <Modal.Header closeButton>
          <h3>Book {selectedService?.type} Service</h3>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label">Date</label>
                <DatePicker
                  selected={formData.booking.date}
                  onChange={date => setFormData(prev => ({
                    ...prev,
                    booking: { ...prev.booking, date }
                  }))}
                  minDate={new Date()}
                  className="form-control"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Time</label>
                <Form.Control
                  type="time"
                  value={formData.booking.time}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    booking: { ...prev.booking, time: e.target.value }
                  }))}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Address</label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter full address"
                value={formData.booking.address}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  booking: { ...prev.booking, address: e.target.value }
                }))}
              />
            </div>

            <div className="d-grid">
              <Button 
                onClick={handleServiceBooking} 
                variant="success" 
                size="lg"
              >
                <FaEnvelope className="me-2" /> Confirm Booking
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {loading && (
        <div className="position-fixed top-0 start-0 vw-100 vh-100 d-flex align-items-center justify-content-center bg-light bg-opacity-75">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        </div>
      )}
    </HubContainer>
  );
};

export default ReviewSection; 