// components/AnalyticsDashboard.js
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/analytics?range=${timeRange}`);
        const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchData();
  }, [timeRange]);

  return (
    <div className="analytics-container">
      <div className="header">
        <h2>Website Analytics</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="time-selector"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      <div className="chart-container">
        <h3>Most Visited Pages</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={analyticsData.topPages}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="path" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <h4>Total Visits</h4>
          <p>{analyticsData.totalVisits}</p>
        </div>
        <div className="metric-card">
          <h4>Unique Visitors</h4>
          <p>{analyticsData.uniqueVisitors}</p>
        </div>
        <div className="metric-card">
          <h4>Avg. Time</h4>
          <p>{analyticsData.avgTime}min</p>
        </div>
        <div className="metric-card">
          <h4>Bounce Rate</h4>
          <p>{analyticsData.bounceRate}%</p>
        </div>
      </div>

      <style jsx>{`
        .analytics-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .time-selector {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .chart-container {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        .metric-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .metric-card h4 {
          color: #6b7280;
          margin-bottom: 0.5rem;
        }
        .metric-card p {
          font-size: 1.5rem;
          font-weight: bold;
          color: #1f2937;
        }
      `}</style>
    </div>
  );
};

export default AnalyticsDashboard;