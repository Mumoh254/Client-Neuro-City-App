import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ClockLoader } from 'react-spinners';
import styled from 'styled-components';

const OtpContainer = styled.div`
  max-width: 440px;
  margin: 4rem auto;
  padding: 2.5rem;
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #4f46e5 0%, #6366f1 100%);
  }
`;

const OtpHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  h2 {
    font-size: 1.75rem;
    color: #1e293b;
    margin: 1rem 0 0.5rem;
  }

  p {
    color: #64748b;
    font-size: 0.9rem;

    span {
      font-weight: 600;
      color: #4f46e5;
    }
  }
`;

const OtpInputs = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
`;

const OtpDigit = styled.input`
  width: 55px;
  height: 55px;
  text-align: center;
  font-size: 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }

  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    font-size: 1rem;
    border-radius: 8px;
  }
`;


const VerifyButton = styled.button`
  width: 100%;
  padding: 0.9rem;
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
  }

  &:disabled {
    background: #cbd5e1;
    transform: none;
    box-shadow: none;
    cursor: not-allowed;
  }
`;

const ResendLink = styled.button`
  color: #4f46e5;
  background: none;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
    text-decoration: underline;
  }

  &:disabled {
    color: #94a3b8;
    cursor: not-allowed;
    text-decoration: none;
  }
`;

const TimerText = styled.span`
  color: #64748b;
  font-size: 0.9rem;
`;

const VerifyOtp = () => {
  const BASE_URL = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";
  const navigate = useNavigate();
  const location = useLocation();
  const storedEmail = location.state?.email || localStorage.getItem('userEmail');

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);

  const showAlert = (type, message) => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: type,
      title: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  };

  useEffect(() => {
    if (!storedEmail) {
      showAlert('error', 'Please login first');
      navigate('/login');
      return; // prevent further logic if no email
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, storedEmail]);

  const handleInputChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        const next = document.getElementById(`otp-${index + 1}`);
        if (next) next.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6).replace(/\D/g, '');
    const newOtp = pasteData.split('').slice(0, 6);
    if (newOtp.length === 6) setOtp(newOtp);
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      showAlert('error', 'Please enter a valid 6-digit OTP');
      return;
    }

    if (timeLeft === 0) {
      showAlert('error', 'OTP has expired. Please request a new one.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/verify-otp`, {
        email: storedEmail,
        otp: otpCode,
      });

      localStorage.removeItem('userEmail');
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.role);
      localStorage.setItem('authVerified', 'true');

      const event = new Event('authStateChanged');
      window.dispatchEvent(event);
      setTimeout(() => {
        const role = response.data.role.toLowerCase();
        if (role === 'admin') {
          window.location.href = '/admin-dashboard';
        } else if (role === 'corporate') {
          window.location.href = '/corporate-analytics';
        } else {
          window.location.href = '/peoples/favourites';
        }
      }, 100);
      


    } catch (error) {
      showAlert('error', error.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await axios.post(`${BASE_URL}/resend-otp`, { email: storedEmail });
      setTimeLeft(600);
      setOtp(['', '', '', '', '', '']);
      showAlert('success', 'New OTP sent to your email!');
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Failed to resend OTP');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <OtpContainer>
      <OtpHeader>
        <h2>Verify OTP</h2>
        <p>Enter the 6-digit code sent to <span>{storedEmail}</span></p>
      </OtpHeader>

      <OtpInputs onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <OtpDigit
            key={index}
            id={`otp-${index}`}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleInputChange(index, e.target.value)}
            autoFocus={index === 0}
          />
        ))}
      </OtpInputs>

      <VerifyButton onClick={handleVerify} disabled={loading}>
        {loading ? <ClockLoader size={20} color="#fff" /> : 'Verify OTP'}
      </VerifyButton>

      <div className="text-center mt-4">
        <TimerText>Code expires in: {formatTime(timeLeft)}</TimerText>
        <div className="mt-2">
          <ResendLink onClick={handleResendOtp} disabled={timeLeft > 0}>
            Resend OTP {timeLeft > 0 && `(in ${formatTime(timeLeft)})`}
          </ResendLink>
        </div>
      </div>
    </OtpContainer>
  );
};

export default VerifyOtp;
