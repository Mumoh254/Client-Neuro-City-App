// src/pages/TermsAndConditions.js
import { FiFileText } from 'react-icons/fi';

const TermsAndConditions = () => {
  return (
    <div className="container py-5" style={{ maxWidth: '800px' }}>
      <div className="d-flex align-items-center gap-3 mb-4">
        <FiFileText size={32} className="text-primary" />
        <h1>Terms & Conditions</h1>
      </div>

      <div className="card shadow-sm">
        <div className="card-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <h3>1. Acceptance of Terms</h3>
          <p>By accessing and using Nairobi City Services...</p>

          <h3>2. User Responsibilities</h3>
          <p>Users must provide accurate information...</p>

          <h3>3. Data Privacy</h3>
          <p>We collect and process personal data...</p>

          <h3>4. Service Availability</h3>
          <p>We strive to maintain 24/7 availability...</p>

          <h3>5. Limitation of Liability</h3>
          <p>The city shall not be liable for...</p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;