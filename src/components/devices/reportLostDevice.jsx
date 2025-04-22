// src/components/ReportLost.js
import React, { useEffect, useState } from 'react';
import { Formik, Field, Form } from 'formik';
import styled from 'styled-components';

// Styled Components
const FormWrapper = styled.div`
  max-width: 500px;
  margin: 2rem auto;
  background: #ffffff;
  padding: 2rem 2.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
`;

const StyledField = styled(Field)`
  width: 100%;
  padding: 0.75rem 1rem;
  margin-top: 0.5rem;
  margin-bottom: 0.25rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 0.2rem rgba(99, 102, 241, 0.25);
  }
`;

const LocationInfo = styled.p`
  margin: 1rem 0;
  font-size: 0.95rem;
  color: #555;
`;

const StyledButton = styled.button`
  display: block;
  width: 100%;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: #fff;
  border: none;
  padding: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
  transition: background 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #4f46e5, #9333ea);
  }
`;

const ReportLost = () => {
  const [location, setLocation] = useState(null);
  const  BASE_URl = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => setLocation(position.coords),
      (error) => console.error(error)
    );
  }, []);

  return (
    <FormWrapper>
      <FormTitle>Report Lost Device</FormTitle>
      <Formik
        initialValues={{ imei: '' }}
        onSubmit={async (values) => {
          try {
            const response = await fetch(`${BASE_URl}/report-lost`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...values, ...location })
            });
            if (response.ok) {
              // Optionally, show a success alert or reset form fields here.
            }
          } catch (error) {
            console.error('Error reporting lost device:', error);
          }
        }}
      >
        <Form>
          <StyledField name="imei" placeholder="IMEI number" />
          {location && (
            <LocationInfo>
              Current location: {location.latitude}, {location.longitude}
            </LocationInfo>
          )}
          <StyledButton type="submit">Report Lost</StyledButton>
        </Form>
      </Formik>
    </FormWrapper>
  );
};

export default ReportLost;
