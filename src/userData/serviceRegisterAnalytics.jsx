import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Card, Row, Col } from 'react-bootstrap';
import { FaChartLine, FaRegChartBar, FaCalendarAlt } from 'react-icons/fa';

const ServiceAnalytics = () => {
  const [stats, setStats] = useState({ dailyRegistrations: [], dailyLikes: [] });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/services/analytics');
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      }
    };
    fetchStats();
  }, []);

  const chartData = {
    labels: stats.dailyRegistrations.map(d => d.date),
    datasets: [
      {
        label: 'Daily Registrations',
        data: stats.dailyRegistrations.map(d => d.count),
        borderColor: '#4CAF50',
        fill: false
      },
      {
        label: 'Daily Likes',
        data: stats.dailyLikes.map(d => d.likes),
        borderColor: '#F44336',
        fill: false
      }
    ]
  };

  return (
    <div className="p-4">
      <h3 className="mb-4"><FaChartLine /> Service Analytics</h3>
      
      <Row className="g-4">
        <Col md={6}>
          <Card className="h-100 shadow">
            <Card.Body>
              <Card.Title><FaRegChartBar /> Trends</Card.Title>
              <Line data={chartData} options={{ responsive: true }} />
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="h-100 shadow">
            <Card.Body>
              <Card.Title><FaCalendarAlt /> Latest Activity</Card.Title>
              <div className="list-group">
                {stats.recentActivity?.map(activity => (
                  <div key={activity._id} className="list-group-item">
                    <div className="d-flex justify-content-between">
                      <span>{activity.serviceName}</span>
                      <small>{new Date(activity.date).toLocaleDateString()}</small>
                    </div>
                    <small className="text-muted">{activity.type} - {activity.likes} likes</small>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ServiceAnalytics;