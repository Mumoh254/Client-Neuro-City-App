import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, ListGroup, Form, Button } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';
import { FiActivity, FiMessageSquare, FiThumbsUp, FiClock, FiTrendingUp } from 'react-icons/fi';
import styled from 'styled-components';
import Swal from 'sweetalert2';

const API_BASE = 'http://localhost:8000/apiV1/smartcity-ke';

const DashboardContainer = styled(Container)`
  background: #f8fafc;
  min-height: 100vh;
  padding: 2rem;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid #e2e8f0;
`;

const MetricCard = styled(Card)`
  border: none;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  background: linear-gradient(145deg, #ffffff, #f8fafc);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 15px rgba(0,0,0,0.05);
  }
`;

const ChartCard = styled(Card)`
  border: none;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  background: linear-gradient(145deg, #ffffff, #f8fafc);
`;



const StyledSelect = styled(Form.Select)`
  width: 450px;     /* Set a fixed width or max-width, e.g., 150px */
  padding: 0.8rem 0.5rem; /* Adjust padding to reduce height */
  font-size: 0.9rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  &:focus {
    box-shadow: none;
    border-color: #6366f1;
  }
`;


// For top community concerns, use the updated color scheme:
const TOP_CONCERNS_COLORS = ['#0000FF', '#008000', '#00FFFF', '#800080', '#FFD700', '#FFA500', '#FF0000', '#808080'];
// Keep existing sentiment colors for the sentiment chart:
const SENTIMENT_COLORS = ['#0000FF', '#008000', '#00FFFF', '#800080', '#FFD700', '#FFA500', '#FF0000', '#808080'];

const AnalyticsDashboard = () => {
  const [data, setData] = useState({ 
    painPoints: {}, 
    topPosts: [], 
    engagement: [], 
    sentiment: [] 
  });
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('7d');
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`${API_BASE}/analytics?range=${timeFilter}`);
        setData(res.data);
        console.log(res.data);
        setLoading(false);
      } catch (err) {
        Swal.fire('Error', 'Failed to load analytics data', 'error');
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [timeFilter]);

  // Process pain points for top community concerns (sorted in descending order)
  const processPainPoints = () => {
    return Object.entries(data.painPoints)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  };

  // Filter high engagement conversations based on category. In this example, if "Healthcare" is selected,
  // we only show posts whose content includes 'health' (case-insensitive).
  const getFilteredHighEngagementPosts = () => {
    if (filterCategory === 'All') {
      return data.topPosts;
    } else if (filterCategory === 'Healthcare') {
      return data.topPosts.filter(post => /health/i.test(post.content));
    }
    return data.topPosts;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
      </div>
    );
  }

  return (
    <DashboardContainer fluid>
    <DashboardHeader>
  <div>
    <h2 className="mb-0 text-slate-800  w-75 px-5 d-flex align-items-center">
      <FiActivity className="me-2" style={{ color: '#6366f1' }} />
      City Insights Dashboard
    </h2>
    <p className="text-muted mb-0">Citizen engagement analytics and trends</p>
  </div>
  <StyledSelect 
    value={timeFilter}
    onChange={(e) => setTimeFilter(e.target.value)}
    style={{ marginLeft: 'auto' }}
  >
    <option value="24h">Last 24 Hours</option>
    <option value="7d">Last 7 Days</option>
    <option value="30d">Last 30 Days</option>
  </StyledSelect>
</DashboardHeader>

      <Row className="g-4 mb-4">
        <Col xl={3} lg={6}>
          <MetricCard className="h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-indigo-50 p-3 rounded-circle me-3">
                <FiMessageSquare size={24} className="text-indigo-600" />
              </div>
              <div>
                <h5 className="text-muted mb-1">Total Posts</h5>
                <h2 className="mb-0 text-indigo-600">{data.totalPosts}</h2>
              </div>
            </Card.Body>
          </MetricCard>
        </Col>
        <Col xl={3} lg={6}>
          <MetricCard className="h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-emerald-50 p-3 rounded-circle me-3">
                <FiThumbsUp size={24} className="text-emerald-600" />
              </div>
              <div>
                <h5 className="text-muted mb-1">Total Likes</h5>
                <h2 className="mb-0 text-emerald-600">{data.totalLikes}</h2>
              </div>
            </Card.Body>
          </MetricCard>
        </Col>
        <Col xl={3} lg={6}>
          <MetricCard className="h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-amber-50 p-3 rounded-circle me-3">
                <FiClock size={24} className="text-amber-600" />
              </div>
              <div>
                <h5 className="text-muted mb-1">Avg. Response</h5>
                <h2 className="mb-0 text-amber-600">{data.avgResponseTime}h</h2>
              </div>
            </Card.Body>
          </MetricCard>
        </Col>
        <Col xl={3} lg={6}>
          <MetricCard className="h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-blue-50 p-3 rounded-circle me-3">
                <FiTrendingUp size={24} className="text-blue-600" />
              </div>
              <div>
                <h5 className="text-muted mb-1">Engagement Rate</h5>
                <h2 className="mb-0 text-blue-600">{data.engagementRate}%</h2>
              </div>
            </Card.Body>
          </MetricCard>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Top Community Concerns (BarChart with updated color palette) */}
        <Col xl={8} lg={12}>
          <ChartCard>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0">Top Community Concerns</h5>
                <span className="text-muted">Frequency Analysis</span>
              </div>
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={processPainPoints()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#64748b' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <Tooltip contentStyle={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {processPainPoints().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={TOP_CONCERNS_COLORS[index % TOP_CONCERNS_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </ChartCard>
        </Col>

        {/* Sentiment Distribution (BarChart using SENTIMENT_COLORS) */}
        <Col xl={4} lg={12}>
          <ChartCard className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0">Sentiment Distribution</h5>
                <span className="text-muted">Public Perception</span>
              </div>
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.sentiment} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                    <YAxis tick={{ fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                    <Tooltip contentStyle={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '1rem' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {data.sentiment.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[index % SENTIMENT_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </ChartCard>
        </Col>

        {/* High Engagement Conversations with Category Filter and alternating backgrounds */}
        <Col xs={12}>
          <ChartCard>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="mb-0">High Engagement Conversations</h5>
                  <small className="text-muted">Sorted by Interaction Score</small>
                </div>
                {/* Filter buttons for category */}
                <div>
                  <Button 
                    variant={filterCategory === 'All' ? 'primary' : 'outline-primary'} 
                    size="sm" 
                    className="me-2"
                    onClick={() => setFilterCategory('All')}
                  >
                    All
                  </Button>
                  <Button 
                    variant={filterCategory === 'Healthcare' ? 'primary' : 'outline-primary'} 
                    size="sm"
                    onClick={() => setFilterCategory('Healthcare')}
                  >
                    Healthcare
                  </Button>
                </div>
              </div>
              <ListGroup variant="flush">
                {getFilteredHighEngagementPosts().map((post, index) => (
                  <ListGroup.Item 
                    key={post.id} 
                    className="py-3" 
                    style={{ background: index % 2 === 1 ? '#f4f7fa' : 'transparent' }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <div className="bg-indigo-50 p-2 rounded-circle me-3">
                          <FiMessageSquare size={20} className="text-indigo-600" />
                        </div>
                        <div>
                          <h6 className="mb-1">{post.author?.name || 'Anonymous Citizen'}</h6>
                          <p className="text-muted mb-1">{post.content}</p>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-indigo-100 text-indigo-600">
                              <FiThumbsUp className="me-1" />{post.likes}
                            </span>
                            <span className="badge bg-emerald-100 text-emerald-600">
                              <FiMessageSquare className="me-1" />{post.comments}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-end">
                        <small className="text-muted d-block">
                          {new Date(post.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </small>
                        <span className="badge bg-purple-100 bg-warning p-4 text-purple-600">
                          Engagement: {post.engagementScore}
                        </span>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </ChartCard>
        </Col>
      </Row>
    </DashboardContainer>
  );
};

export default AnalyticsDashboard;
