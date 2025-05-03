import React, { useState, useEffect, useRef } from 'react';
import { FaCar, FaMapMarkerAlt, FaClock, FaCoins, FaCalendarAlt } from 'react-icons/fa';
import { Modal, Button as BootstrapButton, Spinner, Form, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';
import styled, { createGlobalStyle } from 'styled-components';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getUserNameFromToken } from '../handler/tokenDecoder';

const GlobalStyle = createGlobalStyle`
  :root {
    --primary: #2563eb;
    --secondary: #3b82f6;
    --background: #f8fafc;
    --surface: #ffffff;
    --text-primary: #1e293b;
    --text-secondary: #64748b;
    --border: #e2e8f0;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.05);
  }

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    color: var(--text-primary);
    background: var(--background);
    margin: 0;
    -webkit-font-smoothing: antialiased;
  }
`;

const PRICING = {
  daily: 500,
  weekly: 3000,
  monthly: 10000
};
const POINTS_PER_SHILLING = 10;
const GRACE_MINUTES = 30;

const ParkingSystem = () => {
  const [username, setUsername] = useState('');
  const [parkingDetails, setParkingDetails] = useState({
    registrationNumber: '',
    duration: 1,
    parkingType: 'daily',
  });
  const [location, setLocation] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRedeem, setShowRedeem] = useState(false);
  const [points, setPoints] = useState(1500);
  const [activeTab, setActiveTab] = useState('parking');
  const [countdown, setCountdown] = useState(0);
  const countdownIntervalRef = useRef(null);

  useEffect(() => {
    const userData = getUserNameFromToken();
    if (userData) setUsername(userData.name);
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => toast.error('Location access required for parking sessions'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const startCountdown = (endTime) => {
    clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = endTime - now;
      setCountdown(remaining > 0 ? Math.ceil(remaining / 1000) : 0);
    }, 1000);
  };

  const handlePayment = async (amount) => {
    try {
      const response = await axios.post('/apiV1/mpesa/stkpush', {
        phone: '254712345678',
        amount,
        accountReference: 'PARKING_PAYMENT'
      });
      return response.data.success;
    } catch (error) {
      toast.error('Payment processing failed');
      return false;
    }
  };

  const validateForm = () => {
    if (!username) {
      toast.error('Authentication required');
      return false;
    }
    if (!location) {
      toast.error('Waiting for location...');
      return false;
    }
    if (!parkingDetails.registrationNumber) {
      toast.error('Please enter license plate');
      return false;
    }
    return true;
  };

  const createParkingSession = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    const cost = PRICING[parkingDetails.parkingType] * parkingDetails.duration;

    try {
      const paymentSuccess = await handlePayment(cost);
      if (!paymentSuccess) return;

      const response = await axios.post('/apiV1/smartcity-ke/park', {
        ...parkingDetails,
        userName: username,
        location: `${location.lat},${location.lng}`,
        amountDue: cost,
        duration: parkingDetails.duration
      });

      setSession(response.data);
      setPoints(prev => prev + (cost * POINTS_PER_SHILLING));
      startCountdown(Date.now() + (parkingDetails.duration * 3600 * 1000));
      toast.success('Parking session started!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating session');
    } finally {
      setLoading(false);
    }
  };

  const SubscriptionPlans = () => (
    <SubscriptionContainer>
      <PlanCard>
        <h3><FaCalendarAlt /> Weekly</h3>
        <Price>Ksh {PRICING.weekly}</Price>
        <ul>
          <li>Unlimited zone 1 parking</li>
          <li>24/7 security monitoring</li>
          <li>Weekly vehicle inspection</li>
        </ul>
        <SubscribeButton>Subscribe</SubscribeButton>
      </PlanCard>

      <PlanCard highlighted>
        <h3><FaCalendarAlt /> Monthly</h3>
        <Price>Ksh {PRICING.monthly}</Price>
        <ul>
          <li>All weekly benefits</li>
          <li>Free car washes (2/month)</li>
          <li>Priority support</li>
        </ul>
        <SubscribeButton>Subscribe</SubscribeButton>
      </PlanCard>
    </SubscriptionContainer>
  );

  return (
    <Container>
      <GlobalStyle />
      <ToastContainer position="bottom-right" />
      
      <Header>
        <Logo>
          <FaCar />
          <span>CityPark</span>
        </Logo>
        <ControlGroup>
          <PointsButton onClick={() => setShowRedeem(true)}>
            <FaCoins /> {points}
          </PointsButton>
          <UserInfo>
            <div className="name">{username}</div>
            <div className="role">Driver</div>
          </UserInfo>
        </ControlGroup>
      </Header>

      <MainContent>
        <Tabs activeKey={activeTab} onSelect={setActiveTab}>
          <Tab eventKey="parking" title={<TabTitle><FaCar /> Parking</TabTitle>}>
            <ContentCard>
              {!session ? (
                <FormSection>
                  <FormGroup>
                    <label>License Plate</label>
                    <Input
                      placeholder="KAA 123A"
                      value={parkingDetails.registrationNumber}
                      onChange={e => setParkingDetails({
                        ...parkingDetails,
                        registrationNumber: e.target.value.toUpperCase()
                      })}
                    />
                  </FormGroup>

                  <FormGroup>
                    <label>Duration ({parkingDetails.parkingType === 'daily' ? 'hours' : 'days'})</label>
                    <Input
                      type="number"
                      min="1"
                      value={parkingDetails.duration}
                      onChange={e => setParkingDetails({
                        ...parkingDetails,
                        duration: e.target.value
                      })}
                    />
                  </FormGroup>

                  <FormGroup>
                    <label>Parking Type</label>
                    <Select
                      value={parkingDetails.parkingType}
                      onChange={e => setParkingDetails({
                        ...parkingDetails,
                        parkingType: e.target.value
                      })}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </Select>
                  </FormGroup>

                  <CostDisplay>
                    Ksh {PRICING[parkingDetails.parkingType] * parkingDetails.duration}
                  </CostDisplay>

                  <PrimaryButton 
                    onClick={createParkingSession}
                    disabled={loading}
                  >
                    {loading ? <Spinner size="sm" /> : 'Start Session'}
                  </PrimaryButton>
                </FormSection>
              ) : (
                <ActiveSession>
                  <SessionHeader>
                    <FaClock />
                    <div>
                      <h3>Active Session</h3>
                      <p>{session.registrationNumber}</p>
                    </div>
                  </SessionHeader>

                  <StatusGrid>
                    <StatusItem>
                      <label>Location</label>
                      <div className="value">
                        <FaMapMarkerAlt />
                        {location?.lat.toFixed(4)}, {location?.lng.toFixed(4)}
                      </div>
                    </StatusItem>

                    <StatusItem>
                      <label>Time Remaining</label>
                      <div className="value">
                        {Math.floor(countdown / 3600)}h {Math.floor((countdown % 3600) / 60)}m
                      </div>
                    </StatusItem>

                    <StatusItem>
                      <label>Payment Status</label>
                      <div className="value success">Paid</div>
                    </StatusItem>
                  </StatusGrid>
                </ActiveSession>
              )}
            </ContentCard>
          </Tab>

          <Tab eventKey="subscriptions" title={<TabTitle><FaCalendarAlt /> Subscriptions</TabTitle>}>
            <ContentCard>
              <SubscriptionPlans />
            </ContentCard>
          </Tab>
        </Tabs>
      </MainContent>

      <RedeemModal 
        show={showRedeem}
        onHide={() => setShowRedeem(false)}
        points={points}
      />
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 2rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary);

  svg {
    font-size: 1.8rem;
  }
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const PointsButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: var(--background);
  }
`;

const UserInfo = styled.div`
  text-align: right;
  
  .name {
    font-weight: 500;
  }
  
  .role {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
`;

const MainContent = styled.main`
  background: var(--surface);
  border-radius: 1rem;
  box-shadow: var(--shadow-sm);
  padding: 2rem;
`;

const ContentCard = styled.div`
  padding: 2rem;
  background: var(--surface);
  border-radius: 1rem;
`;

const FormSection = styled.div`
  display: grid;
  gap: 1.5rem;
  max-width: 600px;
  margin: 0 auto;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
`;

const Input = styled.input`
  padding: 0.875rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
  }
`;

const Select = styled.select`
  ${Input}
`;

const CostDisplay = styled.div`
  grid-column: span 2;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary);
  padding: 1.5rem 0;
`;

const PrimaryButton = styled.button`
  grid-column: span 2;
  padding: 1rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: opacity 0.2s;

  &:disabled {
    opacity: 0.7;
  }

  &:hover:not(:disabled) {
    opacity: 0.9;
  }
`;

const ActiveSession = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const SessionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border);

  svg {
    font-size: 2rem;
    color: var(--primary);
  }

  h3 {
    font-size: 1.25rem;
    margin-bottom: 0.25rem;
  }

  p {
    color: var(--text-secondary);
  }
`;

const StatusGrid = styled.div`
  display: grid;
  gap: 1.5rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const StatusItem = styled.div`
  padding: 1.5rem;
  background: var(--background);
  border-radius: 0.5rem;

  label {
    display: block;
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }

  .value {
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .success {
    color: #16a34a;
  }
`;

const TabTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0;
`;

const SubscriptionContainer = styled.div`
  display: grid;
  gap: 2rem;
  padding: 2rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const PlanCard = styled.div`
  padding: 2rem;
  border-radius: 1rem;
  background: var(--surface);
  border: 2px solid ${props => props.highlighted ? 'var(--primary)' : 'var(--border)'};
  box-shadow: var(--shadow-sm);

  h3 {
    color: var(--primary);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 1.5rem 0;
    color: var(--text-secondary);

    li {
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--border);
    }
  }
`;

const Price = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary);
  margin: 1.5rem 0;
`;

const SubscribeButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

const RedeemModal = ({ show, onHide, points }) => {
  const [redeemAmount, setRedeemAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const maxRedeemable = Math.floor(points / 100) * 100;

  const handleRedeem = async () => {
    setLoading(true);
    try {
      await axios.post('/api/redeem', { points: redeemAmount });
      onHide();
      toast.success(`${redeemAmount} points redeemed!`);
    } catch (error) {
      toast.error('Redemption failed');
    }
    setLoading(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title><FaCoins /> Redeem Points</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Points to Redeem (Max: {maxRedeemable})</Form.Label>
            <Form.Control
              type="number"
              min="100"
              max={maxRedeemable}
              step="100"
              value={redeemAmount}
              onChange={(e) => setRedeemAmount(e.target.value)}
            />
            <Form.Text>Ksh {(redeemAmount / 100).toFixed(2)} Value</Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <BootstrapButton variant="secondary" onClick={onHide}>Cancel</BootstrapButton>
        <BootstrapButton 
          variant="warning" 
          onClick={handleRedeem}
          disabled={!redeemAmount || loading}
        >
          {loading ? <Spinner size="sm" /> : 'Redeem'}
        </BootstrapButton>
      </Modal.Footer>
    </Modal>
  );
};

export default ParkingSystem;