import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Button, 
  Dropdown, Spinner, Alert 
} from 'react-bootstrap';
import { 
  FiActivity, FiMapPin, FiAlertCircle, FiDownload, FiBarChart2 
} from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import * as XLSX from 'xlsx';
import axios from 'axios';
import styled from 'styled-components';
import { saveAs } from 'file-saver';

// Styled components
const ChartCard = styled(Card)`
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border-radius: 15px;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
  }
`;

const StyledTable = styled(Table)`
  thead {
    background: #2c3e50;
    color: white;
  }
  th {
    border: none !important;
  }
  td {
    vertical-align: middle;
  }
`;

const CorruptionDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChart, setSelectedChart] = useState('daily');

  const colors = ['#3498db', '#2ecc71', '#9b59b6', '#e74c3c', '#f1c40f'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('http://localhost:8000/apiV1/smartcity-ke/corruption-analytics');
        setAnalytics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const exportToExcel = () => {
    if (!analytics) return;

    const wsData = [
      ["Corruption Analytics Report"],
      [],
      ["Total Reports", analytics.totalReports],
      [],
      ["Top Locations", "Reports"],
      ...(analytics.hotspots || []).map(loc => [loc.location, loc.count]),
      [],
      ["Facility Types", "Reports"],
      ...(analytics.topFacilityTypes || []).map(f => [f._id, f.count]),
      [],
      ["Daily Trends", "Reports"],
      ...Object.entries(analytics.reportTrends || {})
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Analytics");
    XLSX.writeFile(wb, "corruption-analytics.xlsx");
  };

  const processChartData = () => {
    if (!analytics || !analytics.reportTrends) return [];
    return Object.entries(analytics.reportTrends).map(([date, count]) => ({
      date,
      reports: count
    }));
  };

  const processFacilityData = () => {
    if (!analytics || !analytics.topFacilityTypes) return [];
    return analytics.topFacilityTypes.map((facility, index) => ({
      name: facility._id,
      reports: facility.count,
      fill: colors[index % colors.length]
    }));
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-5">
        Error loading data: {error}
      </Alert>
    );
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h2 className="display-5 fw-bold">
          <FiActivity className="me-3" /> Corruption Analytics
        </h2>
        <Dropdown>
          <Dropdown.Toggle variant="primary">
            <FiDownload className="me-2" /> Export
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={exportToExcel}>Excel</Dropdown.Item>
            <Dropdown.Item onClick={() => saveAs(new Blob([JSON.stringify(analytics)], { type: "application/json" }), 'analytics.json')}>
              JSON
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <Row className="g-4 mb-5">
        <Col md={3}>
          <ChartCard className="h-100 text-center py-3 bg-primary text-white">
            <Card.Body>
              <FiAlertCircle size={40} className="mb-3" />
              <h3>{analytics.totalReports}</h3>
              <small>Total Reports</small>
            </Card.Body>
          </ChartCard>
        </Col>

        <Col md={9}>
          <ChartCard className="h-100 p-3">
            <Card.Body>
              <div className="d-flex justify-content-between mb-4">
                <h5><FiBarChart2 className="me-2" /> Reports Trend</h5>
                <Dropdown>
                  <Dropdown.Toggle variant="light">
                    {selectedChart === 'daily' ? 'Daily' : 'Monthly'}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setSelectedChart('daily')}>Daily</Dropdown.Item>
                    <Dropdown.Item onClick={() => setSelectedChart('monthly')}>Monthly</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              <div style={{ height: 300 }}>
                {selectedChart === 'daily' ? (
                  <LineChart width={800} height={300} data={processChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="reports" 
                      stroke="#3498db" 
                      strokeWidth={2}
                    />
                  </LineChart>
                ) : (
                  <BarChart width={800} height={300} data={processFacilityData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="reports" />
                  </BarChart>
                )}
              </div>
            </Card.Body>
          </ChartCard>
        </Col>
      </Row>

      <Row className="g-4 mb-5">
        <Col md={6}>
          <ChartCard className="h-100 p-3">
            <Card.Body>
              <h5 className="mb-4"><FiMapPin className="me-2" /> Hotspots</h5>
              <StyledTable hover>
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Reports</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {(analytics.hotspots || []).map((loc, index) => (
                    <tr key={index}>
                      <td>{loc.location}</td>
                      <td>{loc.count}</td>
                      <td>
                        {((loc.count / analytics.totalReports) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </StyledTable>
            </Card.Body>
          </ChartCard>
        </Col>

        <Col md={6}>
          <ChartCard className="h-100 p-3">
            <Card.Body>
              <h5 className="mb-4">Top Corrupt Facilities</h5>
              <StyledTable hover>
                <thead>
                  <tr>
                    <th>Facility</th>
                    <th>Type</th>
                    <th>Reports</th>
                  </tr>
                </thead>
                <tbody>
                  {(analytics.facilityReports || []).map((fac, index) => (
                    <tr key={index}>
                      <td>{fac._id.name}</td>
                      <td>{fac._id.type}</td>
                      <td>{fac.count}</td>
                    </tr>
                  ))}
                </tbody>
              </StyledTable>
            </Card.Body>
          </ChartCard>
        </Col>
      </Row>
    </Container>
  );
};

export default CorruptionDashboard;
