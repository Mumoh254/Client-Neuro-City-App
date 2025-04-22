import React, { useState  , useEffect} from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { FaClock, FaMapMarkerAlt, FaImages, FaPhone, FaGlobe, FaLink, FaEnvelope } from 'react-icons/fa';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';

import  {getUserIdFromToken  } from "../handler/tokenDecoder"


const serviceSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  category: Yup.string().required('Required'),
  description: Yup.string().required('Required'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^(\+?254|0)[17]\d{8}$/, 'Valid Kenyan number required'),
  email: Yup.string().email('Invalid email').required('Required'),
  website: Yup.string().url('Invalid URL'),
  socialLink: Yup.string().url('Invalid URL'),
  locationUrl: Yup.string().url('Invalid Google Maps URL'),
  serviceType: Yup.string().required('Select service type'),
  opening: Yup.string().when('is24hr', {
    is: false,
    then: Yup.string().required('Opening time is required'),
  }),
  closing: Yup.string().when('is24hr', {
    is: false,
    then: Yup.string().required('Closing time is required'),
  }),
});

const CreateService = () => {
  const  BASE_URl = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";


  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const userId = getUserIdFromToken();
    console.log('User ID:', userId);
    setUserId(userId); 
  }, []);

  const [images, setImages] = useState([]);
  const [is24hr, setIs24hr] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      category: '',
      description: '',
      phone: '',
      email: '',
      website: '',
      socialLink: '',
      serviceType: '',
      opening: '',
      closing: '',
      locationUrl: '',
      is24hr: false,
      userId: userId
    },
    validationSchema: serviceSchema,
    onSubmit: async values => {
      try {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (key !== 'opening' && key !== 'closing') {
            formData.append(key, value);
          }
        });

        if (!is24hr) {
          formData.append('openingHours[opening]', values.opening);
          formData.append('openingHours[closing]', values.closing);
        }

        images.forEach(img => formData.append('images', img));

        const response = await fetch(`${BASE_URl}/create/service`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          Swal.fire('Success!', 'Service created successfully!', 'success');
          formik.resetForm();
          setImages([]);
          setIs24hr(false);
        } else {
          Swal.fire('Error!', 'Failed to create service', 'error');
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Error!', 'Server error', 'error');
      }
    },
  });

  const handleImageUpload = e => {
    const files = Array.from(e.target.files);
    setImages([...images, ...files]);
  };

  const handle24hrChange = e => {
    const checked = e.target.checked;
    setIs24hr(checked);
    formik.setFieldValue('is24hr', checked);
    if (checked) {
      formik.setFieldValue('opening', '');
      formik.setFieldValue('closing', '');
    }
  };

  return (
    <div className="p-4 bg-light rounded-3 shadow">
      <h2 className="mb-4">Create New Service</h2>
      <Form onSubmit={formik.handleSubmit}>
        <Row className="g-3">

          {/* Name */}
          <Col md={6}>
            <Form.Group>
              <Form.Label>Service Name</Form.Label>
              <Form.Control
                name="name"
                placeholder="E.g., Mama Nguo Cleaning Services"
                {...formik.getFieldProps('name')}
              />
              {formik.touched.name && formik.errors.name && (
                <div className="text-danger">{formik.errors.name}</div>
              )}
            </Form.Group>
          </Col>

          {/* Category */}
          <Col md={6}>
            <Form.Group>
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                {...formik.getFieldProps('category')}
              >
                <option value="">Select Category</option>
                <option value="cleaning">Cleaning</option>
                <option value="mamafua">Laundry</option>
                <option value="repairs">Repairs</option>
                <option value="plumbing">Plumbing</option>
                <option value="beauty">Beauty & Therapy</option>
                <option value="tutor">Tutor</option>
                <option value="other">Other</option>
              </Form.Select>
              {formik.touched.category && formik.errors.category && (
                <div className="text-danger">{formik.errors.category}</div>
              )}
            </Form.Group>
          </Col>

          {/* Description */}
          <Col md={12}>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                {...formik.getFieldProps('description')}
              />
              {formik.touched.description && formik.errors.description && (
                <div className="text-danger">{formik.errors.description}</div>
              )}
            </Form.Group>
          </Col>

          {/* Operating Hours */}
          <Col md={6}>
            <Form.Group>
              <Form.Label><FaClock className="me-2" />Operating Hours</Form.Label>
              <Form.Check
                type="checkbox"
                label="Open 24/7"
                name="is24hr"
                checked={is24hr}
                onChange={handle24hrChange}
              />
              {!is24hr && (
                <Row className="g-2 mt-2">
                  <Col>
                    <Form.Control
                      type="time"
                      name="opening"
                      {...formik.getFieldProps('opening')}
                    />
                    {formik.touched.opening && formik.errors.opening && (
                      <div className="text-danger">{formik.errors.opening}</div>
                    )}
                  </Col>
                  <Col>
                    <Form.Control
                      type="time"
                      name="closing"
                      {...formik.getFieldProps('closing')}
                    />
                    {formik.touched.closing && formik.errors.closing && (
                      <div className="text-danger">{formik.errors.closing}</div>
                    )}
                  </Col>
                </Row>
              )}
            </Form.Group>
          </Col>

          {/* Phone */}
          <Col md={6}>
            <Form.Group>
              <Form.Label><FaPhone className="me-2" />Phone Number</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                placeholder="e.g. 0712345678"
                {...formik.getFieldProps('phone')}
              />
              {formik.touched.phone && formik.errors.phone && (
                <div className="text-danger">{formik.errors.phone}</div>
              )}
            </Form.Group>
          </Col>

          {/* Email */}
          <Col md={6}>
            <Form.Group>
              <Form.Label><FaEnvelope className="me-2" />Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="contact@service.com"
                {...formik.getFieldProps('email')}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="text-danger">{formik.errors.email}</div>
              )}
            </Form.Group>
          </Col>

          {/* Website */}
          <Col md={6}>
            <Form.Group>
              <Form.Label><FaGlobe className="me-2" />Website (Optional)</Form.Label>
              <Form.Control
                type="url"
                name="website"
                {...formik.getFieldProps('website')}
              />
              {formik.touched.website && formik.errors.website && (
                <div className="text-danger">{formik.errors.website}</div>
              )}
            </Form.Group>
          </Col>

          {/* Social Link */}
          <Col md={6}>
            <Form.Group>
              <Form.Label><FaLink className="me-2" />Social Media (Optional)</Form.Label>
              <Form.Control
                type="url"
                name="socialLink"
                {...formik.getFieldProps('socialLink')}
              />
              {formik.touched.socialLink && formik.errors.socialLink && (
                <div className="text-danger">{formik.errors.socialLink}</div>
              )}
            </Form.Group>
          </Col>

          {/* Location */}
          <Col md={6}>
            <Form.Group>
              <Form.Label><FaMapMarkerAlt className="me-2" />Shop Location (Optional)</Form.Label>
              <Form.Control
                type="url"
                name="locationUrl"
                {...formik.getFieldProps('locationUrl')}
              />
            </Form.Group>
          </Col>

          {/* Service Type */}
          <Col md={12}>
            <Form.Group>
              <Form.Label>Service Type</Form.Label>
              <Form.Select
                name="serviceType"
                {...formik.getFieldProps('serviceType')}
              >
                <option value="">Select Service Type</option>
                <option value="onsite">On-site Only</option>
                <option value="offsite">Off-site Only</option>
                <option value="both">Both On-site & Off-site</option>
              </Form.Select>
              {formik.touched.serviceType && formik.errors.serviceType && (
                <div className="text-danger">{formik.errors.serviceType}</div>
              )}
            </Form.Group>
          </Col>

          {/* Images */}
          <Col md={12}>
            <Form.Group>
              <Form.Label><FaImages className="me-2" />Upload Images</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={handleImageUpload}
                accept="image/*"
              />
              <div className="mt-2 d-flex flex-wrap gap-2">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={URL.createObjectURL(img)}
                    alt="Preview"
                    className="img-thumbnail"
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  />
                ))}
              </div>
            </Form.Group>
          </Col>

          {/* Submit */}
          <Col md={12}>
            <Button variant="primary" type="submit" className="w-100">
              Create Service
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default CreateService;
