import React, { useState } from 'react';
import { Modal, Button, Spinner, Form } from 'react-bootstrap';
import { FaCalendarCheck } from 'react-icons/fa';

const SubscriptionModal = ({ show, onHide, userId }) => {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('weekly');

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          plan: selectedPlan,
          amount: selectedPlan === 'weekly' ? 1500 : 5000
        })
      });
      
      if (!response.ok) throw new Error('Subscription failed');
      onHide();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaCalendarCheck /> Subscribe
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Select Plan</Form.Label>
            <Form.Select 
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
            >
              <option value="weekly">Weekly (Ksh 1,500)</option>
              <option value="monthly">Monthly (Ksh 5,000)</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubscribe}
          disabled={loading}
        >
          {loading ? <Spinner size="sm" /> : 'Confirm Subscription'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SubscriptionModal;