import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiUserPlus, 
  FiLock, 
  FiMail, 
  FiCheckCircle, 
  FiUser, 
  FiSmartphone, 
  FiCreditCard, 
  FiUserCheck,
  FiLoader 
} from 'react-icons/fi';
import axios from 'axios';
import styled from 'styled-components';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';

const AuthContainer = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  position: relative;
`;

const IconWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  color: #64748b;
`;

const InputField = styled(Field)`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }
`;

const SelectField = styled.select`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  appearance: none;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }
`;

const ErrorText = styled.div`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background: #4f46e5;
  }
  
  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
`;

const validationSchema = Yup.object().shape({
  Name: Yup.string()
    .required('Full Name is required')
    .matches(/^[A-Za-z ]+$/, 'Name should only contain letters'),
  PhoneNumber: Yup.string()
    .matches(/^[0-9]{10}$/, 'Invalid phone number')
    .required('Phone Number is required'),
  Email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
 
  Gender: Yup.string()
    .required('Gender is required')
    .oneOf(['MALE', 'FEMALE', 'OTHER'], 'Invalid gender selection'),
  Password: Yup.string()
    .min(6, 'Password must be at least 8 characters')
    .required('Password is required'),
  ConfirmPassword: Yup.string()
    .oneOf([Yup.ref('Password'), null], 'Passwords must match')
    .required('Confirm Password is required')
});

const  BASE_URl = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";


const Register = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setServerError('');
      const response = await axios.post(`${BASE_URl}/register`, {
        ...values,

        Gender: values.Gender
      });
      localStorage.setItem('token', response.data.token);
      navigate('/login');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Registration failed');
    }
    setSubmitting(false);
  };

  return (
    <AuthContainer>
      <div className="text-center mb-6">
        <FiUserPlus className="text-3xl text-indigo-600 mb-4 mx-auto" />
        <h1 className="text-2xl font-bold">Create Account</h1>
      </div>

      <Formik
        initialValues={{ 
          Name: '',
          PhoneNumber: '',
          Email: '',
          Gender: '',
          Password: '',
          ConfirmPassword: ''
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            {/* Full Name Field */}
            <FormGroup>
              <IconWrapper><FiUser /></IconWrapper>
              <InputField name="Name" type="text" placeholder="Full Name" />
              <ErrorMessage name="Name" component={ErrorText} />
            </FormGroup>

            {/* Phone Number Field */}
            <FormGroup>
              <IconWrapper><FiSmartphone /></IconWrapper>
              <InputField name="PhoneNumber" type="tel" placeholder="Phone Number" />
              <ErrorMessage name="PhoneNumber" component={ErrorText} />
            </FormGroup>

            {/* Email Field */}
            <FormGroup>
              <IconWrapper><FiMail /></IconWrapper>
              <InputField name="Email" type="email" placeholder="Email" />
              <ErrorMessage name="Email" component={ErrorText} />
            </FormGroup>

        
            {/* Gender Field */}
            <FormGroup>
              <IconWrapper><FiUserCheck /></IconWrapper>
              <Field name="Gender" as={SelectField}>
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </Field>
              <ErrorMessage name="Gender" component={ErrorText} />
            </FormGroup>

            {/* Password Field */}
            <FormGroup>
              <IconWrapper><FiLock /></IconWrapper>
              <InputField name="Password" type="password" placeholder="Password" />
              <ErrorMessage name="Password" component={ErrorText} />
            </FormGroup>

            {/* Confirm Password Field */}
            <FormGroup>
              <IconWrapper><FiCheckCircle /></IconWrapper>
              <InputField name="ConfirmPassword" type="password" placeholder="Confirm Password" />
              <ErrorMessage name="ConfirmPassword" component={ErrorText} />
            </FormGroup>

            {serverError && <ErrorText className="mb-4">{serverError}</ErrorText>}

            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <FiLoader className="animate-spin" />
                  Registering...
                </>
              ) : (
                'Create Account'
              )}
            </SubmitButton>

            <p className="text-center mt-4 text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 hover:underline">
                Login here
              </Link>
            </p>
          </Form>
        )}
      </Formik>
    </AuthContainer>
  );
};

export default Register;