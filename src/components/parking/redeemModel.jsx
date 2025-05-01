import React, { useState } from 'react';
import { Modal, Button, Spinner, Form } from 'react-bootstrap';
import { FaCoins } from 'react-icons/fa';

const RedeemPointsModal = ({ show, onHide, points, userId }) => {
  const [loading, setLoading] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState('');

  const handleRedeem = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          points: parseInt(redeemAmount)
        })
      });

      if (!response.ok) throw new Error('Redemption failed');
      onHide();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const maxPoints = Math.floor(points / 100) * 100;
  const redeemValue = (redeemAmount / 100) * 10;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaCoins /> Redeem Points
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>
              Points to Redeem (Max: {maxPoints} pts)
            </Form.Label>
            <Form.Control
              type="number"
              min="100"
              max={maxPoints}
              step="100"
              value={redeemAmount}
              onChange={(e) => setRedeemAmount(e.target.value)}
            />
            <Form.Text className="text-muted">
              Redeemable value: Ksh {redeemValue}
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="warning" 
          onClick={handleRedeem}
          disabled={loading || !redeemAmount}
        >
          {loading ? <Spinner size="sm" /> : 'Redeem Points'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RedeemPointsModal;