import React, { useState } from 'react';
import { useNavigate  , Link} from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import styled from 'styled-components';
import { FaCity, FaEnvelope, FaLock, FaSpinner, FaGoogle, FaGithub } from 'react-icons/fa';


const  BASE_URl = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";

const LoginContainer = styled.div`
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

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  h2 {
    font-size: 1.75rem;
    color: #1e293b;
    margin: 1rem 0 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  p {
    color: #64748b;
    font-size: 0.9rem;
  }
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const IconStyled = styled.span`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6366f1;
  font-size: 1.1rem;
`;

const InputField = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #ffffff;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const SubmitButton = styled.button`
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

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

const SocialLogin = styled.div`
  margin-top: 2rem;
  text-align: center;

  p {
    color: #6366f1;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
`;

const SocialButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #6366f1;
  border-radius: 10px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
  margin-bottom: 0.75rem;

  &:hover {
    border-color:  #f8fafc ;
   color: #f8fafc;
    background: #6366f1;
  }
`;

const Login = () => {
  const navigate = useNavigate();
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await axios.post(`${BASE_URl}/login`, { 
        Email, 
        Password 
      });
  
  
      console.log(response.data.user);
  
      if (response && response.data.sucess && response.data.user) {
        // Successful login
      
        console.log(response.data.user.Email)
        localStorage.setItem('userEmail', Email);
        
   
        console.log('Stored user email in localStorage:', localStorage.getItem('userEmail'));
  
        showAlert('success', 'Login successful, your OTP has been sent to your email!');
        navigate('/verify-otp');
      } else {
      
        showAlert('info', 'User not registered. Redirecting to the register page.');
        navigate('/register');
      }
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <LoginContainer>
      <LoginHeader>
        <FaCity size={32} color="#4f46e5" />
        <h2>Welcome to Neuro-City-Apps </h2>
        <p>Access The city From Your  Fingertips </p>
      </LoginHeader>
      
      <LoginForm onSubmit={handleSubmit}>
        <InputGroup>
          <IconStyled><FaEnvelope /></IconStyled>
          <InputField
            type="Email"
            placeholder="Email address"
            value={Email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </InputGroup>

        <InputGroup>
          <IconStyled><FaLock /></IconStyled>
          <InputField
            type="Password"
            placeholder="Password"
            value={Password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </InputGroup>

        <SubmitButton type="submit" disabled={loading}>
          {loading ? (
            <>
              <FaSpinner className="spinner" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </SubmitButton>

        
                 
      </LoginForm>

      
{/* 
      <SocialLogin>
        <p>Or continue with</p>
        <SocialButton>
          <FaGoogle size={20} />
          Google
        </SocialButton>
      
      </SocialLogin> */}

      <div>
         <p className="text-center mt-4 text-sm text-gray-600">
                      Dont  Have  An Account?{' '}
                      <Link to="/register" className="text-indigo-600 hover:underline">
                      Register Here !
                    </Link>
        </p>   <p className="text-center mt-4 text-sm text-gray-600">
                      Forgot  your Password ?{' '}
                      <Link to="/register" className="text-indigo-600 hover:underline">
                      Request Password Reset  !
                    </Link>
        </p>
    </div>
    </LoginContainer>

   
  );
};

export default Login;
