import React, { useState, useEffect } from 'react';
import { Offcanvas, ListGroup, Button, Tabs, Tab, Badge } from 'react-bootstrap';
import { Dash, Plus } from 'react-bootstrap-icons';

const CartSidebar = ({ show, cart, updateCart, onClose, userId }) => {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (userId && show) {
      const fetchOrderHistory = async () => {
        try {
          const response = await fetch(`/api/orders?userId=${userId}`);
          const data = await response.json();
          setOrders(data);
        } catch (error) {
          console.error('Error fetching orders:', error);
        } finally {
          setLoadingOrders(false);
        }
      };
      
      fetchOrderHistory();
    }
  }, [userId, show]);

  return (
    <Offcanvas show={show} onHide={onClose} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Cart & Order History</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Tabs defaultActiveKey="cart" className="mb-3">
          <Tab eventKey="cart" title={`Cart (${cart.length})`}>
            <ListGroup variant="flush" className="mb-4">
              {cart.map(item => (
                <ListGroup.Item key={item.id}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-0">{item.title}</h6>
                      <small>KES {item.price}</small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <Button size="sm" variant="outline-secondary"
                        onClick={() => updateCart(item, item.quantity - 1)}>
                        <Dash />
                      </Button>
                      <span>{item.quantity}</span>
                      <Button size="sm" variant="outline-secondary"
                        onClick={() => updateCart(item, item.quantity + 1)}>
                        <Plus />
                      </Button>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>

            <div className="mt-4">
              <h4 className="d-flex justify-content-between">
                Total: <span>KES {cart.reduce((sum, i) => sum + (i.price * i.quantity), 0)}</span>
              </h4>
              <Button variant="primary" size="lg" className="w-100 mt-3">
                Checkout
              </Button>
            </div>
          </Tab>

          <Tab eventKey="history" title="Order History">
            {loadingOrders ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-4 text-muted">
                No previous orders found
              </div>
            ) : (
              <ListGroup variant="flush">
                {orders.map(order => (
                  <ListGroup.Item key={order.id}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1">Order #{order.id}</h6>
                        <small className="text-muted">
                          {new Date(order.date).toLocaleDateString()}
                        </small>
                        <div className="mt-2">
                          <Badge bg={order.status === 'completed' ? 'success' : 'warning'}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-end">
                        <div>KES {order.total}</div>
                        <small className="text-muted">
                          {order.items.length} items
                        </small>
                      </div>
                    </div>
                    <div className="mt-2">
                      {order.items.slice(0, 2).map(item => (
                        <small key={item.id} className="d-block text-truncate">
                          {item.title}
                        </small>
                      ))}
                      {order.items.length > 2 && (
                        <small className="text-muted">
                          + {order.items.length - 2} more items
                        </small>
                      )}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Tab>
        </Tabs>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default CartSidebar;