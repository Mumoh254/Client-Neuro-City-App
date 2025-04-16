import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiClock, FiLock } from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';
import styled from 'styled-components';

// Styled Components
const OtpContainer = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const TimerText = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  margin-bottom: 1rem;
  font-size: 0.875rem;

  &.expired {
    color: #ef4444;
  }
`;

const OtpInputGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const OtpInput = styled.input`
  width: 3rem;
  height: 3rem;
  text-align: center;
  font-size: 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }

  &::placeholder {
    color: #cbd5e1;
  }
`;

const VerifyButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: #4f46e5;
  }

  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
`;

const Login = ({ userEmail }) => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    if (!timeLeft) return;
    
    const timerId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index, value) => {
    if (/^\d+$/.test(value) || value === '') {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value !== '' && index < 3) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 4) {
      setServerError('Please enter a valid 4-digit OTP');
      return;
    }

    if (timeLeft === 0) {
      setServerError('OTP has expired. Please request a new one.');
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      const response = await axios.post('http://localhost:8000/apiV1/smartcity-ke/verify-otp', {
        email: userEmail,
        otp: otpCode
      });
console.log(response.data)
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (error) {
      setServerError(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OtpContainer>
      <div className="text-center mb-4">
        <FiLock className="text-3xl text-indigo-600 mb-2 mx-auto" />
        <h2 className="text-xl font-bold">Verify OTP</h2>
      </div>

      <TimerText className={timeLeft < 60 ? 'expired' : ''}>
        <FiClock />
        OTP valid for: {formatTime(timeLeft)}
        {timeLeft === 0 && ' (Expired)'}
      </TimerText>

      <OtpInputGroup>
        {otp.map((digit, index) => (
          <OtpInput
            key={index}
            id={`otp-input-${index}`}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            placeholder="•"
            disabled={timeLeft === 0}
          />
        ))}
      </OtpInputGroup>

      {serverError && <div className="text-red-500 text-sm mb-4">{serverError}</div>}

      <VerifyButton 
        onClick={handleVerify}
        disabled={loading || timeLeft === 0}
      >
        {loading ? (
          <ClipLoader size={20} color="#fff" />
        ) : (
          'Verify OTP'
        )}
      </VerifyButton>

      <p className="text-center mt-4 text-sm text-gray-600">
        Didn't receive OTP?{' '}
        <button 
          className="text-indigo-600 hover:underline"
          onClick={() => setTimeLeft(600)}
        >
          Resend OTP
        </button>
      </p>
    </OtpContainer>
  );
};

export default Login;