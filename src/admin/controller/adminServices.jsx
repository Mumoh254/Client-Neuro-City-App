import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Alert, Container, Table, Spinner, Button, Modal } from 'react-bootstrap';

const BASE_URL = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";

const normalizeService = (service) => ({
  id: service._id,
  name: service.name,
  category: service.category,
  isApproved: service.isApproved,
  createdAt: service.createdAt,
});

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/get/services`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(response.data.map(normalizeService));
      setErr(null);
    } catch (error) {
      console.error("❌ Error fetching services:", error);
      setErr('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const approveService = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${BASE_URL}/approve/service/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchServices();
    } catch (error) {
      alert("Failed to approve service");
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/delete/service/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchServices();
    } catch (error) {
      alert("Failed to delete service");
    }
  };

  const openModal = (service) => {
    setSelectedService(service);
    setShowDetails(true);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <Container className="mt-4">
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <h2>Services Management</h2>
        <Button variant="primary" onClick={fetchServices}>Refresh Services</Button>
      </div>

      {err && <Alert variant="danger">{err}</Alert>}
      {loading && <Spinner animation="border" variant="primary" />}

      {!loading && services.length === 0 && (
        <Alert variant="info">No services found</Alert>
      )}

      {!loading && services.length > 0 && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Service ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map(service => (
              <tr key={service.id}>
                <td>#{service.id.slice(-6).toUpperCase()}</td>
                <td>{service.name}</td>
                <td>{service.category}</td>
                <td>
                  {service.isApproved ? (
                    <span className="text-success">Approved</span>
                  ) : (
                    <span className="text-warning">Pending</span>
                  )}
                </td>
                <td>{new Date(service.createdAt).toLocaleDateString()}</td>
                <td>
                  <Button variant="info" size="sm" className='me-2' onClick={() => openModal(service)}>View</Button>
                  {!service.isApproved && (
                    <Button variant="success" size="sm" className='me-2' onClick={() => approveService(service.id)}>
                      Approve
                    </Button>
                  )}
                  <Button variant="danger" size="sm" onClick={() => deleteService(service.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Service Details - #{selectedService?.id.slice(-6).toUpperCase()}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedService && (
            <div className="row mb-4">
              <div className="col-md-6">
                <h5>Service Information</h5>
                <p><strong>Service Name:</strong> {selectedService.name}</p>
                <p><strong>Category:</strong> {selectedService.category}</p>
                <p><strong>Status:</strong> {selectedService.isApproved ? 'Approved' : 'Pending'}</p>
                <p><strong>Created:</strong> {new Date(selectedService.createdAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
