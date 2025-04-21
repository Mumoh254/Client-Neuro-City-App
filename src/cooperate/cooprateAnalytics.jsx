import { useAuth } from '../Context/authContext';

const CorporateAnalytics = () => {
  const { user } = useAuth();

  return (
    <div className="corporate-analytics">
      <h1>Corporate Analytics Dashboard</h1>
      <div className="corporate-header">
        <h2>Welcome {user?.companyName || 'Corporate User'}</h2>
        <p>Account Type: {user?.role}</p>
      </div>
      
      <div className="analytics-sections">
        <section className="business-metrics">
          <h3>Business Performance</h3>
          {/* Add corporate-specific metrics */}
        </section>
        
        <section className="service-analytics">
          <h3>Service Analytics</h3>
          {/* Add service analytics components */}
        </section>
      </div>
    </div>
  );
};

export default CorporateAnalytics;