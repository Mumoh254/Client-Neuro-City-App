import { useAuth } from '../Context/authContext';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaChartLine, FaUsers, FaShieldAlt, FaDownload, FaCogs, FaDatabase, FaChartPie, FaNewspaper } from 'react-icons/fa';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <LoadingMessage>Loading user data...</LoadingMessage>;
  }

  return (
    <DashboardContainer>
      <Header>
        <h1>Neuro city apps - Admin Dashboard</h1>
      
      </Header>

      <SectionGrid>
        <SectionCard color="#4a69bd" onClick={() => navigate('/analytics')}>
          <FaChartLine />
          <h3>System Analytics</h3>
          <p>View comprehensive system metrics</p>
        </SectionCard>

        <SectionCard color="#2d9c6f" onClick={() => navigate('/users')}>
          <FaUsers />
          <h3>User Management</h3>
          <p>Manage user accounts & permissions</p>
        </SectionCard>

        <SectionCard color="#e55039" onClick={() => navigate('/data-corruption')}>
          <FaShieldAlt />
          <h3>Data Integrity</h3>
          <p>Handle data corruption reports</p>
        </SectionCard>

        <SectionCard color="#f6b93b" onClick={() => navigate('/corporate-install-counts')}>
          <FaDownload />
          <h3>Install Metrics</h3>
          <p>Track application installations</p>
        </SectionCard>

        <SectionCard color="#6a89cc" onClick={() => navigate('http://localhost:8000/status')}>
          <FaCogs />
          <h3>Performance Monitor</h3>
          <p>Real-time system performance</p>
        </SectionCard>

        <SectionCard color="#8e44ad" onClick={() => navigate('/coorporate/services-registration-analytics')}>
          <FaDatabase />
          <h3>User Analytics</h3>
          <p>Detailed user data insights</p>
        </SectionCard>

        <SectionCard color="#1abc9c" onClick={() => navigate('/corruption-dashboard')}>
          <FaChartPie />
          <h3>Corruption Analytics</h3>
          <p>Visualize corruption patterns</p>
        </SectionCard>

        <SectionCard color="#3498db" onClick={() => navigate('/coorporate/services-registration-analytics')}>
          <FaChartLine />
          <h3>Service Registrations</h3>
          <p>Track service signups</p>
        </SectionCard>

        <SectionCard color="#e67e22" onClick={() => navigate('/create-news')}>
          <FaNewspaper />
          <h3>News Management</h3>
          <p>Create & manage news content</p>
        </SectionCard>
      </SectionGrid>
    </DashboardContainer>
  );
};

// Styled Components
const DashboardContainer = styled.div`
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 3rem;
  
  h1 {
    color: #2d3436;
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
`;

const WelcomeMessage = styled.div`
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  display: inline-block;
  
  h2 {
    color: #4a69bd;
    margin-bottom: 0.5rem;
  }
`;

const RoleBadge = styled.span`
  background: #4a69bd;
  color: white;
  padding: 0.3rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const SectionCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 4px solid ${props => props.color};
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.12);
  }

  svg {
    color: ${props => props.color};
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  h3 {
    color: #2d3436;
    margin-bottom: 0.5rem;
    font-size: 1.3rem;
  }

  p {
    color: #636e72;
    font-size: 0.9rem;
    line-height: 1.4;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #636e72;
`;

export default AdminDashboard;