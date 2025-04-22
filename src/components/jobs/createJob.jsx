// components/CreateJob.js
import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Badge } from 'react-bootstrap';
import { FaClock, FaMapMarkerAlt, FaMoneyBillWave, FaEnvelope, FaLink } from 'react-icons/fa';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import  {getUserIdFromToken } from '../handler/tokenDecoder';

const jobSchema = Yup.object().shape({
  title: Yup.string().required('Required'),
  company: Yup.string().required('Required'),
  description: Yup.string().required('Required').min(30, 'Minimum 30 characters'),
  location: Yup.string().required('Required'),
  salary: Yup.number().required('Required').min(0),
  type: Yup.string().required('Required'),
  deadline: Yup.date().required('Required').min(new Date(), 'Deadline must be in future'),
  contactEmail: Yup.string().email('Invalid email').required('Required'),
  applicationLink: Yup.string().url('Invalid URL').required('Required'),
  requirements: Yup.array()
});

const CreateJob = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [newRequirement, setNewRequirement] = useState('');

  const  BASE_URl = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";
 
  useEffect(() => {
    const userId = getUserIdFromToken();
    setUserId(userId);
  }, []);

  const formik = useFormik({
    initialValues: {
      title: '',
      company: '',
      description: '',
      location: '',
      salary: '',
      type: '',
      deadline: '',
      contactEmail: '',
      applicationLink: '',
      requirements: []
    },
    validationSchema: jobSchema,
    onSubmit: async values => {
      try {
        const response = await fetch(`${BASE_URl}/jobs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            ...values,
            requirements,
            postedBy: userId
          })
        });

        if (response.ok) {
          Swal.fire('Success!', 'Job posted successfully!', 'success');
          navigate('/jobs');
        } else {
          Swal.fire('Error!', 'Failed to post job', 'error');
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Error!', 'Server error', 'error');
      }
    }
  });

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  return (
    <div className="p-4 bg-light rounded-3 shadow">
      <h2 className="mb-4">Post New Job</h2>
      <Form onSubmit={formik.handleSubmit}>
        <Row className="g-3">
          {/* Title */}
          <Col md={6}>
            <Form.Group>
              <Form.Label>Job Title</Form.Label>
              <Form.Control
                name="title"
                placeholder="Senior Software Engineer"
                {...formik.getFieldProps('title')}
              />
              {formik.touched.title && formik.errors.title && (
                <div className="text-danger">{formik.errors.title}</div>
              )}
            </Form.Group>
          </Col>

          {/* Company */}
          <Col md={6}>
            <Form.Group>
              <Form.Label>Company</Form.Label>
              <Form.Control
                name="company"
                {...formik.getFieldProps('company')}
              />
              {formik.touched.company && formik.errors.company && (
                <div className="text-danger">{formik.errors.company}</div>
              )}
            </Form.Group>
          </Col>

          {/* Description */}
          <Col md={12}>
            <Form.Group>
              <Form.Label>Job Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                {...formik.getFieldProps('description')}
              />
              {formik.touched.description && formik.errors.description && (
                <div className="text-danger">{formik.errors.description}</div>
              )}
            </Form.Group>
          </Col>

          {/* Requirements */}
          <Col md={12}>
            <Form.Group>
              <Form.Label>Requirements</Form.Label>
              <div className="d-flex gap-2 mb-2">
                <Form.Control
                  type="text"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  placeholder="Add requirement"
                />
                <Button variant="outline-primary" onClick={addRequirement}>
                  Add
                </Button>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {requirements.map((req, index) => (
                  <Badge key={index} bg="primary" pill>
                    {req}
                  </Badge>
                ))}
              </div>
              {formik.touched.requirements && formik.errors.requirements && (
                <div className="text-danger">{formik.errors.requirements}</div>
              )}
            </Form.Group>
          </Col>

          {/* Location */}
          <Col md={4}>
            <Form.Group>
              <Form.Label><FaMapMarkerAlt /> Location</Form.Label>
              <Form.Control
                name="location"
                {...formik.getFieldProps('location')}
              />
              {formik.touched.location && formik.errors.location && (
                <div className="text-danger">{formik.errors.location}</div>
              )}
            </Form.Group>
          </Col>

          {/* Salary */}
          <Col md={4}>
            <Form.Group>
              <Form.Label><FaMoneyBillWave /> Salary ($)</Form.Label>
              <Form.Control
                type="number"
                name="salary"
                {...formik.getFieldProps('salary')}
              />
              {formik.touched.salary && formik.errors.salary && (
                <div className="text-danger">{formik.errors.salary}</div>
              )}
            </Form.Group>
          </Col>

          {/* Type */}
          <Col md={4}>
            <Form.Group>
              <Form.Label><FaClock /> Job Type</Form.Label>
              <Form.Select
                name="type"
                {...formik.getFieldProps('type')}
              >
                <option value="">Select Type</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </Form.Select>
              {formik.touched.type && formik.errors.type && (
                <div className="text-danger">{formik.errors.type}</div>
              )}
            </Form.Group>
          </Col>

          {/* Deadline */}
          <Col md={6}>
            <Form.Group>
              <Form.Label>Application Deadline</Form.Label>
              <Form.Control
                type="datetime-local"
                name="deadline"
                {...formik.getFieldProps('deadline')}
              />
              {formik.touched.deadline && formik.errors.deadline && (
                <div className="text-danger">{formik.errors.deadline}</div>
              )}
            </Form.Group>
          </Col>

          {/* Contact */}
          <Col md={6}>
            <Form.Group>
              <Form.Label><FaEnvelope /> Contact Email</Form.Label>
              <Form.Control
                type="email"
                name="contactEmail"
                {...formik.getFieldProps('contactEmail')}
              />
              {formik.touched.contactEmail && formik.errors.contactEmail && (
                <div className="text-danger">{formik.errors.contactEmail}</div>
              )}
            </Form.Group>
          </Col>

          {/* Application Link */}
          <Col md={12}>
            <Form.Group>
              <Form.Label><FaLink /> Application Link</Form.Label>
              <Form.Control
                type="url"
                name="applicationLink"
                {...formik.getFieldProps('applicationLink')}
              />
              {formik.touched.applicationLink && formik.errors.applicationLink && (
                <div className="text-danger">{formik.errors.applicationLink}</div>
              )}
            </Form.Group>
          </Col>

          <Col md={12}>
            <Button variant="primary" type="submit" className="w-100 py-3">
              Post Job
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default CreateJob;