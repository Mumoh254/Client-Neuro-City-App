// handler/goBack.js
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import styled from 'styled-components';

export const PageContainer = styled.div`
  position: relative;
`;

export const PageHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;

  h2 {
    flex-grow: 1;
    text-align: center;
    color: #2d3748;
    font-size: 1.25rem;
    margin: 0;
  }
`;

const BackButton = styled.button`
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.35rem 0.75rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #4f46e5;
    transform: translateY(-1px);
  }
`;

export const PageWithBack = ({ children, title }) => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <PageHeader>
        <BackButton onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </BackButton>
        <h2>{title}</h2>
      </PageHeader>
      {children}
    </PageContainer>
  );
};
