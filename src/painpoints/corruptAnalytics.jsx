import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table } from 'react-bootstrap';
import axios from 'axios';
import { FiActivity, FiMapPin, FiAlertCircle } from 'react-icons/fi';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState({ 
    totalReports: 0,
    facilities: [],
    locations: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/reports/analytics');
        setAnalytics(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  return (
    <Container className="py-5">
      <h2 className="mb-5 display-5 fw-bold">
        <FiActivity className="me-3" /> Corruption Analytics
      </h2>

      <Row className="g-4 mb-5">
        <Col md={4}>
          <Card className="h-100 p-3">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FiAlertCircle size={40} className="text-primary me-3" />
                <div>
                  <h3 className="mb-0">{analytics.totalReports}</h3>
                  <small className="text-muted">Total Reports</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={8}>
          <Card className="h-100 p-3">
            <Card.Body>
              <h5 className="mb-4">
                <FiMapPin className="me-2" /> Most Reported Locations
              </h5>
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Reports</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.locations.map((location, index) => (
                    <tr key={index}>
                      <td>{location.location}</td>
                      <td>{location._count.location}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="p-3">
        <Card.Body>
          <h5 className="mb-4">Most Corrupt Facilities</h5>
          <Table striped hover>
            <thead>
              <tr>
                <th>Facility</th>
                <th>Type</th>
                <th>Reports</th>
              </tr>
            </thead>
            <tbody>
              {analytics.facilities.map((facility, index) => (
                <tr key={index}>
                  <td>{facility.facilityName}</td>
                  <td>{facility.facilityType}</td>
                  <td>{facility._count.facilityName}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AnalyticsDashboard;