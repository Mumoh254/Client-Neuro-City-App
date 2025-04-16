import React, { useState, useEffect } from 'react';
import { 
  Card, Button, ListGroup, Badge, Alert, Spinner, 
  ProgressBar, Row, Col, Modal, Form, Stack 
} from 'react-bootstrap';
import { 
  Recycle, Clock, CheckCircle, Trophy, 
  Coin, Globe, Lightbulb, GraphUp, Person 
} from 'react-bootstrap-icons';
import styled from 'styled-components';



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

const PlasticRecyclingApp= ({ theme = 'light' }) => {
  const [submissions, setSubmissions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitAmount, setSubmitAmount] = useState('');

  useEffect(() => {
    // Mock data - replace with actual API calls
    const mockUser = {
      username: "EcoWarrior22",
      totalKg: 145,
      points: 1450,
      level: 2,
      nextLevel: 200,
      rank: 42,
      impact: 34 // CO2 saved in kg
    };

    const mockSubmissions = [
      { id: 1, amount: 15, status: 'approved', date: '2024-03-15' },
      { id: 2, amount: 10, status: 'pending', date: '2024-03-18' },
      { id: 3, amount: 20, status: 'approved', date: '2024-03-20' }
    ];

    setTimeout(() => {
      setUser(mockUser);
      setSubmissions(mockSubmissions);
      setLoading(false);
    }, 1500);
  }, []);

  const handleSubmit = () => {
    if (submitAmount > 0) {
      const newSubmission = {
        id: Date.now(),
        amount: parseInt(submitAmount),
        status: 'pending',
        date: new Date().toISOString()
      };
      setSubmissions([newSubmission, ...submissions]);
      setShowSubmitModal(false);
      setSubmitAmount('');
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center mt-5">
      <Spinner animation="border" variant="success" />
    </div>
  );

  return (
    <div className="container-lg py-4">
      <Row className="g-4 mb-4">
        {/* User Profile Header */}
        <Col xs={12}>
          <EcoCard theme={theme}>
            <Card.Body className="py-4">
              <Stack direction="horizontal" gap={3} className="flex-wrap">
                <div className="bg-success p-3 rounded-circle">
                  <Person size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="mb-1">{user.username}</h2>
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

        {/* Stats Row */}
        <Col md={4}>
          <EcoCard theme={theme} className="h-100">
            <Card.Body>
              <h5 className="d-flex align-items-center gap-2 mb-3">
                <EcoCard className="text-success" /> Environmental Impact
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
                {[1, 2, 3].map(rank => (
                  <ListGroup.Item key={rank} className="d-flex justify-content-between">
                    <div>
                      <Badge bg="success" className="me-2">{rank}</Badge>
                      User {rank}
                    </div>
                    <div>{200 - (rank * 50)}kg</div>
                  </ListGroup.Item>
                ))}
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
                <div className="h2 text-warning">1450</div>
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

      {/* Submission Section */}
      <Row className="g-4">
        <Col md={8}>
          <EcoCard theme={theme}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>
                  <Recycle className="me-2" />
                  Recycling Activity
                </h4>
                <Button 
                  variant="success"
                  onClick={() => setShowSubmitModal(true)}
                >
                  <CheckCircle className="me-2" /> New Submission
                </Button>
              </div>

              <ListGroup variant="flush">
                {submissions.map(sub => (
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
                ))}
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
              <div className="alert alert-success small">
                ♻️ Rinse containers before recycling to avoid contamination
              </div>
              <div className="alert alert-info small">
                🌍 You've recycled the equivalent of {Math.floor(user.totalKg/5)} 
                shopping bags of plastic
              </div>
              <div className="alert alert-warning small">
                ⚡ Earn double points for weekend submissions!
              </div>
            </Card.Body>
          </EcoCard>
        </Col>
      </Row>

      {/* Submission Modal */}
      <Modal show={showSubmitModal} onHide={() => setShowSubmitModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <Recycle className="me-2" /> New Recycling Submission
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Amount (kilograms)</Form.Label>
              <Form.Control 
                type="number" 
                value={submitAmount}
                onChange={(e) => setSubmitAmount(e.target.value)}
                placeholder="Enter plastic weight in kg"
              />
            </Form.Group>
            <div className="alert alert-info small">
              📸 Remember to take photos of your recycling for verification!
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSubmit}>
            Submit Recycling
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PlasticRecyclingApp;
// export default function App() {
//   return (
//     <>
//       <PlasticRecyclingApp />
//       <style>{styles}</style>
//     </>
//   );
// }