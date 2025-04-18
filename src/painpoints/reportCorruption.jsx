import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Container, Row, Col, Card, Spinner, Pagination } from 'react-bootstrap';
import axios from 'axios';
import { FiAlertTriangle, FiEye, FiUpload, FiMapPin, FiUser, FiType, FiBarChart2, FiTrendingUp } from 'react-icons/fi';
import styled from 'styled-components';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';

ChartJS.register(...registerables);

// Styled Components
const HeroSection = styled.div`
  height: 70vh;
  background: linear-gradient(135deg, rgba(25, 54, 109, 0.22) 0%, rgba(11, 32, 63, 0.25) 100%),
              url('/images/corrupt.png');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  padding: 0rem;
`;

const ReportCard = styled(Card)`
  border: none;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const StyledFormControl = styled(Form.Control)`
  border-radius: 10px;
  border: 2px solid #e9ecef;
  padding: 1rem;
  transition: all 0.3s ease;

  &:focus {
    border-color: #19376d;
    box-shadow: 0 0 0 3px rgba(25, 55, 109, 0.25);
  }
`;

const ReportCorruption = () => {
  const [formData, setFormData] = useState({
    facilityName: '',
    facilityType: 'Government Office',
    location: '',
    description: '',
    isAnonymous: true,
    reporter: '',
    image: null,
    preview: null
  });

  const [submitted, setSubmitted] = useState(false);
  const [cases, setCases] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const itemsPerPage = 6;

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, casesRes] = await Promise.all([
          axios.get('http://localhost:8000/apiV1/smartcity-ke/corrupt-analyse'),
          axios.get(`http://localhost:8000/apiV1/smartcity-ke/reports?page=${currentPage}&limit=${itemsPerPage}`)
        ]);

        setAnalytics(analyticsRes.data);
        setCases(casesRes.data.reports);
        setTotalPages(casesRes.data.totalPages);
      } catch (err) {
        setError('Failed to load data');
      }
    };

    fetchData();
  }, [currentPage]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({...formData, image: file, preview: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formPayload = new FormData();
      formPayload.append('facilityName', formData.facilityName);
      formPayload.append('facilityType', formData.facilityType);
      formPayload.append('location', formData.location);
      formPayload.append('description', formData.description);
      formPayload.append('isAnonymous', formData.isAnonymous);
      formPayload.append('image', formData.image);

      await axios.post('/api/smartcity-ke/reports', formPayload, {
        headers: {'Content-Type': 'multipart/form-data'}
      });

      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
      setFormData({
        facilityName: '',
        facilityType: 'Government Office',
        location: '',
        description: '',
        image: null,
        preview: null
      });
      setCurrentPage(1); // Refresh to first page
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  // Generate random colors for charts
  const getRandomColors = (num) => {
    const colors = [];
    for (let i = 0; i < num; i++) {
      colors.push(`hsl(${Math.random() * 360}, 100%, 50%)`);
    }
    return colors;
  };

  return (
    <div className="corruption-reporting-system">
      <HeroSection>
        <div className="hero-content">
          <h1 className="display-4 mb-4 fw-bold">
            <FiAlertTriangle className="me-2" /> 
            Report Corruption
          </h1>
          <p className="lead fs-6 mb-2">
            Help us build a transparent Nairobi City
          </p>
        </div>
      </HeroSection>

      <Container className="py-5">
        {/* Analytics Section */}
        <div className="analytics-dashboard mb-5">
          <h2 className="mb-4 display-5 fw-bold text-primary">
            <FiBarChart2 className="me-3" />
            Corruption Insights
          </h2>

          <Row className="g-4">
            <Col md={6}>
              <ReportCard className="p-3">
                <h5 className="mb-3 fw-bold">
                  <FiAlertTriangle className="me-2" />
                  Top Reported Facilities
                </h5>
                {analytics ? (
                  <Bar 
                    data={{
                      labels: analytics.topFacilities.map(f => f.name),
                      datasets: [{
                        label: 'Reports Count',
                        data: analytics.topFacilities.map(f => f.count),
                        backgroundColor: getRandomColors(analytics.topFacilities.length) // Using different colors
                      }]
                    }}
                  />
                ) : <Spinner animation="border" />}
              </ReportCard>
            </Col>

            <Col md={6}>
              <ReportCard className="p-3">
                <h5 className="mb-3 fw-bold">
                  <FiTrendingUp className="me-2" />
                  Reporting Trends
                </h5>
                {analytics ? (
                  <Bar 
                    data={{
                      labels: analytics.monthlyTrends.map(m => m.month),
                      datasets: [{
                        label: 'Monthly Reports',
                        data: analytics.monthlyTrends.map(m => m.count),
                        backgroundColor: getRandomColors(analytics.monthlyTrends.length) // Using different colors
                      }]
                    }}
                  />
                ) : <Spinner animation="border" />}
              </ReportCard>
            </Col>
          </Row>
        </div>

        {/* Reporting Form */}
        <ReportCard className="my-5 p-4">
          <h2 className="mb-4 display-5 fw-bold text-primary">
            <FiUpload className="me-3" />
            File New Report
          </h2>
          
          <Form onSubmit={handleSubmit}>
            <Row className="g-4">
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Facility Name</Form.Label>
                  <StyledFormControl
                    required
                    value={formData.facilityName}
                    onChange={(e) => setFormData({...formData, facilityName: e.target.value})}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Facility Type</Form.Label>
                  <StyledFormControl
                    as="select"
                    value={formData.facilityType}
                    onChange={(e) => setFormData({...formData, facilityType: e.target.value})}
                  >
                    {['Government Office', 'Hospital', 'Police Station', 'School'].map(opt => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </StyledFormControl>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Incident Details</Form.Label>
                  <StyledFormControl
                    as="textarea"
                    rows={5}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group className="mb-4">
                  <Form.Label>Upload Evidence</Form.Label>
                  <StyledFormControl
                    type="file"
                    onChange={handleImageUpload}
                    accept="image/*"
                  />
                  {formData.preview && (
                    <img 
                      src={formData.preview} 
                      alt="Preview" 
                      className="mt-3 img-thumbnail"
                      style={{ maxWidth: '300px' }}
                    />
                  )}
                </Form.Group>
              </Col>

              <Col className="text-center">
                <Button variant="primary" type="submit" size="lg">
                  Submit Report
                </Button>
              </Col>
            </Row>
          </Form>
        </ReportCard>

        {/* Cases List */}
        <div className="reported-cases">
          <h2 className="mb-4 display-5 fw-bold text-primary">
            <FiEye className="me-3" />
            Recent Reports
          </h2>

          {error && <Alert variant="danger">{error}</Alert>}

          <Row className="g-4">
            {cases.map(report => (
              <Col md={4} key={report._id}>
                <ReportCard>
                  {report.image && (
                    <Card.Img 
                      variant="top" 
                      src={`data:image/jpeg;base64,${report.image}`} 
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  )}
                  <Card.Body>
                    <Card.Title>{report.facilityName}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      {report.facilityType} • {report.location}
                    </Card.Subtitle>
                    <Card.Text>{report.description.slice(0, 100)}...</Card.Text>
                    <Button variant="outline-primary">
                      View Details
                    </Button>
                  </Card.Body>
                </ReportCard>
              </Col>
            ))}
          </Row>

          <div className="d-flex justify-content-center">
            <Pagination>
              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item
                  key={index}
                  active={index + 1 === currentPage}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ReportCorruption;
