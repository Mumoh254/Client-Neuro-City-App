import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Row, Col, Badge } from 'react-bootstrap';
import { FaClock, FaMapMarkerAlt, FaMoneyBillWave, FaEnvelope } from 'react-icons/fa';
import Swal from 'sweetalert2';
import styled from 'styled-components';

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('all');
  const previousJobCount = useRef(0);

  // Ask for notification permission on load
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(`http://localhost:8000/apiV1/smartcity-ke/jobs${filter !== 'all' ? `?type=${filter}` : ''}`);
        const data = await response.json();

        if (Notification.permission === "granted" && data.length > previousJobCount.current) {
          const newJob = data[0];
          new Notification("🚀 New Job Posted!", {
            body: `${newJob.title} at ${newJob.company}`,
            icon: "/favicon.ico"
          });
        }

        previousJobCount.current = data.length;
        setJobs(data);
      } catch (err) {
        Swal.fire('Error', 'Failed to load jobs', 'error');
      }
    };

    fetchJobs();
  }, [filter]);

  return (
    <JobsContainer className="p-4">
      <h2 className="mb-4 fw-bold text-primary">Career Opportunities in Nairobi</h2>

      {/* Filter Buttons */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {['all', 'full-time', 'part-time', 'contract', 'remote'].map((type) => (
          <FilterButton
            key={type}
            active={filter === type}
            onClick={() => setFilter(type)}
          >
            {type.replace(/-/g, ' ').toUpperCase()}
          </FilterButton>
        ))}
      </div>

      <Row className="g-4">
        {jobs.map(job => (
          <Col key={job._id} md={6} lg={4}>
            <JobCard className="h-100">
              <Card.Body className="d-flex flex-column">
                <div className="d-flex align-items-start mb-3">
                  <div className="flex-grow-1">
                    <Card.Title className="fw-bold fs-5 mb-1">{job.title}</Card.Title>
                    <Card.Subtitle className="text-muted small mb-2">
                      <CompanyBadge>{job.company}</CompanyBadge>
                    </Card.Subtitle>
                  </div>
                  <Badge pill bg="secondary" className="ms-2">
                    {new Date(job.postedDate).toLocaleDateString()}
                  </Badge>
                </div>

                <div className="d-flex flex-wrap gap-2 mb-3">
                  <JobBadge bg={job.type === 'full-time' ? 'primary' : 'secondary'}>
                    {job.type}
                  </JobBadge>
                  <SalaryBadge>
                    <FaMoneyBillWave className="me-1" />
                    KES {job.salary}/month
                  </SalaryBadge>
                </div>

                <JobDetailItem>
                  <FaMapMarkerAlt className="me-2" />
                  {job.location}
                </JobDetailItem>
                <JobDetailItem>
                  <FaClock className="me-2" />
                  Apply by: {new Date(job.deadline).toLocaleDateString()}
                </JobDetailItem>

                <ContactDetail>
                  <FaEnvelope className="me-2" />
                  <a href={`mailto:${job.contactEmail}`}>{job.contactEmail}</a>
                </ContactDetail>

                <Card.Text className="text-muted small mt-2 mb-3 flex-grow-1">
                  {job.description}
                </Card.Text>

                <div className="mb-3">
                  <h6 className="fw-bold text-dark">Requirements:</h6>
                  <RequirementsList>
                    {job.requirements?.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </RequirementsList>
                </div>

                <ApplyButton
                  variant="primary"
                  href={job.applicationLink}
                  target="_blank"
                >
                  Apply Now
                </ApplyButton>
              </Card.Body>
            </JobCard>
          </Col>
        ))}
      </Row>

      {jobs.length === 0 && (
        <div className="text-center py-5">
          <h4 className="text-muted">No current openings matching your criteria</h4>
          <p className="text-muted">Check back later or try different filters</p>
        </div>
      )}
    </JobsContainer>
  );
};

// Styled Components
const JobsContainer = styled.div`
  background: linear-gradient(to bottom right, #f8f9fa, #ffffff);
  min-height: 100vh;
`;

const JobCard = styled(Card)`
  border: none;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-top: 3px solid #6366f1;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  }
`;

const FilterButton = styled.button`
  padding: 8px 20px;
  border-radius: 25px;
  border: 2px solid ${props => props.active ? '#6366f1' : '#dee2e6'};
  background: ${props => props.active ? '#6366f1' : 'transparent'};
  color: ${props => props.active ? 'white' : '#495057'};
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    border-color: #4f46e5;
    background: ${props => !props.active && '#eef2ff'};
  }
`;

const CompanyBadge = styled.span`
  background: #eef2ff;
  color: #4f46e5;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
`;

const JobBadge = styled(Badge)`
  font-size: 0.8rem;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 500;
`;

const SalaryBadge = styled(JobBadge)`
  background: #2d9c6f !important;
  color: white !important;
`;

const JobDetailItem = styled.div`
  display: flex;
  align-items: center;
  color: #4a5568;
  font-size: 0.9rem;
  margin-bottom: 8px;

  svg {
    color: #6366f1;
    min-width: 20px;
  }
`;

const ContactDetail = styled(JobDetailItem)`
  a {
    color: #4f46e5;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const RequirementsList = styled.ul`
  list-style: none;
  padding-left: 0;
  margin-bottom: 0;

  li {
    position: relative;
    padding-left: 1.5rem;
    margin-bottom: 4px;
    font-size: 0.9rem;

    &::before {
      content: '•';
      color: #6366f1;
      position: absolute;
      left: 0;
      font-weight: bold;
    }
  }
`;

const ApplyButton = styled(Button)`
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
  }
`;

export default JobsList;
