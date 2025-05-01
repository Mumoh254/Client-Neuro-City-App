// App.js
import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import {
  FiHome, FiMapPin, FiNavigation, FiAlertCircle, FiCloud, FiMenu, FiX,
  FiUser, FiTrash2, FiStar, FiMap, FiActivity, FiSettings, FiBook, FiRadio,
  FiMessageCircle, FiUserPlus, FiArrowLeft, FiArrowRight
} from 'react-icons/fi';
import { LuLogOut } from "react-icons/lu";
import { RiBatteryChargeFill } from "react-icons/ri";
import { BsChatSquareQuoteFill } from "react-icons/bs";
import { PiUserSoundFill } from "react-icons/pi";
import { FaInternetExplorer, FaTrashRestoreAlt, FaHome, FaRecycle, FaDownload, FaPeopleCarry } from "react-icons/fa";
import { FaCircleInfo } from "react-icons/fa6";
import { GiMoonClaws } from "react-icons/gi";
import { SiGoogleanalytics } from "react-icons/si";
import styled from 'styled-components';
import { IoLogoDesignernews } from "react-icons/io5";
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
import Gems from './components/foods-gems/gems';
import Download from './components/downloader/download';
import EVCharging from "./components/Green-Energy/Evs-Cars/findEvsStations"
import ParkingSessionCard from "./components/parking/parkingCard"
import ParkingSubscriptionModel from './components/parking/parkingsubscriptionModel';
import AdminServices from './admin/controller/adminServices';
import AdminJobs from './admin/controller/adminJobs';


const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  position: relative;
  @media (max-width: 768px) {
    flex-direction: column;
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
  padding: 0.45rem;
  display: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  @media (max-width: 768px) {
    display: ${props => props.$show ? 'block' : 'none'};
  }
`;

const Sidebar = styled.nav`
  width: 240px;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  background: #ffffff;
  padding:0.45rem;
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
  padding: 0.25rem;
  margin-left: ${props => props.$sidebarVisible ? '240px' : '0'};
  min-height: calc(100vh - 80px);
  position: relative;
  
  @media (max-width: 768px) {
    margin-left: 0;
    padding: 0.25rem;
    padding-top: ${props => props.$sidebarVisible ? '4rem' : '0'};
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
  padding: 0.25rem 0;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
  display: ${props => props.$show ? 'flex' : 'none'};

  a {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.25rem;
    color: #64748b;
    text-decoration: none;
    font-size: 0.75rem;
  
    &.active {
      color: #6366f1;
    }
    
    svg {
      font-size: 0.75rem;
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
  const [username, setUsername] = useState('');
  const isAdmin = user?.role === 'admin';
  const showSidebar = !isAdmin && user;

  useEffect(() => {
    const userData = getUserNameFromToken();
    if (userData) setUsername(userData.name);
  }, []);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  return (
    <AppContainer>
      {showSidebar && (
        <>
          <MobileMenuButton 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            $show={showSidebar}
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </MobileMenuButton>
          <Backdrop $visible={isMenuOpen} onClick={() => setIsMenuOpen(false)} />
        </>
      )}

      {showSidebar && (
        <Sidebar $isOpen={isMenuOpen}>
          <div className="user-greeting" style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '20px',
            background: '#f1f5f9',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}>
            <FiUser size={14} style={{ color: '#4f46e5' }} />
            <span style={{
              fontSize: '10px',
              fontWeight: 300,
              color: '#334155'
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

          {/* Sidebar Navigation Links */}
          <NavLink to="/" end onClick={() => setIsMenuOpen(false)}>
            <FaHome /> Home
          </NavLink>

          <NavLink to="/smart-parking" onClick={() => setIsMenuOpen(false)}>
            <FiMapPin /> Parking
          </NavLink>

          <NavLink to="/parking-card" onClick={() => setIsMenuOpen(false)}>
            <RiBatteryChargeFill /> Parks
          </NavLink>

          <NavLink to="/zero-garbage" onClick={() => setIsMenuOpen(false)}>
            <FaTrashRestoreAlt /> Garbage
          </NavLink>

          <NavLink to="/comunity-suport" onClick={() => setIsMenuOpen(false)}>
            <PiUserSoundFill />E-Community 
          </NavLink>

          <NavLink to="/e-city-news-feed" onClick={() => setIsMenuOpen(false)}>
            <IoLogoDesignernews />News & Updates
          </NavLink>

          <NavLink to="/e-chats" onClick={() => setIsMenuOpen(false)}>
            <BsChatSquareQuoteFill /> E-Chats
          </NavLink>

          <button onClick={handleLogout} className="logout-button">
            <LuLogOut /> Logout
          </button>
        </Sidebar>
      )}

      <MainContent $sidebarVisible={showSidebar}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/model" element={<ParkingSubscriptionModel />} />
          <Route path="/admin-services" element={<AdminServices />} />
          <Route path="/admin-jobs" element={<AdminJobs  />} />
     
      

          {/* Protected User Routes */}
          <Route element={<ProtectedRoute />}>


          <Route path="/parking-card" element={<ParkingSessionCard />} />
            <Route path="/nairobi-must-visit-places" element={<PlacesCarousel />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/software-guide-feedback" element={<SoftwareFeedback />} />
            <Route path="/gems" element={<PageWithBack title="Local Gems & Foods"><Gems /></PageWithBack>} />
            <Route path="/download-neuro-app" element={<PageWithBack><Download /></PageWithBack>} />
            <Route path="/traffic" element= {<PageWithBack title="Live Traffic"><TomTomTrafficMap /></PageWithBack>} />
            <Route path="/smart-parking" element={<PageWithBack><ParkingForm /></PageWithBack>} />
            <Route path="/zero-garbage" element={<PageWithBack title="Waste Management"><GarbageManagementSystem /></PageWithBack>} />
            <Route path="/plastics-recycles" element={<PageWithBack title="Recycle Plastic"><PlasticRecyclingApp /></PageWithBack>} />
            <Route path="/comunity-suport" element={<PageWithBack><ReviewsSection /></PageWithBack>} />
            <Route path="/weather" element={<PageWithBack><WeatherNairobi /></PageWithBack>} />
            <Route path="/e-city-news-feed" element={<PageWithBack><NewsFeed /></PageWithBack>} />
            <Route path="/jobs-list" element={<PageWithBack><JobsList /></PageWithBack>} />
            <Route path="/e-chats" element={<PageWithBack><ReviewSection /></PageWithBack>} />

         
          </Route>

          {/* Admin Routes - No Sidebar */}
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/create-news" element={<CreateNews />} />
            <Route path="/corruption-dashboard" element={<CorruptionDashboard />} />
            <Route path="/corporate-install-counts" element={<InstallCount />} />
            <Route path="/corporate-analytics" element={<CorporateAnalytics />} />
            <Route path="/cooprate-registartrion-analytics" element={<RegistrationAnalytics />} />
            <Route path="/coorporate/services-registration-analytics" element={<ServicesAnalyticsDashboard />} />
          </Route>

          {/* Corporate Routes */}
          <Route element={<ProtectedRoute roles={["corporate"]} />}>
            <Route path="/corporate-analytics" element={<CorporateAnalytics />} />
            <Route path="/corporate-install-counts" element={<InstallCount />} />
          </Route>
        </Routes>

        {showSidebar && (
          <BottomNav $show={showSidebar}>
            <NavLink to="/plastics-recycles">
              <FaTrashRestoreAlt /> Recycle
            </NavLink>
            <NavLink to="/peoples/favourites">
              <FaInternetExplorer /> Explore
            </NavLink>
            <NavLink to="/comunity-suport">
              <FaPeopleCarry /> Support
            </NavLink>
            <NavLink to="/download-neuro-app">
              <FaDownload /> Download
            </NavLink>
            <NavLink to="/" end>
              <FiHome /> Home
            </NavLink>
          </BottomNav>
        )}
      </MainContent>
    </AppContainer>
  );
}

export default App;