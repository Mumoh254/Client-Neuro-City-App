import React, { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import { FiAlertTriangle, FiEye, FiUpload, FiMessageSquare, FiMapPin, FiUser, FiType } from 'react-icons/fi';
import styled from 'styled-components';

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

const ActionCard = styled(Card)`
  border: none;
  border-radius: 15px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  }
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

const GradientButton = styled(Button)`
  background: linear-gradient(135deg, #19376d 0%, #2457a6 100%);
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(25, 55, 109, 0.3);
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

  // Hero content component
  const HeroContent = () => (
    <HeroSection>
      <div className="hero-content">
        <h1 className="display-4 mb-4 fw-bold">
          <FiAlertTriangle className="me-3" /> 
          Not On My Watch
        </h1>
        <p className="lead fs-3 mb-4">
          Join the Fight Against Corruption in Nairobi City the  Breathing Heart of  Kenya
         
        </p>
        <div className="d-flex gap-3 justify-content-center">
          <GradientButton size="lg">
            <FiUpload className="me-2" /> Report Now
          </GradientButton>
          <Button variant="outline-light" size="lg">
            <FiEye className="me-2" /> View Cases
          </Button>
        </div>
      </div>
    </HeroSection>
  );

  // Action Cards component
  const ActionCards = () => (
    <Row className="my-5 g-4">
      <Col md={4}>
        <ActionCard className="h-100 text-center p-4" style={{background: "#2563eb"}}>
          <Card.Body>
            <div className="icon-wrapper bg-primary-gradient mb-4">
              <FiUpload size={40} className="text-white" />
            </div>
            <h3 className="mb-3 text-white">Safe Reporting</h3>
            <p className="text-white">Your identity remains completely protected</p>
          </Card.Body>
        </ActionCard>
      </Col>
      <Col md={4}>
        <ActionCard className="h-100 text-center p-4"  style={{background: "#d97706"}}>
          <Card.Body>
            <div className="icon-wrapper bg-success-gradient mb-4"  >
              <FiEye size={40} className="text-white" />
            </div>
            <h3 className="mb-3 text-white" >Live Tracking</h3>
            <p className="  text-white">Monitor reported cases in real-time</p>
          </Card.Body>
        </ActionCard>
      </Col>
      <Col md={4}>
        <ActionCard className="h-100 text-center p-4" style={{background: "#2563eb"}}>
          <Card.Body>
            <div className="icon-wrapper bg-warning-gradient mb-4">
              <FiMessageSquare size={40} className="text-white" />
            </div>
            <h3 className="mb-3  text-white">Community Voice</h3>
            <p className=" text-white">Engage with ongoing investigations</p>
          </Card.Body>
        </ActionCard>
      </Col>
    </Row>
  );

  // Handle image upload
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

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const reportData = {
        facility: {
          name: formData.facilityName,
          type: formData.facilityType,
          location: formData.location
        },
        description: formData.description,
        isAnonymous: formData.isAnonymous,
        reporter: formData.isAnonymous ? null : formData.reporter,
        image: formData.image ? await toBase64(formData.image) : null
      };

      await axios.post('http://localhost:8000/apiV1/smartcity-ke/create-report', reportData);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
      setFormData({...formData, facilityName: '', location: '', description: '', image: null, preview: null});
    } catch (error) {
      console.error(error);
    }
  };

  // Base64 converter
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  return (
    <>
      <HeroContent />
      <Container className="py-5">
        <ActionCards />

        <ReportCard className="my-5 p-4">
          <Card.Body>
            <h2 className="text-start mb-5 display-5 fw-bold text-primary">
              <FiAlertTriangle className="me-3" /> 
              File Corruption Report
            </h2>
            
            <Form onSubmit={handleSubmit}>
              <Row className="g-4">
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold mb-3">
                      <FiType className="me-2" /> Facility Name
                    </Form.Label>
                    <StyledFormControl 
                      required
                      value={formData.facilityName}
                      onChange={(e) => setFormData({...formData, facilityName: e.target.value})}
                      placeholder="Enter facility name"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold mb-3">
                      <FiUser className="me-2" /> Facility Type
                    </Form.Label>
                    <StyledFormControl
                      as="select"
                      value={formData.facilityType}
                      onChange={(e) => setFormData({...formData, facilityType: e.target.value})}
                    >
                      <option>Government Office</option>
                      <option>Hospital</option>
                      <option>Police Station</option>
                      <option>School/University</option>
                      <option>Service Center</option>
                    </StyledFormControl>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold mb-3">
                      <FiMapPin className="me-2" /> Location
                    </Form.Label>
                    <StyledFormControl 
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Enter facility location"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold mb-3">
                      Incident Details
                    </Form.Label>
                    <StyledFormControl 
                      as="textarea"
                      rows={8}
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe the corruption incident in detail..."
                      style={{ height: '100%' }}
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold mb-3">
                      <FiUpload className="me-2" /> Upload Evidence
                    </Form.Label>
                    <div className="file-upload-wrapper">
                      <StyledFormControl 
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="form-control-lg"
                      />
                      {formData.preview && (
                        <div className="mt-3">
                          <img 
                            src={formData.preview} 
                            alt="Preview" 
                            className="img-thumbnail rounded-3"
                            style={{ maxWidth: '300px' }}
                          />
                        </div>
                      )}
                    </div>
                  </Form.Group>
                </Col>

                <Col className="text-start">
                  <GradientButton type="submit" size="lg">
                    <FiUpload className="me-2" /> Submit Report
                  </GradientButton>

                  <col />
                  <p>
                  <br />Every day  is  a  coruption Fight day  by Peter  Mumo CEO  Welt  Tallis Cooperation !!
                  </p>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </ReportCard>

        {submitted && (
          <Alert variant="success" className="mt-4 text-center fs-5">
            🚨 Report submitted successfully! Thank you for your courage.
          </Alert>
        )}

        {/* Recent Cases Section */}
        <h2 className="my-5 pt-5 text-start display-5 fw-bold text-primary">
          <FiEye className="me-3" /> 
          Recent Reports
        </h2>
        <Row className="g-4">
          {cases.map((report) => (
            <Col md={4} key={report.id}>
              <ActionCard className="h-100">
                {report.image && (
                  <Card.Img 
                    variant="top" 
                    src={report.image} 
                    className="card-img-top"
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <Card.Body className="p-4">
                  <Card.Title className="fw-bold mb-3">{report.facility.name}</Card.Title>
                  <Card.Subtitle className="mb-3 text-muted">
                    {report.facility.type} • {report.facility.location}
                  </Card.Subtitle>
                  <Card.Text className="text-secondary">
                    {report.description}
                  </Card.Text>
                  <Button variant="outline-primary" className="w-100">
                    <FiMessageSquare className="me-2" /> 
                    View Details
                  </Button>
                </Card.Body>
              </ActionCard>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default ReportCorruption;