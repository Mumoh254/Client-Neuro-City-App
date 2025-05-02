import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { FaClock, FaMapMarkerAlt, FaImages, FaPhone, FaGlobe, FaLink, FaEnvelope, FaTimes } from 'react-icons/fa';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { getUserIdFromToken } from "../handler/tokenDecoder";

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

const MAX_IMAGES = 5;
const IMAGE_SIZE = 800; // Max width/height for compressed images

const CreateService = () => {
  const BASE_URL = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";
  const [userId, setUserId] = useState(null);
  const [images, setImages] = useState([]);
  const [is24hr, setIs24hr] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const userId = getUserIdFromToken();
    setUserId(userId);
  }, []);

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
      setIsSubmitting(true);
      try {
        const formData = new FormData();
        
        // Append form values
        Object.entries(values).forEach(([key, value]) => {
          if (key !== 'opening' && key !== 'closing') {
            formData.append(key, value);
          }
        });

        // Handle opening hours
        if (!is24hr) {
          formData.append('openingHours[opening]', values.opening);
          formData.append('openingHours[closing]', values.closing);
        }

        // Append compressed images
        for (const img of images) {
          formData.append('images', img.file);
        }

        const response = await fetch(`${BASE_URL}/create/service`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          Swal.fire('Success!', 'Service created successfully!', 'success');
          formik.resetForm();
          setImages([]);
          setIs24hr(false);
        } else {
          const errorData = await response.json();
          Swal.fire('Error!', errorData.message || 'Failed to create service', 'error');
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Error!', 'Server error. Please try again later.', 'error');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions
          let width = img.width;
          let height = img.height;
          const aspectRatio = width / height;

          if (width > height && width > IMAGE_SIZE) {
            width = IMAGE_SIZE;
            height = width / aspectRatio;
          } else if (height > IMAGE_SIZE) {
            height = IMAGE_SIZE;
            width = height * aspectRatio;
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            resolve({
              preview: URL.createObjectURL(blob),
              file: new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
            });
          }, 'image/jpeg', 0.7);
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    try {
      const files = Array.from(e.target.files);
      if (files.length + images.length > MAX_IMAGES) {
        Swal.fire('Error', `Maximum ${MAX_IMAGES} images allowed`, 'error');
        return;
      }

      const compressedFiles = await Promise.all(
        files.map(async (file) => await compressImage(file))
      );
      
      setImages(prev => [...prev, ...compressedFiles]);
      e.target.value = null;
    } catch (error) {
      Swal.fire('Error', 'Failed to process images', 'error');
    }
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(images[index].preview);
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-3 p-md-4 bg-white rounded-3 shadow-sm" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="mb-4 text-primary">Create New Service</h2>
      <Form onSubmit={formik.handleSubmit}>
        <Row className="g-3">

          {/* Service Name */}
          <Col md={6}>
            <Form.Group controlId="name">
              <Form.Label>Service Name</Form.Label>
              <Form.Control
                name="name"
                placeholder="E.g., Mama Nguo Cleaning Services"
                {...formik.getFieldProps('name')}
                isInvalid={formik.touched.name && !!formik.errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.name}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          {/* Category */}
          <Col md={6}>
            <Form.Group controlId="category">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                {...formik.getFieldProps('category')}
                isInvalid={formik.touched.category && !!formik.errors.category}
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
              <Form.Control.Feedback type="invalid">
                {formik.errors.category}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          {/* Description */}
          <Col md={12}>
            <Form.Group controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                {...formik.getFieldProps('description')}
                isInvalid={formik.touched.description && !!formik.errors.description}
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.description}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          {/* Operating Hours */}
          <Col md={6}>
            <Form.Group controlId="operatingHours">
              <Form.Label><FaClock className="me-2" />Operating Hours</Form.Label>
              <Form.Check
                type="checkbox"
                label="Open 24/7"
                name="is24hr"
                checked={is24hr}
                onChange={(e) => {
                  setIs24hr(e.target.checked);
                  formik.setFieldValue('is24hr', e.target.checked);
                  if (e.target.checked) {
                    formik.setFieldValue('opening', '');
                    formik.setFieldValue('closing', '');
                  }
                }}
              />
              {!is24hr && (
                <Row className="g-2 mt-2">
                  <Col>
                    <Form.Control
                      type="time"
                      name="opening"
                      {...formik.getFieldProps('opening')}
                      isInvalid={formik.touched.opening && !!formik.errors.opening}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.opening}
                    </Form.Control.Feedback>
                  </Col>
                  <Col>
                    <Form.Control
                      type="time"
                      name="closing"
                      {...formik.getFieldProps('closing')}
                      isInvalid={formik.touched.closing && !!formik.errors.closing}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.closing}
                    </Form.Control.Feedback>
                  </Col>
                </Row>
              )}
            </Form.Group>
          </Col>

          {/* Contact Information */}
          <Col md={6}>
            <Form.Group controlId="phone">
              <Form.Label><FaPhone className="me-2" />Phone Number</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                placeholder="e.g. 0712345678"
                {...formik.getFieldProps('phone')}
                isInvalid={formik.touched.phone && !!formik.errors.phone}
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.phone}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          {/* Email */}
          <Col md={6}>
            <Form.Group controlId="email">
              <Form.Label><FaEnvelope className="me-2" />Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="contact@service.com"
                {...formik.getFieldProps('email')}
                isInvalid={formik.touched.email && !!formik.errors.email}
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.email}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          {/* Website */}
          <Col md={6}>
            <Form.Group controlId="website">
              <Form.Label><FaGlobe className="me-2" />Website (Optional)</Form.Label>
              <Form.Control
                type="url"
                name="website"
                placeholder="https://yourservice.com"
                {...formik.getFieldProps('website')}
                isInvalid={formik.touched.website && !!formik.errors.website}
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.website}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          {/* Social Media */}
          <Col md={6}>
            <Form.Group controlId="socialLink">
              <Form.Label><FaLink className="me-2" />Social Media (Optional)</Form.Label>
              <Form.Control
                type="url"
                name="socialLink"
                placeholder="https://facebook.com/yourpage"
                {...formik.getFieldProps('socialLink')}
                isInvalid={formik.touched.socialLink && !!formik.errors.socialLink}
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.socialLink}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          {/* Location */}
          <Col md={6}>
            <Form.Group controlId="locationUrl">
              <Form.Label><FaMapMarkerAlt className="me-2" />Shop Location (Optional)</Form.Label>
              <Form.Control
                type="url"
                name="locationUrl"
                placeholder="https://goo.gl/maps/..."
                {...formik.getFieldProps('locationUrl')}
                isInvalid={formik.touched.locationUrl && !!formik.errors.locationUrl}
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.locationUrl}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          {/* Service Type */}
          <Col md={12}>
            <Form.Group controlId="serviceType">
              <Form.Label>Service Type</Form.Label>
              <Form.Select
                name="serviceType"
                {...formik.getFieldProps('serviceType')}
                isInvalid={formik.touched.serviceType && !!formik.errors.serviceType}
              >
                <option value="">Select Service Type</option>
                <option value="onsite">On-site Only</option>
                <option value="offsite">Off-site Only</option>
                <option value="both">Both On-site & Off-site</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {formik.errors.serviceType}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          {/* Image Upload */}
          <Col md={12}>
            <Form.Group controlId="images">
              <Form.Label><FaImages className="me-2" />Upload Images</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={handleImageUpload}
                accept="image/*"
                capture="environment"
                disabled={images.length >= MAX_IMAGES}
              />
              <small className="text-muted d-block mt-2">
                {MAX_IMAGES - images.length} images remaining (max {MAX_IMAGES})
              </small>
              
              {/* Image Previews */}
              <div className="d-flex flex-wrap gap-2 mt-3">
                {images.map((img, index) => (
                  <div key={index} className="position-relative">
                    <img
                      src={img.preview}
                      alt={`Preview ${index + 1}`}
                      className="img-thumbnail"
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-danger btn-sm position-absolute top-0 end-0"
                      onClick={() => removeImage(index)}
                      style={{
                        transform: 'translate(30%, -30%)',
                        padding: '2px 6px',
                        borderRadius: '50%'
                      }}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            </Form.Group>
          </Col>

          {/* Submit Button */}
          <Col md={12}>
            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 py-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                  <span className="ms-2">Creating Service...</span>
                </>
              ) : (
                'Create Service'
              )}
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default CreateService;