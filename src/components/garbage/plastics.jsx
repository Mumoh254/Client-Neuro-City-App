import React, { useState, useEffect } from 'react';
import { 
  Card, Button, ListGroup, Badge, Alert, Spinner, 
  ProgressBar, Row, Col, Modal, Form, Stack 
} from 'react-bootstrap';
import { 
  Recycle, Clock, CheckCircle, Trophy, 
  Coin, Globe, Lightbulb, Person 
} from 'react-bootstrap-icons';
import styled from 'styled-components';
import axios from 'axios';

import { getUserIdFromToken  , getUserNameFromToken} from '../handler/tokenDecoder';



const EcoCard = styled(Card)`
  background: ${props => props.theme === 'dark' ? '#2d2d2d' : '#fff'};
  border-radius: 16px;
  border: none;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-3px);
  }
`;

const PlasticRecyclingApp = ({ theme = 'light' }) => {

const [username, setUsername] = useState('');
const [userRole, setUserRole] = useState('');

const   BASE_URL  =  'https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke'

  const [submissions, setSubmissions] = useState([]);
  const [user, setUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitAmount, setSubmitAmount] = useState('');
  const [carbonData, setCarbonData] = useState(null);

  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  const sendNotification = (title, options) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options);
    }
  };

    const [userId, setUserId] = useState(null);
  
    useEffect(() => {
      const userId = getUserIdFromToken();
      console.log('User ID:', userId);
      setUserId(userId); 
    }, []);


     // Fetch user ID from localStorage
  useEffect(() => {
   
    if (userId) {
      setUser(userId); // Set the userId from localStorage
    }
  }, []);

  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

 
   
useEffect(() => {
  const fetchData = async () => {
    try {
      // First get user data
      const userRes = await axios.get('/apiV1/smartcity-ke/user'); 
      const userId2 =  userId; // Use actual user ID from response

      // Then fetch user-specific data
      const [submissionsRes, leaderboardRes, carbonRes] = await Promise.all([
        axios.get(`${BASE_URL}/submission-requests?userId=${userId}`),
        axios.get(`${BASE_URL}/leaderboard`),
        axios.get(`${BASE_URL}/analytics-carbon`),
      ]);

      // Update state with responses
      setUser(userRes.data);
      setSubmissions(submissionsRes.data);
      setLeaderboard(leaderboardRes.data);
      setCarbonData(leaderboardRes.data);

      console.log(carbonRes.data)

    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      // Add error state handling here
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
  
const handleSubmit = async () => {
  if (submitAmount > 0) {
    try {
      const response = await axios.post(`${BASE_URL}/submission`, {
        userId: userId, // or user.id depending on your setup
        amount: parseFloat(submitAmount),
      });

      setSubmissions([response.data, ...submissions]);
      setUser(prev => ({
        ...prev,
        totalKg: prev.totalKg + response.data.amount,
        points: prev.points + Math.floor(response.data.amount * 10),
        impact: prev.impact + response.data.co2Saved
      }));

      setShowSubmitModal(false);
      setSubmitAmount('');

      sendNotification('Submission Received', {
        body: `${response.data.amount}kg submission recorded!`,
        icon: '/logo.png'
      });
    } catch (error) {
      console.error('Submission failed:', error);
      sendNotification('Submission Error', {
        body: 'Failed to submit recycling data'
      });
    }
  }
};


  if (loading || !user) return (
    <div className="d-flex justify-content-center mt-5">
      <Spinner animation="border" variant="success" />
    </div>
  );

  return (
    <div className="container-lg py-4">
      <Row className="g-4 mb-4">
        <Col xs={12}>
          <EcoCard theme={theme}>
            <Card.Body className="py-4">
              <Stack direction="horizontal" gap={3} className="flex-wrap">
                <div className="bg-success p-3 rounded-circle">
                  <Person size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="mb-1">{username}</h2>
                  <div className="text-muted">Global Rank: #{user.rank}</div>
                </div>
                <div className="ms-auto d-flex gap-3">
                  <div className="text-center">
                    <div className="h4 mb-0 text-success">{user.totalKg}kg</div>
                    <small className="text-muted">Recycled</small>
                  </div>
                  <div className="text-center">
                    <div className="h4 mb-0 text-warning">{user.points}</div>
                    <small className="text-muted">Eco Points</small>
                  </div>
                </div>
              </Stack>
            </Card.Body>
          </EcoCard>
        </Col>

        <Col md={4}>
          <EcoCard theme={theme} className="h-100">
            <Card.Body>
              <h5 className="d-flex align-items-center gap-2 mb-3">
                <Globe className="text-success" /> Environmental Impact
              </h5>
              <div className="text-center py-4">
                <div className="display-4 text-success">{user.impact}</div>
                <small className="text-muted">kg CO2 prevented</small>
              </div>
              <ProgressBar now={(user.totalKg / user.nextLevel) * 100} 
                variant="success" className="mb-3" />
              <div className="text-muted small text-center">
                Level {user.level} Progress ({user.totalKg}/{user.nextLevel}kg)
              </div>
            </Card.Body>
          </EcoCard>
        </Col>

        <Col md={4}>
          <EcoCard theme={theme} className="h-100">
            <Card.Body>
              <h5 className="d-flex align-items-center gap-2 mb-3">
                <Trophy className="text-warning" /> Leaderboard
              </h5>
              <ListGroup variant="flush">
  {Array.isArray(leaderboard) && leaderboard.length > 0 ? (
    leaderboard.map((entry, index) => (
      <ListGroup.Item key={entry.id} className="d-flex justify-content-between">
        <div>
          <Badge bg="success" className="me-2">{index + 1}</Badge>
          {entry.username}
        </div>
        <div>{entry.totalKg}kg</div>
      </ListGroup.Item>
    ))
  ) : (
    <p>No leaderboard data available</p>
  )}
</ListGroup>

              <Button variant="outline-success" size="sm" className="mt-3 w-100">
                View Full Leaderboard
              </Button>
            </Card.Body>
          </EcoCard>
        </Col>

        <Col md={4}>
          <EcoCard theme={theme} className="h-100">
            <Card.Body>
              <h5 className="d-flex align-items-center gap-2 mb-3">
                <Coin className="text-info" /> Rewards
              </h5>
              <div className="text-center mb-4">
                <div className="h2 text-warning">{user.points}</div>
                <small className="text-muted">Available Points</small>
              </div>
              <div className="d-grid gap-2">
                <Button variant="outline-warning">
                  Redeem for Vouchers
                </Button>
                <Button variant="outline-success">
                  Donate to Green Causes
                </Button>
              </div>
            </Card.Body>
          </EcoCard>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={8}>
          <EcoCard theme={theme}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>
                  <Recycle className="me-2" /> Recycling Activity
                </h4>
                <Button 
                  variant="success"
                  onClick={() => setShowSubmitModal(true)}
                >
                  <CheckCircle className="me-2" /> New Submission
                </Button>
              </div>
              <ListGroup variant="flush">
  {submissions && Array.isArray(submissions) && submissions.length > 0 ? (
    submissions.map(sub => (
      <ListGroup.Item 
        key={sub.id} 
        className="d-flex justify-content-between align-items-center"
      >
        <div>
          <div className="fw-bold">{sub.amount}kg Submission</div>
          <small className="text-muted">
            <Clock className="me-1" />
            {new Date(sub.date).toLocaleDateString()}
          </small>
        </div>
        <Badge 
          bg={sub.status === 'approved' ? 'success' : 'warning'} 
          pill
        >
          {sub.status}
        </Badge>
      </ListGroup.Item>
    ))
  ) : (
    <p>No submissions available</p>
  )}
</ListGroup>

            </Card.Body>
          </EcoCard>
        </Col>

        <Col md={4}>
          <EcoCard theme={theme} className="h-100">
            <Card.Body>
              <h5 className="d-flex align-items-center gap-2 mb-3">
                <Lightbulb className="text-info" /> Eco Tips
              </h5>
              <Alert variant="success" className="small">
                ♻️ Rinse containers before recycling to avoid contamination
              </Alert>
              <Alert variant="info" className="small">
                🌍 You've recycled the equivalent of {Math.floor(user.totalKg / 5)} shopping bags
              </Alert>
              <Alert variant="warning" className="small">
                ⚡ Earn double points for weekend submissions!
              </Alert>
            </Card.Body>
          </EcoCard>
        </Col>
      </Row>

      <Modal show={showSubmitModal} onHide={() => setShowSubmitModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Submit Recycled Plastics</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Enter amount in kg</Form.Label>
            <Form.Control 
              type="number" 
              min="0.1" 
              value={submitAmount}
              onChange={e => setSubmitAmount(e.target.value)} 
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PlasticRecyclingApp;