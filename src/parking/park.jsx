import React, { useState, useEffect, useRef } from 'react';
import { FaCar, FaCreditCard, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import axios from 'axios';
import styled from 'styled-components';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Dummy logged-in user
const loggedInUser = {
  id: 'smart_ke_WT_318784939',
  name: 'Peter',
  email: 'john.doe@example.com',
  phone: '254712345678',
};

// Constants
const DAILY_RATE = 500;
const GRACE_MINUTES = 30;

const calculateCost = (hours) => {
  if (hours < 24) {
    return Math.ceil((hours / 24) * DAILY_RATE);
  } else {
    return Math.ceil(hours / 24) * DAILY_RATE;
  }
};

const ParkingSystem = () => {
  const [parkingDetails, setParkingDetails] = useState({
    registrationNumber: '',
    duration: 1,
    parkingType: '',
  });
  const [location, setLocation] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const countdownIntervalRef = useRef(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        toast.error('Location access required to start parking session.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const startCountdown = (endTime) => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      const now = new Date().getTime();
      const remaining = endTime - now;
      if (remaining <= 0) {
        clearInterval(countdownIntervalRef.current);
        setCountdown(0);
        toast.info(`Parking session ended. You have ${GRACE_MINUTES} mins grace.`);
      } else {
        setCountdown(Math.ceil(remaining / 1000));
      }
    }, 1000);
  };

  const createParkingSession = async () => {
    if (!loggedInUser?.id) {
      toast.error('Login required.');
      return;
    }
    if (!location) {
      toast.error('Waiting for location...');
      return;
    }

    setLoading(true);
    try {
      const cost = calculateCost(Number(parkingDetails.duration));
      const response = await axios.post('http://localhost:8000/apiV1/smartcity-ke/park', {
        ...parkingDetails,
        userId: loggedInUser.id,
        userName: loggedInUser.name,
        location: `${location.lat},${location.lng}`,
        amountDue: cost,
        duration: parkingDetails.duration,
      });
      setSession(response.data);

      const startTime = new Date(response.data.startTime);
      const endTime = new Date(startTime.getTime() + Number(parkingDetails.duration) * 3600000 + GRACE_MINUTES * 60000);
      startCountdown(endTime.getTime());
      toast.success('Parking session started!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating session');
    }
    setLoading(false);
  };

  return (
    <Container>
      <ToastContainer />
      <Header>
        <Logo>
          <FaCar /> PARK MY RIDE
        </Logo>
        <UserInfo>{loggedInUser.name}</UserInfo>
      </Header>

      <WelcomeBanner>
        <h1>Welcome, {loggedInUser.name}</h1>
        <p>Start your parking session by entering your car details below.</p>
      </WelcomeBanner>

      <FormSection>
        <Label>License Plate</Label>
        <Input
          type="text"
          placeholder="e.g., KAA 123A"
          value={parkingDetails.registrationNumber}
          onChange={(e) =>
            setParkingDetails({
              ...parkingDetails,
              registrationNumber: e.target.value.toUpperCase(),
            })
          }
        />

        <Label>Parking Type</Label>
        <Input
          type="text"
          placeholder="e.g., Public or Private"
          value={parkingDetails.parkingType}
          onChange={(e) =>
            setParkingDetails({
              ...parkingDetails,
              parkingType: e.target.value.toUpperCase(),
            })
          }
        />

        <Label>Parking Duration (hours)</Label>
        <Input
          type="number"
          min="1"
          max="72"
          value={parkingDetails.duration}
          onChange={(e) =>
            setParkingDetails({
              ...parkingDetails,
              duration: e.target.value,
            })
          }
        />

        <CostDisplay>Charge: Ksh {calculateCost(Number(parkingDetails.duration))}</CostDisplay>

        <ActionButtons>
          {!session && (
            <Button onClick={createParkingSession} disabled={loading}>
              {loading ? 'Starting session…' : 'Start Parking Session'}
            </Button>
          )}
        </ActionButtons>
      </FormSection>

      {session && (
        <NotificationSection>
          <h2>
            <FaClock /> Parking Session Active
          </h2>
          <p>
            Session expires in: {countdown !== null ? `${countdown} seconds` : 'Loading...'}
          </p>
          <p>
            Grace period: {GRACE_MINUTES} minutes after expiry.
          </p>
          <LocationInfo>
            <FaMapMarkerAlt /> Your Location:{' '}
            {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Loading...'}
          </LocationInfo>
        </NotificationSection>
      )}
    </Container>
  );
};

export default ParkingSystem;

//
// Styled Components
//
const Container = styled.div`
  background: #f4f7fa;
  min-height: 100vh;
  padding: 2rem;
  color: #333;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Logo = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: #0070f3;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UserInfo = styled.div`
  font-size: 1.1rem;
  padding: 0.5rem 1rem;
  background: #e2e8f0;
  border-radius: 8px;
`;

const WelcomeBanner = styled.div`
  background: #0070f3;
  color: #fff;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 2rem;
  h1 {
    font-size: 2.2rem;
    margin-bottom: 0.5rem;
  }
  p {
    font-size: 1.1rem;
  }
`;

const FormSection = styled.div`
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Label = styled.label`
  font-size: 0.95rem;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
`;

const CostDisplay = styled.div`
  font-size: 1.1rem;
  font-weight: bold;
  color: #0070f3;
`;

const ActionButtons = styled.div`
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  background: #0070f3;
  color: #fff;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  &:disabled {
    background: #a0aec0;
  }
`;

const NotificationSection = styled.div`
  background: #e2e8f0;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
`;

const LocationInfo = styled.div`
  margin-top: 1rem;
  font-size: 0.95rem;
`;

