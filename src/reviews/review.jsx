import React, { useState, useEffect } from 'react';
import {
  Card, Form, Button, Spinner, Alert,
  Badge, Modal
} from 'react-bootstrap';
import {
  FaComment, FaThumbsUp, FaPaperPlane, FaBriefcase,
  FaUsers, FaPlus, FaStar, FaCalendarAlt, FaMapMarkerAlt,
  FaEnvelope, FaHandsHelping, FaMoneyBillWave, FaUser
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

  &:hover {
    background: ${props => props.$active ? '#2980b9' : '#f8f9fa'};
  }
`;

const Section = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
`;

const ReviewForm = styled.div`
  margin-bottom: 2rem;
  textarea {
    border-radius: 15px;
    padding: 1rem;
    margin-bottom: 1rem;
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

const StickerPicker = styled.div`
  display: flex;
  gap: 0.5rem;
  button {
    border: none;
    background: none;
    font-size: 1.5rem;
    padding: 0 0.5rem;
    cursor: pointer;
  }
`;

const ReviewCard = styled(Card)`
  margin-bottom: 1.5rem;
  border: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 1.5rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
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

const ReviewContent = styled.div`
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const Stickers = styled.div`
  font-size: 1.5rem;
  margin-top: 1rem;
`;

const ReviewActions = styled.div`
  display: flex;
  gap: 1rem;
  button {
    color: #6c757d;
    &:hover { color: #3498db; text-decoration: none; }
  }
`;

const ServiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const ServiceCard = styled(Card)`
  padding: 1.5rem;
  border: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  h4 { margin-bottom: 0.5rem; }
`;

const ServiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ServiceDetails = styled.div`
  color: #6c757d;
  margin-bottom: 1rem;
  div { margin-bottom: 0.5rem; }
`;

const JobForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const JobCard = styled(Card)`
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  h4 { margin-bottom: 0.5rem; }
`;

const JobDetails = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  color: #6c757d;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ReviewSection = () => {
  const [activeTab, setActiveTab] = useState('reviews');
  const [posts, setPosts] = useState([]);
  const [services, setServices] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    review: { content: '', stickers: [] },
    service: { type: 'cleaning', areas: [], rate: '' },
    job: { title: '', description: '', salary: '' },
    booking: { date: new Date(), time: '09:00', address: '' }
  });
  const [selectedService, setSelectedService] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const SERVICE_TYPES = ['Cleaning', 'Laundry', 'Cooking', 'Repairs', 'Childcare'];
  const STICKERS = ['👍', '❤️', '🚀', '💡', '🎉', '👏'];

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        setLoading(true);
        const [postsRes, servicesRes, jobsRes] = await Promise.all([
          axios.get('/api/reviews'),
          axios.get('/api/services'),
          axios.get('/api/jobs')
        ]);
        
        setPosts(Array.isArray(postsRes?.data) ? postsRes.data : []);
        setServices(Array.isArray(servicesRes?.data) ? servicesRes.data : []);
        setJobs(Array.isArray(jobsRes?.data) ? jobsRes.data : []);
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
    } catch (err) {
      setError('Failed to post review');
      console.error(err);
    }
  };

  const handleServiceSubmit = async () => {
    try {
      const newService = await axios.post('/api/services', formData.service);
      setServices(prev => [newService.data, ...prev]);
      setFormData(prev => ({...prev, service: { type: 'cleaning', areas: [], rate: '' }}));
    } catch (err) {
      setError('Service registration failed');
      console.error(err);
    }
  };

  const handleJobSubmit = async () => {
    try {
      const newJob = await axios.post('/api/jobs', formData.job);
      setJobs(prev => [newJob.data, ...prev]);
      setFormData(prev => ({...prev, job: { title: '', description: '', salary: '' }}));
    } catch (err) {
      setError('Job post failed');
      console.error(err);
    }
  };

  const PostCard = ({ post }) => (
    <ReviewCard>
      <UserInfo>
        <UserAvatar>
          {post?.author?.name?.[0] || <FaUser />}
        </UserAvatar>
        <div>
          <h5>{post?.author?.name || 'Anonymous'}</h5>
          <small>{new Date(post?.createdAt).toLocaleDateString()}</small>
        </div>
      </UserInfo>
      <ReviewContent>
        {post.content}
        <Stickers>{post.stickers?.join(' ')}</Stickers>
      </ReviewContent>
      <ReviewActions>
        <Button variant="link">
          <FaThumbsUp /> {post.likes?.length || 0}
        </Button>
        <Button variant="link">
          <FaComment /> {post.comments?.length || 0}
        </Button>
      </ReviewActions>
    </ReviewCard>
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
          <Section>
            <ReviewForm>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.review.content}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  review: { ...prev.review, content: e.target.value }
                }))}
                placeholder="Share your experience with the community..."
              />
              <ActionBar>
                <StickerPicker>
                  {STICKERS.map((sticker, i) => (
                    <button
                      key={i}
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        review: { 
                          ...prev.review, 
                          stickers: [...prev.review.stickers, sticker] 
                        }
                      }))}
                    >
                      {sticker}
                    </button>
                  ))}
                </StickerPicker>
                <Button variant="primary" onClick={handleReviewSubmit}>
                  <FaPaperPlane /> Post Review
                </Button>
              </ActionBar>
            </ReviewForm>

            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </Section>
        )}

        {activeTab === 'services' && (
          <Section>
            <div className="mb-4">
              <h4><FaHandsHelping /> Offer Your Service</h4>
              <Form.Select
                value={formData.service.type}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  service: { ...prev.service, type: e.target.value }
                }))}
                className="mb-2"
              >
                {SERVICE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Form.Select>
              <Button onClick={handleServiceSubmit} variant="success">
                <FaPlus /> Register Service
              </Button>
            </div>

            <ServiceGrid>
              {services.map(service => (
                <ServiceCard key={service.id}>
                  <ServiceHeader>
                    <h4>{service.type}</h4>
                    <Rating>
                      <FaStar className="text-warning" /> {service.rating || '4.5'}
                    </Rating>
                  </ServiceHeader>
                  <ServiceDetails>
                    <div><FaMapMarkerAlt /> {service.areas?.join(', ') || 'Nairobi'}</div>
                    <div><FaMoneyBillWave /> Ksh {service.rate}/hour</div>
                  </ServiceDetails>
                  <Button 
                    onClick={() => {
                      setSelectedService(service);
                      setShowBooking(true);
                    }}
                    variant="outline-primary"
                  >
                    <FaCalendarAlt /> Book Service
                  </Button>
                </ServiceCard>
              ))}
            </ServiceGrid>
          </Section>
        )}

        {activeTab === 'jobs' && (
          <Section>
            <JobForm>
              <Form.Control
                placeholder="Job Title"
                value={formData.job.title}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  job: { ...prev.job, title: e.target.value }
                }))}
                className="mb-2"
              />
              <Form.Control
                as="textarea"
                placeholder="Job Description"
                value={formData.job.description}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  job: { ...prev.job, description: e.target.value }
                }))}
                className="mb-2"
              />
              <Button onClick={handleJobSubmit} variant="primary">
                <FaBriefcase /> Post Job
              </Button>
            </JobForm>

            {jobs.map(job => (
              <JobCard key={job.id}>
                <h4>{job.title}</h4>
                <JobDetails>
                  <div>{job.company || 'Local Business'}</div>
                  <Badge bg="info">{job.type || 'Full-time'}</Badge>
                  <div>Ksh {job.salary}</div>
                </JobDetails>
                <p>{job.description}</p>
              </JobCard>
            ))}
          </Section>
        )}
      </ContentWrapper>

      <Modal show={showBooking} onHide={() => setShowBooking(false)}>
        <Modal.Header closeButton>
          <h3>Book {selectedService?.type} Service</h3>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="mb-3">
              <label>Date</label>
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
            <div className="mb-3">
              <label>Time</label>
              <Form.Control
                type="time"
                value={formData.booking.time}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  booking: { ...prev.booking, time: e.target.value }
                }))}
              />
            </div>
            <div className="mb-3">
              <label>Address</label>
              <Form.Control
                placeholder="Enter address"
                value={formData.booking.address}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  booking: { ...prev.booking, address: e.target.value }
                }))}
              />
            </div>
            <Button 
              onClick={handleServiceBooking} 
              variant="success" 
              className="w-100"
            >
              <FaEnvelope /> Confirm Booking
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {loading && (
        <LoadingOverlay>
          <Spinner animation="border" variant="primary" />
        </LoadingOverlay>
      )}
    </HubContainer>
  );
};

export default ReviewSection;