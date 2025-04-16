import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Spinner } from 'react-bootstrap';
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE = 'http://localhost:8000/apiV1/smartcity-ke';

const RegistrationAnalytics = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/analytics/?range=${timeRange}`);
        
        const processedData = data.registrationData.map(entry => ({
          ...entry,
          dailyTotal: entry.Male + entry.Female + entry.Other
        }));

        setChartData(processedData);
        setLoading(false);
      } catch (error) {
        Swal.fire('Error', 'Failed to load registration analytics', 'error');
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  const handleExport = () => {
    window.open(`${API_BASE}/export`, '_blank');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container className="my-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Registration Analytics</h5>
          <div className="d-flex align-items-center gap-3">
            <select 
              className="form-select form-select-sm"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <Button 
              variant="light" 
              onClick={handleExport}
              size="sm"
            >
              <i className="bi bi-download me-2"></i>
              Export CSV
            </Button>
          </div>
        </Card.Header>
        
        <Card.Body>
          <div style={{ height: '500px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#6c757d' }}
                  label={{ 
                    value: 'Date', 
                    position: 'bottom', 
                    fill: '#495057' 
                  }}
                />
                <YAxis
                  label={{ 
                    value: 'Registrations', 
                    angle: -90, 
                    position: 'left', 
                    fill: '#6c757d' 
                  }}
                />
                <Tooltip
                  contentStyle={{
                    background: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => (
                    <span className="text-capitalize">{value}</span>
                  )}
                />
                
                {/* Daily Gender Distribution Bars */}
                <Bar 
                  dataKey="Male" 
                  stackId="a" 
                  fill="#3b82f6" 
                  name="Male Registrations"
                />
                <Bar 
                  dataKey="Female" 
                  stackId="a" 
                  fill="#ec4899" 
                  name="Female Registrations"
                />
                
                {/* Daily Total Trend Line */}
                <Line 
                  type="monotone" 
                  dataKey="dailyTotal" 
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Daily Total"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RegistrationAnalytics;