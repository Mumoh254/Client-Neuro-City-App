import React, { useState, useEffect, useRef } from 'react';

import { FaCar, FaCreditCard, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import axios from 'axios';
import styled from 'styled-components';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Dummy logged-in user data (in a real app, extract from auth context)
const loggedInUser = {
  id: 'smart_ke_WT_318784939',
  name: 'Peter',
  email: 'john.doe@example.com',
  phone: '254712345678'
};

// Daily rate and grace period
const DAILY_RATE = 500; // Ksh per day
const GRACE_MINUTES = 30; // 30 minutes grace period

// Calculate cost: if duration is less than a day, prorate cost.
const calculateCost = (hours) => {
  // If hours is less than 24, then cost = (hours/24)*500; otherwise, round up to full days.
  if (hours < 24) {
    return Math.ceil((hours / 24) * DAILY_RATE);
  } else {
    return Math.ceil(hours / 24) * DAILY_RATE;
  }
};

const ParkingSystem = () => {
  const [parkingDetails, setParkingDetails] = useState({
    registrationNumber: '',
    duration: 1, // in hours
    parkingType: ""
  });
  const [location, setLocation] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(null);

  // Reference for countdown timer
  const countdownIntervalRef = useRef(null);

  // Using Flutterwave for payment integration
  const handlePayment = useFlutterwave({
    public_key: "process.env.REACT_APP_FLW_PUBLIC_KEY",
    tx_ref: `parking-${Date.now()}-${loggedInUser.id}`,
    amount: calculateCost(Number(parkingDetails.duration)),
    currency: 'KES',
    payment_options: 'card,mpesa',
    customer: {
      email: loggedInUser.email,
      phone_number: loggedInUser.phone,
      name: loggedInUser.name,
    },
    callback: (response) => {
      if (response.status === 'successful') {
        setSession(prev => ({ ...prev, paid: true }));
        toast.success('Payment confirmed!');
        // Optionally notify your backend of payment success.
        axios.post('/api/payments/webhook', response);
      }
    },
  });

  // Obtain user's current geolocation
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

  // Start a countdown timer until session expires (including grace period)
  const startCountdown = (endTime) => {
    // Clear any previous interval
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    
    countdownIntervalRef.current = setInterval(() => {
      const now = new Date().getTime();
      const remaining = endTime - now;
      if (remaining <= 0) {
        clearInterval(countdownIntervalRef.current);
        setCountdown(0);
        toast.info(`Your parking session has ended. You have an additional ${GRACE_MINUTES} minutes grace period.`);
      } else {
        setCountdown(Math.ceil(remaining / 1000));
      }
    }, 1000);
  };

  // Create parking session on the server
  const createParkingSession = async () => {
    if (!loggedInUser?.id) {
      toast.error('You must be logged in to start a parking session.');
      return;
    }
    if (!location) {
      toast.error('Waiting for your location…');
      return;
    }

    setLoading(true);
    try {
      // Calculate cost using the prorated formula based on hours entered
      const cost = calculateCost(Number(parkingDetails.duration));
      const response = await axios.post('http://localhost:8000/apiV1/smartcity-ke/park', {
        ...parkingDetails,
        userId: loggedInUser.id,
        userName: loggedInUser.name,
        location: `${location.lat},${location.lng}`,
        amountDue: cost,
        // Send the duration in hours as provided by the user
        duration: parkingDetails.duration,
      });
      setSession(response.data);
      
      // Calculate session end time
      // Assume the backend returns the startTime in ISO format; add duration in hours plus grace period in minutes.
      const startTime = new Date(response.data.startTime);
      const endTime = new Date(startTime.getTime() + Number(parkingDetails.duration) * 3600000 + GRACE_MINUTES * 60000);
      startCountdown(endTime.getTime());
      toast.success('Parking session initiated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create session');
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
        <UserInfo>
          {loggedInUser.name}
        </UserInfo>
      </Header>

      <WelcomeBanner>
        <h1>Welcome, {loggedInUser.name}</h1>
        <p>Start your parking session by entering your car details below.</p>
      </WelcomeBanner>

      
  <Label>License Plate</Label>
  <Input
    type="text"
    placeholder="e.g., KAA 123A"
    value={parkingDetails.registrationNumber}
    onChange={(e) =>
      setParkingDetails({
        ...parkingDetails, // 👈 correct object spread
        registrationNumber: e.target.value.toUpperCase(),
      })
    }
  />


<FormSection>
  <Label>License Plate</Label>
  <Input
    type="text"
    placeholder="e.g., public  ,  private"
    value={parkingDetails. parkingType}
    onChange={(e) =>
      setParkingDetails({
        ...parkingDetails, // 👈 correct object spread
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
          onChange={(e) => setParkingDetails({
            ...parkingDetails,
            duration: e.target.value
          })}
        />
        <CostDisplay>
          Charge: Ksh {calculateCost(Number(parkingDetails.duration))}
        </CostDisplay>

        <ActionButtons>
          {!session && (
            <Button onClick={createParkingSession} disabled={loading}>
              {loading ? 'Starting session…' : 'Start Parking Session'}
            </Button>
          )}
          {session && !session.paid && (
            <PaymentButton onClick={handlePayment}>
              <FaCreditCard /> Proceed to Payment
            </PaymentButton>
          )}
        </ActionButtons>
      </FormSection>

      {session && (
        <NotificationSection>
          <h2>
            <FaClock /> Parking Session Active
          </h2>
          <p>
            Your session will expire in: {countdown !== null ? `${countdown} seconds` : 'Loading...'}
          </p>
          <p>
            Your grace period of {GRACE_MINUTES} minutes will apply after session expiry.
          </p>
          <LocationInfo>
            <FaMapMarkerAlt /> Your Location: {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Loading...'}
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
  box-shadow: 0 0 15px rgba(0,0,0,0.05);
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
  margin-top: 0.5rem;
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

const PaymentButton = styled(Button)`
  background: #10b981;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NotificationSection = styled.div`
  background: #e2e8f0;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  h2 {
    margin-bottom: 0.5rem;
    font-size: 1.6rem;
    color: #2d3748;
  }
  p {
    font-size: 1rem;
  }
`;

const LocationInfo = styled.div`
  margin-top: 1rem;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #0070f3;
`;

