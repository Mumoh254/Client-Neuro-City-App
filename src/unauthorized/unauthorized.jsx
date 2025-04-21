import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const UnauthorizedContainer = styled.div`
  text-align: center;
  padding: 4rem;
  max-width: 600px;
  margin: 0 auto;

  h1 {
    color: #dc3545;
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    color: #6c757d;
  }

  a {
    padding: 0.75rem 1.5rem;
    background: #6366f1;
    color: white;
    border-radius: 8px;
    text-decoration: none;
    transition: all 0.2s ease;

    &:hover {
      background: #4f46e5;
      transform: translateY(-2px);
    }
  }
`;

const UnauthorizedPage = () => (
  <UnauthorizedContainer>
    <h1>403 - Access Denied</h1>
    <p>You don't have permission to view this page</p>
    <NavLink to="/">Return to Homepage</NavLink>
  </UnauthorizedContainer>
);

export default UnauthorizedPage;