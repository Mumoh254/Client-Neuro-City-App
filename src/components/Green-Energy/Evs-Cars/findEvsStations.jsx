
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaArrowRight } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';

// ... keep existing styled components ...

const Container = styled.div`
  background-image: url('/images/evs.png');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  height: 100vh;
  margin: 0;
  padding: 0;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ArrowLink = styled.span`
  color: #00f;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateX(5px);
  }
`;

const ChargeTypeList = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
`;

const ChargeType = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  border: 2px solid #fff;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
  margin-top:   2rem;

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
`;



export default function EVCharging() {

  const BASE_URL = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [selectedChargeType, setSelectedChargeType] = useState(null);
  const [availableSpots, setAvailableSpots] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch(`${BASE_URL}/get-ev-station`);
        if (!response.ok) throw new Error('Failed to fetch stations');
        const data = await response.json();
        setStations(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  useEffect(() => {
    if (selectedChargeType) {
      const totalSpots = stations
        .filter(station => 
          station.vehicleTypes.includes(selectedChargeType) &&
          station.location === 'Nairobi'
        )
        .reduce((sum, station) => sum + station.slots, 0);
      
      setAvailableSpots(totalSpots);
    }
  }, [selectedChargeType, stations]);

  const handleChargeTypeSelect = (type) => {
    setSelectedChargeType(type);
  };

  if (loading) return <Container>Loading stations...</Container>;
  if (error) return <Container>Error: {error}</Container>;

  return (
    <Container>
      <h1>Hello, Welcome to EV Station</h1>

      <p>
        {availableSpots > 0 ? (
          `${availableSpots} available spots in Nairobi`
        ) : (
          "See EV stations around you"
        )}
        <ArrowLink onClick={() => navigate('/get-spots', { state: { chargeType: selectedChargeType } })}>
          <FaArrowRight />
        </ArrowLink>
      </p>

      <div>
        <p>Select a charge type:</p>
        <ChargeTypeList>
          {['Motorcycle', 'Car', 'Bus'].map((type) => (
            <ChargeType 
              key={type}
              onClick={() => handleChargeTypeSelect(type)}
              style={{
                background: selectedChargeType === type 
                  ? 'rgba(255, 255, 255, 0.3)' 
                  : 'rgba(255, 255, 255, 0.1)'
              }}
            >
              {type}
            </ChargeType>
          ))}
        </ChargeTypeList>
      </div>
    </Container>
  );
}
