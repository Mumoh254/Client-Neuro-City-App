// App.js
import { useState  , useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import {
  FiHome, FiMapPin, FiNavigation, FiAlertCircle, FiCloud, FiMenu, FiX,
  FiUser, FiTrash2, FiStar, FiMap, FiActivity, FiSettings, FiBook, FiRadio,
  FiMessageCircle, FiUserPlus, FiArrowLeft, FiArrowRight
} from 'react-icons/fi';
import { PiUserSoundFill } from "react-icons/pi";
import { FaInternetExplorer, FaTrashRestoreAlt, FaHome, FaRecycle, FaPeopleCarry } from "react-icons/fa";
import { FaCircleInfo } from "react-icons/fa6";
import { GiMoonClaws } from "react-icons/gi";
import { SiGoogleanalytics } from "react-icons/si";
import styled from 'styled-components';

// Import components
import VerifyOtp from './authFolder/verifyOtp';
import LandingPage from './pages/landPage';
import ParkingForm from './components/parking/park';
import GarbageManagementSystem from "./components/garbage/garbageSearch";
import ReviewsSection from './components/reviews/comunittySuport';
import PublicAmenities from './components/public/publicamenities';
import LiveTrackingMap from './components/devices/liveTracking';
import TomTomTrafficMap from './components/weatherAndTraffice/tomtomTrafic';
import AnalyticsDashboard from "./components/painpoints/painpoints";
import RegistrationAnalytics from "./admin/userData/userRegistration";
import WeatherNairobi from './components/weatherAndTraffice/weather';
import StagesData from './components/public/stages';
import PlasticRecyclingApp from './components/garbage/plastics';
import EmergencyServices from './pages/emergency';
import Register from './authFolder/register';
import Login from './authFolder/login';
import TermsAndConditions from './components/cooprate-info/cooperate/termsConditions';
import ReportCorruption from "./components/painpoints/reportCorruption";
import SoftwareFeedback from './components/software/softwareFeedback';
import Favourites from './components/favourites/favourites';
import CorruptionDashboard from "./components/painpoints/corruptAnalytics";
import InstallCount from "./admin/userData/downloadsCount";
import NewsFeed from './components/newsFeed/news';
import CreateNews from './components/newsFeed/createNews';
import ServicesAnalyticsDashboard from "./admin/userData/serviceRegisterAnalytics";
import { useAuth } from './Context/authContext';
import ProtectedRoute from './components/protected/protected';
import AdminDashboard from './admin/admin';
import CorporateAnalytics from "./components/cooprate-info/cooperate/cooprateAnalytics";
import CommunityHub from './components/reviews/comunittySuport';
import CreateService from './components/reviews/createService';
import ServicesList from './components/reviews/servicesList';
import { PageWithBack } from './components/handler/goBack';
import PlacesCarousel from './components/favourites/places';
import CreateJob  from "./components/jobs/createJob"
import JobsList from './components/jobs/joblist';
import ReviewSection from './chats/chats';
import { getUserNameFromToken } from './components/handler/tokenDecoder';


// Styled Components

const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  responsive: [
    {
      breakpoint: 992,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1
      }
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1
      }
    }
  ]
};
const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  position: relative;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const HistoryControls = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  border-radius: 8px;
  padding: 0.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const HistoryButton = styled.button`
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #4f46e5;
    transform: translateY(-1px);
  }
`;

const MobileMenuButton = styled.button`
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  display: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  @media (max-width: 768px) {
    display: block;
  }
`;

const Sidebar = styled.nav`
  width: 240px;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  background: #ffffff;
  padding: 1rem;
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 5000;

  @media (max-width: 768px) {
    transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
    width: 280px;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid #e2e8f0;
    
    svg {
      font-size: 1.5rem;
      color: #6366f1;
    }
    
    span {
      font-weight: 500;
      color: #1e293b;
    }
  }

  a {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    margin: 0.5rem 0;
    border-radius: 8px;
    color: #64748b;
    text-decoration: none;
    transition: all 0.2s ease;
    
    &:hover {
      background: #f1f5f9;
      color: #6366f1;
    }
    
    &.active {
      background: #6366f1;
      color: white !important;
    }
  }

  button.logout-button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    margin-top: auto;
    border: none;
    border-radius: 8px;
    background: #f1f5f9;
    color: #ef4444;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: #fee2e2;
      color: #dc2626;
    }
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  margin-left: 240px;
  min-height: calc(100vh - 80px);
  position: relative;
  
  @media (max-width: 768px) {
    margin-left: 0;
    padding: 1rem;
    padding-top: 4rem;
    padding-bottom: 80px;
  }
`;

const BottomNav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #ffffff;
  display: flex;
  justify-content: space-around;
  padding: 0.5rem 0;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);

  a {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem;
    color: #64748b;
    text-decoration: none;
    font-size: 0.75rem;
    
    &.active {
      color: #6366f1;
    }
    
    svg {
      font-size: 1.25rem;
      margin-bottom: 0.25rem;
    }
  }
`;

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: rgba(0,0,0,0.3);
  display: ${props => props.$visible ? 'block' : 'none'};
  
  @media (min-width: 769px) {
    display: none;
  }
`;

function App() {


  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login');
  };


  const [username, setUsername] = useState('');

  
    useEffect(() => {
      const userData = getUserNameFromToken();
      if (userData) {
        console.log(userData);
    
        setUsername(userData.name);

      }
    }, []);
  
  return (
    <AppContainer>
      <MobileMenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </MobileMenuButton>
      
      <Backdrop $visible={isMenuOpen} onClick={() => setIsMenuOpen(false)} />

      {user && (
        <Sidebar $isOpen={isMenuOpen}>
        <div className="user-greeting" style={{ 
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 12px',
  borderRadius: '20px',
  background: '#f1f5f9',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  ':hover': {
    background: '#e2e8f0',
    transform: 'translateY(-1px)'
  }
}}>
  <FiUser size={14} className="user-icon" style={{ 
    color: '#4f46e5',
    flexShrink: 0 
  }} />
  <span style={{
    fontSize: '10px',
    fontWeight: 300,
    color: '#334155',
    whiteSpace: 'nowrap'
  }}>
    Welcome, {' '}
    <span style={{
      color: '#4f46e5',
      background: '#e0e7ff',
      padding: '2px 8px',
      borderRadius: '12px',
      marginLeft: '4px',
      fontWeight: 300
    }}>
      {username}
    </span>
  </span>
</div>

          <NavLink to="/" end onClick={() => setIsMenuOpen(false)}>
            <FaHome /> Home
          </NavLink>

          {user?.role === 'admin' && (
            <>
              <NavLink to="/admin" onClick={() => setIsMenuOpen(false)}>
                <SiGoogleanalytics /> Admin Dashboard
              </NavLink>
              <NavLink to="/create-news" onClick={() => setIsMenuOpen(false)}>
                <FiMessageCircle /> Create News
              </NavLink>
            </>
          )}

          {user?.role === 'corporate' && (
            <NavLink to="/corporate-analytics" onClick={() => setIsMenuOpen(false)}>
              <SiGoogleanalytics /> Corporate Analytics
            </NavLink>
          )}

          <NavLink to="/smart-parking" onClick={() => setIsMenuOpen(false)}>
            <FiMapPin /> Parking
          </NavLink>
          <NavLink to="/zero-garbage" onClick={() => setIsMenuOpen(false)}>
            <FaTrashRestoreAlt /> Garbage
          </NavLink>
          <NavLink to="/comunity-suport" onClick={() => setIsMenuOpen(false)}>
            <PiUserSoundFill />E-Community 
          </NavLink>
          <NavLink to="/amenities" onClick={() => setIsMenuOpen(false)}>
            <FiMap /> Amenities
          </NavLink>
          <NavLink to="/analytics" onClick={() => setIsMenuOpen(false)}>
            <SiGoogleanalytics /> Analytics
          </NavLink>
          <NavLink to="/weather" onClick={() => setIsMenuOpen(false)}>
            <FiCloud /> Weather
          </NavLink>
          <NavLink to="/traffic" onClick={() => setIsMenuOpen(false)}>
            <FiNavigation /> Traffic
          </NavLink>
          <NavLink to="/peoples/favourites" onClick={() => setIsMenuOpen(false)}>
            <FaInternetExplorer /> Explore
          </NavLink>
          <NavLink to="/live-tracking" onClick={() => setIsMenuOpen(false)}>
            <FiSettings /> Tracking
          </NavLink>
          <NavLink to="/terms" onClick={() => setIsMenuOpen(false)}>
            <GiMoonClaws /> Terms
          </NavLink>
          <NavLink to="/software-guide-feedback" className="button">
            <FaCircleInfo size={20} /> Software Guide
          </NavLink>

          <NavLink to="/register" className="button">
            <FiUserPlus size={20} /> Register
          </NavLink>

          <button onClick={handleLogout} className="logout-button">
            <FiX /> Logout
          </button>
        </Sidebar>
      )}
      
      <MainContent>
     

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/software-guide-feedback" element={<SoftwareFeedback />} />


          <Route path="/nairobi-must-visit-places" element={<PlacesCarousel />} />
      
          <Route path="/community-suport" element={<CommunityHub />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/traffic" element={<PageWithBack title="Live Traffic"><TomTomTrafficMap /></PageWithBack>} />
            <Route path="/smart-parking" element={<PageWithBack title="Parking Management"><ParkingForm /></PageWithBack>} />
            <Route path="/zero-garbage" element={<PageWithBack title="Waste Management"><GarbageManagementSystem /></PageWithBack>} />
            <Route path="/plastics-recycles" element={<PageWithBack title="Plastic Recycling"><PlasticRecyclingApp /></PageWithBack>} />
            <Route path="/comunity-suport" element={<PageWithBack title="Community Support"><ReviewsSection /></PageWithBack>} />
            <Route path="/amenities" element={<PageWithBack title="Public Amenities"><PublicAmenities /></PageWithBack>} />
            <Route path="/weather" element={<PageWithBack title="Weather Forecast"><WeatherNairobi /></PageWithBack>} />
            <Route path="/stages" element={<PageWithBack title="Transport Stages"><StagesData /></PageWithBack>} />
            <Route path="/services/create" element={<PageWithBack title="Create Service"><CreateService /></PageWithBack>} />
            <Route path="/services/list-view" element={<PageWithBack title="Services Directory"><ServicesList /></PageWithBack>} />
            <Route path="/emergency" element={<PageWithBack title="Emergency Services"><EmergencyServices /></PageWithBack>} />
            <Route path="/e-city-news-feed" element={<PageWithBack title="News-Feed"><NewsFeed /></PageWithBack>} />

            <Route path="/get-jobs-list" element={<PageWithBack title="Job-Lists"><JobsList /></PageWithBack>} />
            
            <Route path="/e-chats" element={<PageWithBack title="E-Chats"><ReviewSection /></PageWithBack>} />
            <Route path="/nairobi-stages-routes" element={<PageWithBack title="E-Chats"><StagesData /></PageWithBack>} />
          
             <Route path="/create-jobs" element={<PageWithBack title="City News">< CreateJob /></PageWithBack>} />
            <Route path="/peoples/favourites" element={<PageWithBack title="Nairobi Favorites"><Favourites /></PageWithBack>} />
            <Route path="/live-tracking" element={<PageWithBack title="Live Tracking"><LiveTrackingMap /></PageWithBack>} />
            <Route path="/community-painpoints-analysis" element={<PageWithBack title="Community Analytics"><AnalyticsDashboard /></PageWithBack>} />
            <Route path="/register-device" element={<PageWithBack title="Device Registration"><LiveTrackingMap /></PageWithBack>} />
            <Route path="/report/coruption-Real-time/analytics" element={<PageWithBack title="Corruption Reports"><ReportCorruption /></PageWithBack>} />
          </Route>

          <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
            <Route path="/admin-dashboard" element={<PageWithBack title="AdminDashboard"><AdminDashboard /></PageWithBack>} />
            <Route path="/create-news" element={<PageWithBack title="Create News"><CreateNews /></PageWithBack>} />
            <Route path="/corruption-dashboard" element={<PageWithBack title="Corruption Analytics"><CorruptionDashboard /></PageWithBack>} />
            <Route path="/corporate-install-counts" element={<PageWithBack title="Install Analytics"><InstallCount /></PageWithBack>} />
            <Route path="/corporate-analytics" element={<PageWithBack title="Corporate Insights"><CorporateAnalytics /></PageWithBack>} />
            <Route path="/cooprate-registartrion-analytics" element={<PageWithBack title="Registration Analytics"><RegistrationAnalytics /></PageWithBack>} />
            <Route path="/coorporate/services-registration-analytics" element={<PageWithBack title="Service Analytics"><ServicesAnalyticsDashboard /></PageWithBack>} />
          </Route>

          <Route element={<ProtectedRoute roles={["corporate"]} />}>
            <Route path="/corporate-install-counts" element={<PageWithBack title="Install Analytics"><InstallCount /></PageWithBack>} />
            <Route path="/corporate-analytics" element={<PageWithBack title="Corporate Insights"><CorporateAnalytics /></PageWithBack>} />
            <Route path="/cooprate-registartrion-analytics" element={<PageWithBack title="Registration Analytics"><RegistrationAnalytics /></PageWithBack>} />
            <Route path="/coorporate/services-registration-analytics" element={<PageWithBack title="Service Analytics"><ServicesAnalyticsDashboard /></PageWithBack>} />
          </Route>
       
        </Routes>

        {user && (
          <BottomNav>
            <NavLink to="/" end>
              <FiHome /> Home
            </NavLink>
            <NavLink to="/peoples/favourites">
              <FaInternetExplorer /> Explore
            </NavLink>
            <NavLink to="/plastics-recycles">
              <FaTrashRestoreAlt /> Recycle
            </NavLink>
            <NavLink to="/comunity-suport">
              <FaPeopleCarry /> Support
            </NavLink>

            <NavLink to="/report/coruption-Real-time/analytics">
              <FaPeopleCarry /> Corruption
            </NavLink>
          </BottomNav>
        )}
      </MainContent>
    </AppContainer>
  );
}

export default App;