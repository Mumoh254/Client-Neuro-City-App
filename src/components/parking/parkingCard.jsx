import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Badge, ProgressBar, ListGroup, Button, Alert,Spinner
} from 'react-bootstrap';
import {  FaCar,  FaClock, FaMapMarkerAlt,  FaMoneyBillWave,  FaStar,FaCoins,FaTicketAlt, FaMedal, FaAward,
FaGem
} from 'react-icons/fa';
import { format, differenceInSeconds } from 'date-fns';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

import SubscriptionModal from './subscriptionModel';

// Color Theme
const theme = {
  primary: '#8b5cf6',
  secondary: '#5BA4E6',
  success: '#2563eb',
  warning: '#f59e0b',
  danger: '#ef4444',
  light: '#F8F9FA',
  dark: '#3b82f6'
};

const rankConfig = {
  Bronze: {
    color: '#CD7F32',
    icon: <FaMedal />,
    threshold: 100,
    nextRank: 'Silver'
  },
  Silver: {
    color: '#C0C0C0',
    icon: <FaStar />,
    threshold: 500,
    nextRank: 'Gold'
  },
  Gold: {
    color: '#FFD700',
    icon: <FaAward />,
    threshold: 1000,
    nextRank: 'Platinum'
  },
  Platinum: {
    color: '#E5E4E2',
    icon: <FaGem />,
    threshold: 2500,
    nextRank: null
  }
};

const ParkingSessionCard = () => {

  const navigate = useNavigate(); 
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const BASE_URL = "https://neuro-apps-api-express-js-production-redy.onrender.com";
  useEffect(() => {
    let timerInterval;
    
    const fetchParkingData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/apiV1/smartcity-ke/get-parking?userId=smart_ke_WT_125343562`);
        
        if (!response.ok) throw new Error('Failed to fetch parking details');
        
        const data = await response.json();
        setSessionData(data);
        
        timerInterval = setInterval(() => {
          const secondsLeft = differenceInSeconds(new Date(data.endTime), new Date());
          setTimeLeft(secondsLeft > 0 ? secondsLeft : 0);
        }, 1000);
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchParkingData();
    return () => clearInterval(timerInterval);
  }, []);

  const formatDuration = (seconds) => {
    if (seconds <= 0) return 'Session Expired';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const RankProgressDisplay = ({ currentPoints, currentRank }) => {
    if (!rankConfig[currentRank]) return null;
    
    const config = rankConfig[currentRank];
    const nextRank = rankConfig[config.nextRank];
    const progress = nextRank 
      ? Math.min(((currentPoints - config.threshold) / (nextRank.threshold - config.threshold)) * 100, 100)
      : 100;

    return (
      <RankProgressContainer>
        <RankHeader>
          {config.icon}
          <div>
            <RankTitle>{currentRank}</RankTitle>
            {nextRank && <NextRank>Next: {config.nextRank}</NextRank>}
          </div>
        </RankHeader>
        <ProgressBarContainer>
          <ProgressBar now={progress} 
                      style={{ height: '8px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
            <ProgressBar variant="warning" 
                        now={progress} 
                        animated />
          </ProgressBar>
          <PointsProgress>
            {currentPoints} / {nextRank?.threshold || 'MAX'} Points
          </PointsProgress>
        </ProgressBarContainer>
      </RankProgressContainer>
    );
  };

  if (loading) return (
    <LoadingContainer>
      <Spinner animation="border" variant="primary" />
    </LoadingContainer>
  );

  if (error) return (
    <ErrorContainer>
      <Alert variant="danger">{error}</Alert>
    </ErrorContainer>
  );

  if (!sessionData) return null;

  return (
    <StyledContainer fluid>
      <ContentContainer>
        <Row className="g-4">
          {/* Main Session Card */}
          <Col xl={8} lg={7}>
            <SessionCard>
              <Card.Header>
                <CardTitle>
                  <FaCar />
                  <span>{sessionData.registrationNumber}</span>
                  <ParkingRankBadge rank={sessionData.parkingRank}>
                    {sessionData.parkingRank}
                  </ParkingRankBadge>
                </CardTitle>
              </Card.Header>

              <Card.Body>
                <DetailsGrid>
                  <DetailItem
                    icon={<FaMapMarkerAlt />}
                    label="Location"
                    value={sessionData.location}
                  />
                  <DetailItem
                    icon={<FaClock />}
                    label="Start Time"
                    value={format(new Date(sessionData.startTime), 'dd MMM yyyy HH:mm')}
                  />
                  <DetailItem
                    icon={<FaClock />}
                    label="End Time"
                    value={format(new Date(sessionData.endTime), 'dd MMM yyyy HH:mm')}
                  />
                  <DetailItem
                    icon={<FaMoneyBillWave />}
                    label="Amount Due"
                    value={`Ksh ${sessionData.amountDue}`}
                  />
                  <DetailItem
                    icon={<FaTicketAlt />}
                    label="Parking Type"
                    value={sessionData.parkingType}
                  />
                  <DetailItem
                    icon={<FaCoins />}
                    label="Duration"
                    value={`${sessionData.duration} hours`}
                  />
                </DetailsGrid>

                <TimeRemainingSection>
                  <SectionTitle>
                    <FaClock />
                    Time Remaining
                  </SectionTitle>
                  <CountdownTimer>
                    {formatDuration(timeLeft)}
                  </CountdownTimer>
                  <ProgressBar 
                    now={(timeLeft / (sessionData.duration * 3600)) * 100}
                    variant="warning"
                    animated
                  />
                </TimeRemainingSection>
              </Card.Body>
            </SessionCard>
          </Col>

          {/* Sidebar Section */}
          <Col xl={4} lg={5}>
            <SidebarContainer>
              <PointsCard>
                <CardHeader>
                  <FaStar />
                  Citizen Points
                </CardHeader>
                <CardBody>
                  <PointsDisplay>
                    <div className="points">{sessionData.parkingPoints}</div>
                    <div className="label">Current Points</div>
                  </PointsDisplay>
                  <RankProgressDisplay 
                    currentPoints={sessionData.parkingPoints}
                    currentRank={sessionData.parkingRank}
                  />
                </CardBody>
              </PointsCard>

              <PaymentCard>
                <CardHeader>
                  <FaMoneyBillWave />
                  Payments
                </CardHeader>
                <CardBody>
                  {sessionData.payments?.length > 0 ? (
                    sessionData.payments.map((payment, index) => (
                      <PaymentItem key={index}>
                        <div>Ksh {payment.amount}</div>
                        <StatusBadge status={payment.status}>
                          {payment.status}
                        </StatusBadge>
                      </PaymentItem>
                    ))
                  ) : (
                    <EmptyState>No payments recorded</EmptyState>
                  )}
                </CardBody>
              </PaymentCard>

              <FinesCard>
                <CardHeader>
                  <FaTicketAlt />
                  Fines
                </CardHeader>
                <CardBody>
                  {sessionData.fines?.length > 0 ? (
                    sessionData.fines.map((fine, index) => (
                      <FineItem key={index}>
                        <div>{fine.description}</div>
                        <div>Ksh {fine.amount}</div>
                      </FineItem>
                    ))
                  ) : (
                    <EmptyState>No outstanding fines</EmptyState>
                  )}
                </CardBody>
              </FinesCard>
            </SidebarContainer>
          </Col>
        </Row>

        <ActionButtons>
      <PrimaryButton onClick={() => navigate('/park')}>
        <FaClock />
        Park
      </PrimaryButton>
      <SuccessButton>
        <FaMoneyBillWave />
        Make Payment
      </SuccessButton>
      <DangerButton>
        <FaCar />
        End Session
      </DangerButton>
    </ActionButtons>
      </ContentContainer>
    </StyledContainer>
  );
};

// Styled Components
const StyledContainer = styled(Container)`
  background: ${theme.light};
  min-height: 100vh;
  padding: 2rem;
`;

const ContentContainer = styled.div`
  max-width: 1600px;
  margin: 0 auto;
`;

const SessionCard = styled(Card)`
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: ${theme.primary};
  color: white;
  border-radius: 12px 12px 0 0 !important;
  
  svg {
    font-size: 1.5rem;
  }
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  
  span {
    margin-right: auto;
  }
`;

const ParkingRankBadge = styled(Badge)`
  background: ${props => rankConfig[props.rank]?.color || theme.dark};
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 8px;
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const DetailItem = ({ icon, label, value }) => (
  <DetailItemContainer>
    <IconWrapper>{icon}</IconWrapper>
    <div>
      <Label>{label}</Label>
      <Value>{value}</Value>
    </div>
  </DetailItemContainer>
);

const DetailItemContainer = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0,0,0,0.03);
  border-radius: 8px;
`;

const IconWrapper = styled.div`
  font-size: 1.25rem;
  color: ${theme.primary};
`;

const Label = styled.div`
  font-size: 0.9rem;
  color: ${theme.dark};
  margin-bottom: 0.25rem;
`;

const Value = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
  color: ${theme.dark};
`;

const TimeRemainingSection = styled.div`
  background: rgba(42,92,130,0.05);
  border-radius: 12px;
  padding: 1.5rem;
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  color: ${theme.primary};
`;

const CountdownTimer = styled.div`
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  color: ${theme.warning};
  margin: 1.5rem 0;
`;

const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const PointsCard = styled(Card)`
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
`;

const CardBody = styled.div`
  padding: 1.5rem;
`;

const PointsDisplay = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  .points {
    font-size: 3rem;
    font-weight: 700;
    color: ${theme.primary};
    line-height: 1;
  }
  
  .label {
    font-size: 0.9rem;
    color: ${theme.dark};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const RankProgressContainer = styled.div`
  background: rgba(0,0,0,0.03);
  border-radius: 8px;
  padding: 1rem;
`;

const RankHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  
  svg {
    font-size: 1.5rem;
    color: ${theme.primary};
  }
`;

const RankTitle = styled.div`
  font-weight: 500;
  color: ${theme.dark};
`;

const NextRank = styled.div`
  font-size: 0.9rem;
  color: ${theme.dark};
`;

const ProgressBarContainer = styled.div`
  margin: 1rem 0;
`;

const PointsProgress = styled.div`
  font-size: 0.9rem;
  color: ${theme.dark};
  text-align: center;
  margin-top: 0.5rem;
`;

const PaymentCard = styled(PointsCard)``;
const FinesCard = styled(PointsCard)``;

const PaymentItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
`;

const StatusBadge = styled(Badge)`
  background: ${props => 
    props.status === 'completed' ? theme.success : 
    props.status === 'pending' ? theme.warning : theme.danger} !important;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 500;
`;

const FineItem = styled(PaymentItem)`
  color: ${theme.danger};
`;

const EmptyState = styled.div`
  text-align: center;
  color: ${theme.dark};
  padding: 1rem;
  opacity: 0.7;
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
`;

const BaseButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: center;
  padding: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const PrimaryButton = styled(BaseButton)`
  background: ${theme.primary};
  &:hover { background: #234b6b; }
`;

const SuccessButton = styled(BaseButton)`
  background: ${theme.success};
  &:hover { background: #3d8b40; }
`;

const DangerButton = styled(BaseButton)`
  background: ${theme.danger};
  &:hover { background: #d32f2f; }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
`;

const ErrorContainer = styled.div`
  padding: 2rem;
`;

export default ParkingSessionCard;