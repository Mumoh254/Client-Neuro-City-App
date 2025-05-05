import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { 
  FiCompass, 
  FiNavigation, 
  FiRadio, 
  FiRepeat,
  FiMessageCircle,
  FiUserPlus
} from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import sakajaImage from '/image.png';
import nairobiCityImage from '/images/nairobi.png';
import { getUserNameFromToken } from '../components/handler/tokenDecoder';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Poppins', sans-serif;
  }

  body {
    background: #f8fafc;
  }
`;

const DashboardContainer = styled(Container)`
  min-height: 100vh;
  padding: 0rem 1rem;
  position: relative;
  background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);

  @media (max-width: 768px) {
    padding: 0rem;
  }
`;

const HeroSection = styled.div`
  background: linear-gradient(rgba(25, 65, 120, 0.85), rgba(10, 40, 80, 0.85)),
    url(${nairobiCityImage});
  background-size: cover;
  background-position: center;
  border-radius: 24px;
  margin: 2rem 0;
  padding: 4rem 1rem;
  color: white;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  color: white;

  h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    z-index: 2;
    color: #fff;
    font-weight: 700;
    
  }

  p {
    font-size: 1.4rem;
    max-width: 800px;
    margin: 0 auto;
    z-index: 2;
    color: #e0e7ff;
    font-weight: 300;
  }

  @media (max-width: 768px) {
    min-height: 300px;

    h1 {
      font-size: 2rem;
    }
    
    p {
      font-size: 1.1rem;
    }
  }
`;

const ServiceCard = styled(NavLink)`
  display: block;
  padding: 2rem;
  background: linear-gradient(135deg, ${props => props.bg} 0%, ${props => props.bg2} 100%);
  border-radius: 1rem;
  text-align: center;
  color: white;
  transition: all 0.3s ease;
  text-decoration: none;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  height: 100%;
  border: 2px solid rgba(255,255,255,0.2);
color: #e0e7ff;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 8px 12px rgba(0,0,0,0.2);
  }

  svg {
    margin-bottom: 1rem;
    font-size: 2.5rem;
  }

  h3 {
    font-size: 1.2rem;
    font-weight: 600;
  }
`;

const GovernorSection = styled.div`
  background: linear-gradient(135deg, #1a4393 0%, #2a8c4a 100%);

  margin: 4rem 0;
  padding: 3rem;
  color: white;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  align-items: center;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  color: #e0e7ff;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 2rem;
  }
`;

const GovernorImage = styled.div`
  background: url(${sakajaImage});
  background-size: cover;
  background-position: center;
  border-radius: 16px;
  height: 350px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
`;

const GovernorContent = styled.div`  
  h2 {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    color: #fff;
    font-weight: 700;
  }

  p {
    font-size: 1.2rem;
    line-height: 1.6;
    margin-bottom: 2rem;
    color: #e0e7ff;
  }

  @media (max-width: 768px) {
    h2 {
      font-size: 2rem;
    }
    
    p {
      font-size: 1rem;
    }
  }
`;


const LandingPage = () => {
  const services = [
    { 
      icon: <FiCompass />, 
      title: "Smart Parking", 
      to: "/parking-card",
      bg: '#6366f1',
      bg2: '#8b5cf6'
    },
    { 
      icon: <FiRepeat />, 
      title: "Recycle Platics", 
      to: "/plastics-recycles",
      bg: '#10b981',
      bg2: '#059669'
    },
    { 
      icon: <FiMessageCircle />, 
      title: "Emergency", 
      to: "/emergency",
      bg: '#ef4444',
      bg2: '#dc2626'
    },
    { 
      icon: <FiRadio />, 
      title: "City News", 
      to: "/e-city-news-feed",
      bg: '#3b82f6',
      bg2: '#2563eb'
    },
    { 
      icon: <FiNavigation />, 
      title: "Traffic", 
      to: "/traffic",
      bg: '#8b5cf6',
      bg2: '#7c3aed'
    },
    { 
      icon: <FiUserPlus />, 
      title: "Register", 
      to: "/register",
      bg: '#f59e0b',
      bg2: '#d97706'
    },
  ];

  const  [   username  , setUsername]= useState(null)
  useEffect(() => {
        const userData = getUserNameFromToken();
        if (userData) setUsername(userData.name);
      }, []);
    console.log('username  is '  ,  username)

  return (
    <>
      <GlobalStyles />
      <DashboardContainer fluid>
      <HeroSection>
  <h1>Hellow, <span>{username}</span> <br /> Welcome to Nairobi 🌆</h1>
  <p>🌿 East Africa's Green City in the Sun</p>
  <p> The <strong>Neuro City App</strong> powered by <em>Welt Tallis</em></p>
  <p style={{ color: 'green', fontWeight: 'bold' }}>🟢 You’re online</p>
</HeroSection>


        <Row className="g-4">
          {services.map((service, index) => (
            <Col key={index} xs={6} md={4} lg={3}>
              <ServiceCard 
                to={service.to}
                bg={service.bg}
                bg2={service.bg2}
              >
                {service.icon}
                <h3>{service.title}</h3>
              </ServiceCard>
            </Col>
          ))}
        </Row>

        <GovernorSection>
  <GovernorImage />
  <GovernorContent>
    <h2>Governor Johnson Sakaja</h2>
    <p>
      "Our vision is to make Nairobi a world-class city that works for everyone.
      Through innovation and community engagement, we're transforming our city
      into a green, modern hub that embraces the future through tech."
    </p>

    <div>
      <strong>Powered by Welt Tallis Corporation</strong>
      <p>Where Creativity Meets Innovation</p>
      <p>Peter Mumo</p>
      <p>call: 0104148448</p>
      <p>Whats-App: 0740045355</p>
      <p>The Neuro-City-app  System V1.0.0.1 — Last Updated April 22 2025 </p>
    </div>
  </GovernorContent>
</GovernorSection>


      
      </DashboardContainer>
    </>
  );
};

export default LandingPage;