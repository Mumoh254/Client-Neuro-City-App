// src/components/RegisterDevice.js
import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';

// Styled Components for the form container and elements
const FormWrapper = styled.div`
  max-width: 500px;
  margin: 2rem auto;
  background: #ffffff;
  padding: 2rem 2.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
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
    box-shadow: 0 0 0 0.2rem rgba(99,102,241,0.25);
  }
`;

const StyledError = styled.div`
  color: #e74c3c;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
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

const RegisterDevice = () => {
  // Validation schema with custom messages
  const validationSchema = Yup.object({
    imei: Yup.string()
      .length(15, 'IMEI must be exactly 15 characters')
      .required('IMEI is required'),
    ownerName: Yup.string().required('Owner name is required'),
  });

  const  BASE_URl = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";
 
  return (
    <FormWrapper>
      <FormTitle>Register Your Device</FormTitle>
      <Formik
        initialValues={{ imei: '', ownerName: '' }}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
          try {
            const response = await fetch(`${BASE_URl}/register-ime`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(values),
            });
            if (response.ok) {
              resetForm();
              // Optionally, you can provide a success alert here.
            }
          } catch (error) {
            console.error('Error registering device:', error);
          }
        }}
      >
        <Form>
          <StyledField name="imei" placeholder="IMEI number" />
          <ErrorMessage name="imei" component={StyledError} />

          <StyledField name="ownerName" placeholder="Owner name" />
          <ErrorMessage name="ownerName" component={StyledError} />

          <StyledButton type="submit">Register Device</StyledButton>
        </Form>
      </Formik>
    </FormWrapper>
  );
};

export default RegisterDevice;
