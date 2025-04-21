import React from 'react';
import { FiFileText } from 'react-icons/fi';

const TermsAndConditions = () => {
  return (
    <div className="container py-5" style={{ maxWidth: '900px' }}>
      <div className="d-flex align-items-center gap-3 mb-4">
        <FiFileText size={32} className="text-primary" />
        <h1>Terms & Conditions</h1>
      </div>

      <div className="card shadow-sm">
        <div className="card-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <h3>1. Acceptance of Terms</h3>
          <p>
            By accessing and using Nairobi City Services (hereinafter referred to as "the Service"), you agree to comply with and be bound by these Terms & Conditions.
            If you do not agree to these terms, please do not use the Service.
          </p>

          <h3>2. User Responsibilities</h3>
          <p>
            Users must provide accurate, current, and complete information when posting service requests or interacting with the Service. You are responsible for maintaining the accuracy of your information and updating it as necessary. You agree not to use the Service for any unlawful activities.
          </p>

          <h3>3. Service Requests</h3>
          <p>
            Users can post service requests for various services offered in Nairobi. When posting a request, users must provide detailed and accurate information about the service needed. The Service is not liable for any issues arising from incorrect or incomplete information provided by users.
          </p>

          <h3>4. Data Privacy</h3>
          <p>
            We are committed to protecting your privacy. We collect and process personal data in accordance with applicable data protection laws. By using the Service, you consent to the collection and use of your data as outlined in our Privacy Policy.
          </p>

          <h3>5. Service Availability</h3>
          <p>
            While we strive to ensure that the Service is available 24/7, we cannot guarantee uninterrupted or error-free operation at all times. The Service may be unavailable due to maintenance or other unforeseen circumstances. We will make reasonable efforts to restore service as soon as possible.
          </p>

          <h3>6. Limitation of Liability</h3>
          <p>
            The Service shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use the Service, or any transactions or interactions with third-party service providers. Users agree to indemnify and hold harmless the Service, its affiliates, and employees from any liability related to their use of the Service.
          </p>

          <h3>7. Intellectual Property</h3>
          <p>
            All content, trademarks, and intellectual property associated with Nairobi City Services are owned by the company, Welt Tallis. Users are not permitted to copy, reproduce, or distribute any content without prior written consent from the company.
          </p>

          <h3>8. Termination of Service</h3>
          <p>
            We reserve the right to suspend or terminate user accounts for violations of these Terms & Conditions or any unlawful behavior. Users may terminate their account at any time by notifying us through the provided channels.
          </p>

          <h3>9. Changes to Terms</h3>
          <p>
            We reserve the right to update or modify these Terms & Conditions at any time. Any changes will be posted on this page with an updated revision date. It is the user's responsibility to review these terms periodically.
          </p>

          <h3>10. Governing Law</h3>
          <p>
            These Terms & Conditions are governed by the laws of Kenya. Any disputes arising from the use of the Service shall be subject to the exclusive jurisdiction of the courts in Nairobi.
          </p>

          <h3>11. Contact Information</h3>
          <p>
            If you have any questions or concerns about these Terms & Conditions, please contact us at:
            <br />
            <strong>Email:</strong> support@wettallis.com
            <br />
            <strong>Phone:</strong> +254 700 000 000
            <br />
            <strong>Address:</strong> Nairobi, Kenya
          </p>

          <h5>Effective Date: January 2025</h5>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
