// ParkingSystem.js (Main User Interface)
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Button, Form, Container, Card, Spinner } from 'react-bootstrap';
import * as d3 from 'd3';
import axios from 'axios';
import Swal from 'sweetalert2';

const ParkingSystem = () => {
  const [parkingData, setParkingData] = useState({
    registrationNumber: "",
    duration: 60,
    location: "",
    isPrivate: false
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePark = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('/api/park', {
        ...parkingData,
        pricePerHour: parkingData.isPrivate ? 500 : 300 // Sample pricing
      });
      
      Swal.fire('Success!', `Parking session started - Ksh ${response.data.amountDue}`, 'success');
      startCountdown(parkingData.duration);
    } catch (error) {
      Swal.fire('Error!', error.response?.data?.message || 'Parking failed', 'error');
    }
    setLoading(false);
  };

  const registerPrivateParking = () => {
    Swal.fire({
      title: 'Register Private Parking',
      html: `
        <input id="swal-location" class="swal2-input" placeholder="Location">
        <input id="swal-capacity" class="swal2-input" placeholder="Capacity" type="number">
        <input id="swal-price" class="swal2-input" placeholder="Price per hour" type="number">
      `,
      focusConfirm: false,
      preConfirm: () => {
        return {
          location: document.getElementById('swal-location').value,
          capacity: document.getElementById('swal-capacity').value,
          price: document.getElementById('swal-price').value
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        axios.post('/api/register-private', result.value)
          .then(() => Swal.fire('Success!', 'Private parking registered', 'success'));
      }
    });
  };

  return (
    <Container className="my-4">
      <Card className="shadow-lg">
        <Card.Body>
          <h2 className="mb-4">Nairobi Smart Parking</h2>
          
          <Form onSubmit={handlePark}>
            {/* Form fields */}
            <Form.Group className="mb-3">
              <Form.Check 
                type="switch"
                label="Private Parking"
                checked={parkingData.isPrivate}
                onChange={e => setParkingData({...parkingData, isPrivate: e.target.checked})}
              />
            </Form.Group>

            <div className="d-grid gap-3">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Start Parking'}
              </Button>
              <Button variant="outline-secondary" onClick={registerPrivateParking}>
                Register Private Parking Space
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};