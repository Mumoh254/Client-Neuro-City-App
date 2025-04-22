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
          <h3>1. Just So You Know</h3>
          <p>
            By using Neouro City Apps, you're agreeing to these simple terms. They're just here to keep things smooth and safe for everyone.
            If you're not okay with them, you can stop using the app anytime—no hard feelings!
          </p>

          <h3>2. Be Honest</h3>
          <p>
            Please use real and correct info when using our services. It helps things work better for everyone.
            Don’t post fake stuff or misuse the platform.
          </p>

          <h3>3. Requesting Services</h3>
          <p>
            When posting a request or using a service, try to be clear. We’re not responsible for confusion caused by incomplete or wrong info.
          </p>

          <h3>4. We Protect Your Data</h3>
          <p>
            Your privacy matters. We collect only what’s needed to run the app properly, and we do our best to protect your personal data.
            We never share or sell your info to anyone else.
          </p>

          <h3>5. Things Might Go Down</h3>
          <p>
            Sometimes things break or need updates. If the app is ever down, we’ll try to get it back up quickly.
          </p>

          <h3>6. You're Responsible Too</h3>
          <p>
            We don’t control everything users do. Use the app responsibly and avoid anything shady.
          </p>

          <h3>7. Our Content</h3>
          <p>
            Everything in this app belongs to Neouro City Apps (unless stated). Please don’t copy or use it without asking us first.
          </p>

          <h3>8. Leaving the App</h3>
          <p>
            You can stop using the app anytime. We may also suspend accounts that go against these terms or misuse the platform.
          </p>

          <h3>9. Updates</h3>
          <p>
            We might tweak these terms sometimes. We’ll always post the latest version here.
          </p>

          <h3>10. Talk to Us</h3>
          <p>
            Got questions? You can reach us anytime:
            <br />
            <strong>WhatsApp:</strong> 0740045355  
            <br />
            <strong>Call:</strong> 0104148448  
            <br />
            <strong>Email:</strong> support@wettallis.com  
            <br />
            <strong>Location:</strong> Nairobi, Kenya
          </p>

          <h5>Effective: January 2025</h5>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
