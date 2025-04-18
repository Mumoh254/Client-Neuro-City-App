import { useState } from 'react'
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom'
import { FiHome, FiMapPin, FiNavigation ,FiAlertCircle, FiCloud, FiMenu, FiX, 
  FiUser, FiTrash2, FiStar, FiMap, FiActivity, FiSettings, FiBook, FiRadio, FiMessageCircle, FiUserPlus } from 'react-icons/fi';
  import { PiUserSoundFill } from "react-icons/pi";
  import { FaInternetExplorer } from "react-icons/fa6";
  import { FaTrashRestoreAlt ,  FaHome  ,  FaPeopleCarry } from "react-icons/fa";
import { FaCircleInfo } from "react-icons/fa6";
import { GiMoonClaws } from "react-icons/gi";
import { SiGoogleanalytics } from "react-icons/si";
import styled from 'styled-components'
import LandingPage from './pages/landPage'
import ParkingForm from './parking/park'
import GarbageManagementSystem from "./garbage/garbageSearch"
import ReviewsSection from './reviews/review'
import PublicAmenities from './public/publicamenities'
import LiveTrackingMap from './devices/liveTracking'
import TomTomTrafficMap from './weatherAndTraffice/tomtomTrafic'
import RegisterDevice from './devices/registerDevice'
import ReportLost from './devices/reportLostDevice'
import AnalyticsDashboard from "./painpoints/painpoints"
import RegistrationAnalytics from "./userData/userRegistration"
import WeatherNairobi from './weatherAndTraffice/weather'
import StagesData from './public/stages'
import PlasticRecyclingApp from './garbage/plastics'
import EmergencyServices from './pages/emergency'
import QrCodeGenerator from './qr'
import Register from './authFolder/register';
import Login from './authFolder/login';
import TermsAndConditions from './authFolder/termsConditions';
import ReportCorruption from "./painpoints/reportCorruption"
import SoftwareFeedback from './software/softwareFeedback';
import Favourites from './favourites/favourites';
import   CorruptionDashboard   from "./painpoints/corruptAnalytics"

const AppContainer = styled.div`
  display: flex;
  min-height: fit-content;
  position: relative;
  margin-bottom: 5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    min-height: fit-content;
  }
`

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
`

const Sidebar = styled.nav`
  width: 240px;
  height: 100vh;
  overflow-y: auto;
  background: #ffffff;
  padding: 1rem;
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
  z-index: 2000;

  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;

  @media (max-width: 768px) {
    position: fixed;
    transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
    width: 280px;
    padding-top: 3rem;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
    height: 100vh;
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

    @media (max-width: 768px) {
      font-size: 1rem;
      padding: 1rem;
    }
  }
`

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  padding-bottom: 80px;

  @media (max-width: 768px) {
    padding: 1rem;
    padding-top: 4rem;
    padding-bottom: 80px;
  }
`

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  display: ${props => props.$visible ? 'block' : 'none'};
`

const StickyButtons = styled.div`
  position: fixed;
  bottom: 8rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 1000;
  flex-direction: column;

  a, button {
    padding: 0.75rem;
    border-radius: 50%;
    background: rgba(99, 101, 241, 0.82);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.39);
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
      background: #4f46e5;
    }
  }
`

const BottomNav = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem;
  display: flex;
  justify-content: space-around;
  z-index: 1000;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.1);
  backdrop-filter: blur(12px);


`

const NavItem = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  color: #64748b;
  text-decoration: none;
  transition: all 0.2s ease;

  &.active {
    color: #6366f1;
    
    svg {
      transform: translateY(-4px);
    }
  }

  svg {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
    transition: all 0.2s ease;
  }

  span {
    font-size: 0.75rem;
  }
`

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <HashRouter>
      <AppContainer>
        <MobileMenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </MobileMenuButton>

        <Backdrop $visible={isMenuOpen} onClick={() => setIsMenuOpen(false)} />

        <Sidebar $isOpen={isMenuOpen}>
          <NavLink to="/" end onClick={() => setIsMenuOpen(false)}>
            < FaHome /> Home
          </NavLink>
          <NavLink to="/parking" onClick={() => setIsMenuOpen(false)}>
            <FiMapPin /> Parking
          </NavLink>
          <NavLink to="/garbage" onClick={() => setIsMenuOpen(false)}>
            <FaTrashRestoreAlt /> Garbage
          </NavLink>
          <NavLink to="/reviews" onClick={() => setIsMenuOpen(false)}>
            <PiUserSoundFill /> Community-Hub
          </NavLink>
          <NavLink to="/amenities" onClick={() => setIsMenuOpen(false)}>
            <FiMap /> Amenities
          </NavLink>
          <NavLink to="/analytics" onClick={() => setIsMenuOpen(false)}>
            <SiGoogleanalytics  /> Analytics
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
          <NavLink to="/tracking" onClick={() => setIsMenuOpen(false)}>
            <FiSettings /> Tracking
          </NavLink>
          <NavLink to="/terms" onClick={() => setIsMenuOpen(false)}>
            <GiMoonClaws  /> Terms
          </NavLink>
          <NavLink to="/login" onClick={() => setIsMenuOpen(false)}>
            <FiUser /> Login
          </NavLink>
          <NavLink to="/software-feedback" className="button">
            <FaCircleInfo size={24} />Software Guide
          </NavLink>
        </Sidebar>

        <MainContent>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/parking" element={<ParkingForm />} />
            <Route path="/garbage" element={<GarbageManagementSystem />} />
            <Route path="/plastics" element={<PlasticRecyclingApp />} />
            <Route path="/reviews" element={<ReviewsSection />} />
            <Route path="/amenities" element={<PublicAmenities />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/registrations" element={<RegistrationAnalytics />} />
            <Route path="/weather" element={<WeatherNairobi />} />
            <Route path="/stages" element={<StagesData />} />
            <Route path="/traffic" element={<TomTomTrafficMap />} />
            <Route path="/tracking" element={<LiveTrackingMap />} />
            <Route path="/emergency" element={<EmergencyServices />} />
            <Route path="/register-device" element={<RegisterDevice />} />
            <Route path="/gr" element={<QrCodeGenerator />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/software-feedback" element={<SoftwareFeedback />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/peoples/favourites" element={<Favourites />} />
            <Route path="/report-corruption" element={<ReportCorruption />} />
            <Route path="/user-registartion-analytics" element={<RegistrationAnalytics />} />
            <Route path="/corruption-analytics" element={< CorruptionDashboard />} />
           
          </Routes>
        </MainContent>

        {/* Global Bottom Navigation */}
        <BottomNav>
        
          <NavItem to="/news">
            <FiRadio />
            <span>News</span>
          </NavItem>
          <NavItem to="/login">
            <FiUserPlus />
            <span>login</span>
          </NavItem>
          <NavItem to="/report-corruption">
            <FiMessageCircle />
            <span>Corruption</span>
          </NavItem>


          <NavItem to="/report-corruption">
            <FaPeopleCarry />
            <span>Community</span>
          </NavItem>

          

          <NavItem to="/">
            <FaHome />
            <span>Home</span>
          </NavItem>

          
        </BottomNav>

        <StickyButtons>
          <NavLink to="/peopels/favourites" className="button">
            <FiCloud size={24} />
          </NavLink>
          <NavLink to="/traffic" className="button">
            <FiNavigation size={24} />
          </NavLink>
        </StickyButtons>
      </AppContainer>
    </HashRouter>
  )
}

export default App