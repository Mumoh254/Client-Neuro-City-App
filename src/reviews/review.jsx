import React, { useState, useEffect } from 'react';
import {
  Card, Form, Button, Spinner, Alert,
  Badge, Modal, ListGroup
} from 'react-bootstrap';
import {
  FaComment, FaThumbsUp, FaPaperPlane, FaBriefcase,
  FaUsers, FaPlus, FaStar, FaCalendarAlt, FaMapMarkerAlt,
  FaEnvelope, FaHandsHelping, FaMoneyBillWave, FaUser,
  FaPhone, FaLink, FaClock, FaPen ,FaFacebook, FaTwitter, FaWhatsapp
} from 'react-icons/fa';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import styled from 'styled-components';
import 'react-datepicker/dist/react-datepicker.css';

const HubContainer = styled.div`
  background: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 120px;
`;

const ServiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
`;

const JobGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
`;

const ModernCard = styled(Card)`
  border: none;
  border-radius: 15px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const ServiceHeader = styled.div`
  background: linear-gradient(135deg, #3498db, #2c3e50);
  color: white;
  padding: 1rem;
  border-radius: 15px 15px 0 0;
`;

const JobHeader = styled.div`
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
  padding: 1rem;
  border-radius: 15px 15px 0 0;
`;

const LocationBadge = styled(Badge)`
  background-color: ${props => {
    const locations = {
      'Nairobi': '#e74c3c',
      'Westlands': '#9b59b6',
      'Kiambu': '#1abc9c',
      'default': '#3498db'
    };
    return locations[props.$location] || locations.default;
  }} !important;
  margin: 0.25rem;
`;


const StickyReviewForm = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 20px;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
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
  const LOCATIONS = ['Nairobi', 'Westlands', 'Kiambu',"pipeline" , "Kasarani" , "Eastlands" , "Kitusuri"  , "Kayole"  ,  "Dandora"  ,  "Kikuyu"  , 'Thika', 'Karen'];
  const RATE_TYPES = ['Per Hour', 'Per Day'];

  const [activeTab, setActiveTab] = useState('reviews');
  const [posts, setPosts] = useState([]);
  const [services, setServices] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    review: { content: '', stickers: [] },
    service: { 
      type: 'Cleaning', 
      rate: '',
      phone: '',
      email: '',
    },
    job: { 
      title: '', 
      description: '', 
      salary: '',
      type: 'Full-time',
      deadline: new Date(),
      contactEmail: '',
      link: ""
    },
    booking: { date: new Date(), time: '09:00', address: '' }
  });
  console.log(formData)
  const [selectedService, setSelectedService] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCommentInput, setShowCommentInput] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [showReviewForm, setShowReviewForm] = useState(false);


  const SERVICE_TYPES = ['Cleaning', 'Laundry', 'Cooking', 'Repairs', 'Childcare'];
  const STICKERS = ['👍', '❤️', '🚀', '💡', '🎉', '👏'];
  const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance'];


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [servicesRes, jobsRes] = await Promise.all([
          axios.get('https://sheetdb.io/api/v1/gu4zdm9nf6y1m'),
          axios.get('https://sheetdb.io/api/v1/0d0o21777vjlo')
        ]);
  
        console.log({
          message: "this is my response",
          jobs: jobsRes.data,
          services: servicesRes.data
        });
  
        // Make sure the data is an array
        const servicesData = Array.isArray(servicesRes.data) ? servicesRes.data : [];
        const jobsData = Array.isArray(jobsRes.data) ? jobsRes.data : [];
  
        setServices(servicesData.sort((a, b) => b.rating - a.rating));
        setJobs(jobsData);
  
        console.log('Services:', servicesData);
        console.log('Jobs:', jobsData);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  



  
    useEffect(() => {
      const fetchCommunityData = async () => {
        try {
          setLoading(true);
          const [postsRes ] = await Promise.all([
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
      await axios.post('https://sheetdb.io/api/v1/gu4zdm9nf6y1m', {
        ...formData.booking,
        serviceId: selectedService?.id
      });

      setShowBooking(false);
      setSuccess('Booking confirmed!');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Booking failed');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://sheetdb.io/api/v1/gu4zdm9nf6y1m', formData.review);
      setPosts(prev => [{...formData.review, id: Date.now()}, ...prev]);
      setFormData(prev => ({...prev, review: { content: '', stickers: [] }}));
      setSuccess('Review posted!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to post review');
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      const newService = { 
        ...formData.service, 
        rating: 0,
        id: Date.now() 
      };
      await axios.post('https://sheetdb.io/api/v1/gu4zdm9nf6y1m', newService);
      setServices(prev => [newService, ...prev]);
      setFormData(prev => ({ ...prev, service: { type: 'Cleaning', rate: '', phone: '', email: '' }}));
      setSuccess('Service registered!');
    } catch (err) {
      setError('Service registration failed');
    }
  };
  const handleJobSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare the job data, including the unique id and the form data
      const newJob = { ...formData.job, id: Date.now() };
  
      // Post to the SheetDB API (make sure you use the correct endpoint)
      const response = await axios.post('https://sheetdb.io/api/v1/0d0o21777vjlo', [newJob]);
  
      // If successful, update the jobs state and reset form data
      if (response.status === 200) {
        setJobs(prev => [newJob, ...prev]);
        setFormData(prev => ({ 
          ...prev, 
          job: { 
            title: '', 
            description: '', 
            salary: '', 
            type: 'Full-time', 
            deadline: new Date(), 
            contactEmail: '' 
          }
        }));
  
        setSuccess('Job posted!');
      } else {
        setError('Job post failed');
      }
    } catch (err) {
      console.error(err);  // Log the error for better debugging
      setError('Job post failed');
    }
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

  const rateService = async (serviceId, rating) => {
    try {
      const updated = services.map(s => 
        s.id === serviceId ? { ...s, rating: s.rating + rating } : s
      );
      setServices(updated);
      await axios.patch(`https://sheetdb.io/api/v1/YOUR_SHEET_ID/${serviceId}`, {
        rating: rating
      });
    } catch (err) {
      setError('Rating failed');
    }
  };


  const [showComments, setShowComments] = useState({});


const handleToggleCommentInput = (postId) => {
  setShowComments((prev) => ({
    ...prev,
    [postId]: !prev[postId]
  }));
};


const ServiceCard = ({ service }) => (
  <ModernCard>
    <ServiceHeader>
      <div className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">{service.type}</h5>
        {service.likes >= 200 && (
          <FaCheckCircle className="text-warning" title="Verified Service" />
        )}
      </div>
      <LocationBadge $location={service.location} pill>
        {service.location}
      </LocationBadge>
    </ServiceHeader>
    <Card.Body>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <FaMoneyBillWave className="me-2" />
          <strong>Ksh {service.rate}</strong>
          <small className="text-muted">/{service.rateType}</small>
        </div>
        <div className="d-flex align-items-center">
          <Button variant="link" onClick={() => rateService(service.id, 1)}>
            <FaThumbsUp className="text-primary" /> 
            <span>{service.likes || 0}</span>
          </Button>
        </div>
      </div>
      
      <div className="mb-3">
        <FaMapMarkerAlt className="me-2" />
        {service.areas?.join(', ') || 'Nairobi'}
      </div>

      <div className="contact-section">
        <h6 className="text-muted">Contact:</h6>
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
      </div>

      <Button 
        variant="outline-primary" 
        className="w-100 mt-2"
        onClick={() => {
          setSelectedService(service);
          setShowBooking(true);
        }}
      >
        <FaCalendarAlt className="me-2" /> Book Service
      </Button>
    </Card.Body>
  </ModernCard>
);

  const JobCard = ({ job }) => (
    <ModernCard>
      <JobHeader>
        <h5 className="mb-0">{job.title}</h5>
        <div className="d-flex align-items-center mt-2">
          <LocationBadge $location={job.location} pill>
            {job.location}
          </LocationBadge>
          <Badge bg="light" text="dark" pill>
            {job.type}
          </Badge>
        </div>
      </JobHeader>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <FaMoneyBillWave className="me-2" />
            <strong>Ksh {job.salary}</strong>
          </div>
          <div>
            <FaClock className="me-2" />
            {new Date(job.deadline).toLocaleDateString()}
          </div>
        </div>

        <p className="text-muted">{job.description}</p>

        <div className="d-flex gap-2">
          {job.applicationLink && (
            <Button 
              variant="primary" 
              className="d-flex align-items-center"
              href={job.applicationLink}
              target="_blank"
            >
              <FaLink className="me-2" /> Apply Online
            </Button>
          )}
          {job.contactEmail && (
            <Button 
              variant="outline-primary" 
              className="d-flex align-items-center"
              href={`mailto:${job.contactEmail}`}
            >
              <FaEnvelope className="me-2" /> Email
            </Button>
          )}
        </div>
      </Card.Body>
    </ModernCard>
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
            {showComments[post.id] ? 'Hide Comments' : 'Show Comments'} ({post.comments?.length || 0})
          </Button>
        </div>
        <small className="text-muted">{post.location || 'Nairobi'}</small>
      </div>
  
      {showComments[post.id] && (
        <>
          <div className="comments mt-3">
            {post.comments?.length > 0 ? (
              post.comments.map(comment => (
                <CommentBubble key={comment.id}>
                  <div className="d-flex align-items-center mb-1">
                    <small className="fw-bold me-2">{comment.author?.name}</small>
                    <small className="text-muted">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  <p className="mb-0">{comment.content}</p>
                </CommentBubble>
              ))
            ) : (
              <small className="text-muted">No comments yet.</small>
            )}
          </div>
  
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
        </>
      )}
    </PostBubble>
  );
  


  return (
    <HubContainer>
      <HeroSection>
        <h1>Nairobi Community Hub</h1>
        <p>Connect through services, jobs, and community support</p>
      </HeroSection>

      <ContentWrapper>
        <NavBar>
          <NavButton $active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')}>
            <FaComment /> Reviews
          </NavButton>
          <NavButton $active={activeTab === 'services'} onClick={() => setActiveTab('services')}>
            <FaUsers /> Services
          </NavButton>
          <NavButton $active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')}>
            <FaBriefcase /> Jobs
          </NavButton>
        </NavBar>

        {error && <Alert variant="danger" dismissible>{error}</Alert>}
        {success && <Alert variant="success" dismissible>{success}</Alert>}

        {activeTab === 'reviews' && (
          <ChatContainer>
            {posts.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))}
          </ChatContainer>
        )}

        {activeTab === 'services' && (
          <div>
            <Card className="mb-4">
            <Card.Body>
  <h4><FaStar className="text-warning me-2" /> Top Rated Services</h4>
  {Array.isArray(services) && services.length > 0 ? (
    services.map(service => <ServiceCard key={service.id} service={service} />)
  ) : (
    <Alert variant="info">No services available</Alert>
  )}
</Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Body>
                <h4><FaPlus /> Register Service</h4>
                <Form onSubmit={handleServiceSubmit}>
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
                  <Form.Control
                    type="tel"
                    placeholder="Phone Number *"
                    required
                    value={formData.service.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      service: { ...prev.service, phone: e.target.value }
                    }))}
                    className="mb-3"
                  />
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    value={formData.service.email}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      service: { ...prev.service, email: e.target.value }
                    }))}
                    className="mb-3"
                  />
                  <Form.Control
                    type="number"
                    placeholder="Rate per hour (Ksh)"
                    value={formData.service.rate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      service: { ...prev.service, rate: e.target.value }
                    }))}
                    className="mb-3"
                  />
                  <Button type="submit" variant="success" className="w-100">
                    <FaPlus /> Register
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div>
            <Card className="mb-4">
              <Card.Body>
                <h4><FaBriefcase /> Job Board</h4>
                {(Array.isArray(jobs) && jobs.length > 0) ? (
  jobs.map(job => <JobCard key={job.id} job={job} />)
) : (
  <Alert variant="info">No jobs available</Alert>
)}

              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Body>
                <h4><FaPlus /> Post Job</h4>
                <Form onSubmit={handleJobSubmit}>
                  <Form.Control
                    placeholder="Job Title *"
                    value={formData.job.title}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      job: { ...prev.job, title: e.target.value }
                    }))}
                    className="mb-3"
                    required
                  />
                  <Form.Select
                    value={formData.job.type}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      job: { ...prev.job, type: e.target.value }
                    }))}
                    className="mb-3"
                  >
                    {JOB_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Form.Select>
                  <Form.Control
                    type="number"
                    placeholder="Salary (Ksh)"
                    value={formData.job.salary}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      job: { ...prev.job, salary: e.target.value }
                    }))}
                    className="mb-3"
                  />
                  <DatePicker
                    selected={formData.job.deadline}
                    onChange={date => setFormData(prev => ({
                      ...prev,
                      job: { ...prev.job, deadline: date }
                    }))}
                    minDate={new Date()}
                    placeholderText="Application Deadline"
                    className="form-control mb-3"
                  />
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Job Description *"
                    value={formData.job.description}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      job: { ...prev.job, description: e.target.value }
                    }))}
                    className="mb-3"
                    required
                  />
                  <Form.Control
                    type="email"
                    placeholder="Contact Email *"
                    value={formData.job.contactEmail}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      job: { ...prev.job, contactEmail: e.target.value }
                    }))}
                    className="mb-3"
                    required
                  />
                  <Button type="submit" variant="primary" className="w-100">
                    <FaPaperPlane /> Post Job
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </div>
        )}

{activeTab === 'reviews' && (
  <>
    {!showReviewForm ? (
      <div className="review-toggle-btn">
        <Button variant="dark" size="sm" onClick={() => setShowReviewForm(true)}>
          <FaPen className="me-1" /> Post Review
        </Button>
      </div>
    ) : (
      <StickyReviewForm className=" mg ml-5 custom-sticky-review d-flex w-100 justify-content-centre"   >
        <Card>
          <Card.Body>
            <Form onSubmit={handleReviewSubmit}>
              <Form.Control
                as="textarea"
                rows={1}
                value={formData.review.content}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    review: { ...prev.review, content: e.target.value },
                  }))
                }
                placeholder="Share your experience..."
                className="mb-2"
              />
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex gap-2 flex-wrap">
                  {STICKERS.map((sticker, i) => (
                    <Button
                      key={i}
                      variant="outline-secondary"
                      className="p-1"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          review: {
                            ...prev.review,
                            stickers: [...prev.review.stickers, sticker],
                          },
                        }))
                      }
                    >
                      {sticker}
                    </Button>
                  ))}
                </div>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    <FaPaperPlane /> Post
                  </Button>
                </div>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </StickyReviewForm>
    )}
  </>
)}

      </ContentWrapper>

      <Modal show={showBooking} onHide={() => setShowBooking(false)} size="lg">
        <Modal.Header closeButton>
          <h3>Book {selectedService?.type}</h3>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <DatePicker
                  selected={formData.booking.date}
                  onChange={date => setFormData(prev => ({
                    ...prev,
                    booking: { ...prev.booking, date }
                  }))}
                  minDate={new Date()}
                  className="form-control"
                  placeholderText="Select date"
                />
              </div>
              <div className="col-md-6">
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
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter address"
              value={formData.booking.address}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                booking: { ...prev.booking, address: e.target.value }
              }))}
              className="mb-4"
            />
            <Button 
              variant="success" 
              className="w-100"
              onClick={handleServiceBooking}
            >
              Confirm Booking
            </Button>
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