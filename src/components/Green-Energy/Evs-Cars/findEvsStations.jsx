import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaArrowRight, FaMotorcycle, FaCar, FaBus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const BASE_URL = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";

// Styled Components
const Container = styled.div`
  background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/images/evs.png');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  padding: 2rem;
  text-align: center;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Header = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  background: linear-gradient(45deg, #00ff88, #00b4d8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const AvailabilityBadge = styled.div`
  background: ${props => props.$available ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 77, 79, 0.2)'};
  color: ${props => props.$available ? '#00ff88' : '#ff4d4f'};
  padding: 1rem 2rem;
  border-radius: 15px;
  margin: 1.5rem auto;
  width: fit-content;
  border: 1px solid ${props => props.$available ? '#00ff88' : '#ff4d4f'};
  transition: all 0.3s ease;
`;

const ChargeTypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin: 2rem auto;
  max-width: 800px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChargeTypeCard = styled.div`
  background: ${props => props.$active ? 'rgba(0, 180, 216, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.$active ? '#00b4d8' : 'rgba(255, 255, 255, 0.2)'};
  padding: 1.5rem;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }

  svg {
    font-size: 2rem;
    color: ${props => props.$active ? '#00b4d8' : '#fff'};
  }
`;

const CTAButton = styled.button`
  background: linear-gradient(45deg, #00b4d8, #00ff88);
  color: #fff;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin: 2rem auto;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 180, 216, 0.4);
  }
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid #00b4d8;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 2rem auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: rgba(255, 77, 79, 0.2);
  color: #ff4d4f;
  padding: 1rem 2rem;
  border-radius: 15px;
  border: 1px solid #ff4d4f;
  margin: 2rem auto;
  max-width: 500px;
`;

const RetryButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  margin-top: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

export default function EVCharging() {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [selectedChargeType, setSelectedChargeType] = useState('Car');
  const [availableSpots, setAvailableSpots] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStations = async () => {
    try {
      const response = await fetch(`https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke/get-ev-station`);
      console.log(response)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setStations(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  useEffect(() => {
    if (stations.length > 0) {
      const totalSpots = stations
        .filter(station => 
          station.vehicleTypes.includes(selectedChargeType) &&
          station.location.includes('Nairobi')
        )
        .reduce((sum, station) => sum + station.slots, 0);
      setAvailableSpots(totalSpots);
    }
  }, [selectedChargeType, stations]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchStations();
  };

  if (loading) return (
    <Container>
      <LoadingSpinner />
    </Container>
  );

  if (error) return (
    <Container>
      <ContentWrapper>
        <ErrorMessage>
          Failed to load stations: {error}
          <RetryButton onClick={handleRetry}>Try Again</RetryButton>
        </ErrorMessage>
      </ContentWrapper>
    </Container>
  );

  return (
    <Container>
      <ContentWrapper>
        <Header>Welcome to Green Energy EV Solutions</Header>
        
        <AvailabilityBadge $available={availableSpots > 0}>
          {availableSpots > 0 ? (
            <>
              🟢 {availableSpots} Available Charging Spots
              <div>for {selectedChargeType}s in Nairobi</div>
            </>
          ) : (
            <>
              🔴 No Available Spots
              <div>Try another vehicle type</div>
            </>
          )}
        </AvailabilityBadge>

        <ChargeTypeGrid>
          {[
            { type: 'Motorcycle', icon: <FaMotorcycle /> },
            { type: 'Car', icon: <FaCar /> },
            { type: 'Bus', icon: <FaBus /> }
          ].map(({ type, icon }) => (
            <ChargeTypeCard
              key={type}
              $active={selectedChargeType === type}
              onClick={() => setSelectedChargeType(type)}
            >
              {icon}
              <div>{type} Charging</div>
            </ChargeTypeCard>
          ))}
        </ChargeTypeGrid>

        <CTAButton onClick={() => navigate('/get-spots', { state: { chargeType: selectedChargeType } })}>
          Find {selectedChargeType} Stations
          <FaArrowRight />
        </CTAButton>
      </ContentWrapper>
    </Container>
  );
}