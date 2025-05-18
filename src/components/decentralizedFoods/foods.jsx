import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Button, Spinner, Alert, Badge,
  Modal, Form, Offcanvas, ListGroup, Tabs, Tab , ButtonGroup, Carousel, ProgressBar
} from 'react-bootstrap';
import {
  GeoAlt,  Star, StarHalf   ,Cart,  Scooter,
  CheckCircle, EggFried, FilterLeft,    StarFill, CartPlus, Person, Clock,  Instagram, Facebook, Twitter , Plus,  Dash, Trash, Pencil, Bell
} from 'react-bootstrap-icons';

import { useNavigate } from 'react-router-dom'; 

import styled from 'styled-components';
import { formatDistanceToNow } from 'date-fns';
import { GiKenya } from "react-icons/gi";
import { getUserIdFromToken } from '../handler/tokenDecoder';

const theme = {
  primary: '#2563eb',
  secondary: '#c3e703',
  accent: '#CC00FF',
  light: '#fff',
  dark: '#CC00FF'
};

const StyledCard = styled(Card)`
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .card-img-top {
    height: 200px;
    object-fit: cover;
  }
`;




const FilterButton = styled(Button)`
  border-radius: 20px;
  padding: 0.5rem 1.2rem;
  margin: 0 0.3rem;
`;


const StoriesContainer = styled.div`
  padding: 1rem 0;
  .story-item {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid ${theme.primary};
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
      transform: scale(1.05);
      border-color: ${theme.accent};
    }
  }
`;

const ResponsiveCard = styled(Card)`
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .card-img-top {
    height: 200px;
    object-fit: cover;
    @media (max-width: 768px) {
      height: 150px;
    }
  }
`;

const StoryItem = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid ${theme.primary};
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    transform: scale(1.05);
    border-color: ${theme.accent};
  }
  @media (max-width: 576px) {
    width: 60px;
    height: 60px;
  }
`;

const FoodPlatform = () => {



  const colors = {
    primary: '#c3e703', // Vibrant lime green
    secondary: '#96d1c7', // Soft teal
    accent: '#ff6b6b',   // Coral pink
    dark: '#2d3436',     // Charcoal
    light: '#f5f6fa'     // Off-white
  };


  const navigate = useNavigate(); // Hook for navigation
  
  const [state, setState] = useState({
    foods: [],
    orders: [],
    riders: [],
    cart: [],
    loading: true,
    error: null,
    showChefReg: false,
    showRiderReg: false,
    showCart: false,
    showFoodPost: false,
    showAnalytics: false,
    showBikers: false,
    showEditFood: null,
    isChefMode: localStorage.getItem('isChef') === 'true',
    isRiderMode: localStorage.getItem('isRider') === 'true',
    filters: { area: 'all', specialty: 'all', mealType: 'all' }
  });

  const [userId, setUserId] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const userId = getUserIdFromToken();
    setUserId(userId);
    Notification.requestPermission().then(perm => {
      if(perm === 'granted') new Notification('Notifications Enabled');
    });
  }, []);

  const showNotification = (title, body) => {
    if(Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  };

  const loadData = async () => {
    try {
      const [foodsRes, ordersRes, ridersRes] = await Promise.all([
        fetch('http://localhost:8000/apiV1/smartcity-ke/get/foods'),
        fetch('/api/orders'),
        fetch('/api/riders')
      ]);

   
      const foods = await foodsRes.json();
      const orders = await ordersRes.json();
      const riders = await ridersRes.json();

      const chefId = localStorage.getItem('chefId');
      const riderId = localStorage.getItem('riderId');

      setState(s => ({
        ...s,
        foods: chefId ? foods.filter(f => f.chef?.id === chefId) : foods,
        orders: orders.filter(o => {
          if(chefId) return o.chefId === chefId;
          if(riderId) return o.riderId === riderId;
          return o.userId === userId;
        }),
        riders,
        loading: false
      }));
    } catch (err) {
      setState(s => ({ ...s, error: err.message, loading: false }));
    }
  };

  useEffect(() => { loadData(); }, []);


  useEffect(() => {
    
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/apiV1/smartcity-ke/get/foods');
        const data = await response.json();
        
        const areas = [...new Set(data.map(food => food.area))];
        const specialties = [...new Set(data.map(food => food.chef?.speciality))];

        setState(s => ({
          ...s,
          foods: data,
          areas: ['all', ...areas],
          specialties: ['all', ...specialties],
          loading: false
        }));
      } catch (err) {
        setState(s => ({ ...s, error: err.message, loading: false }));
      }
    };
    fetchData();
  }, []);

  const filteredFoods = state.foods.filter(food => {
    const matchesArea = state.filters.area === 'all' || food.area === state.filters.area;
    const matchesSpecialty = state.filters.specialty === 'all' || food.chef?.speciality === state.filters.specialty;
    const matchesMealType = state.filters.mealType === 'all' || food.mealType === state.filters.mealType;
    return matchesArea && matchesSpecialty && matchesMealType;
  });

  
  const  updateCart =  ()=>{
    console.log("cart  updated")
  }
  // Chef Food Management
  const createFood = async (foodData) => {
    try {
      const res = await fetch('http://localhost:8000/apiV1/smartcity-ke/food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...foodData,
          chefId: localStorage.getItem('chefId')
        })
      });
      
      if(res.ok) {
        loadData();
        showNotification('New Food Added', `${foodData.title} now available!`);
      }
    } catch(err) {
      console.error('Create error:', err);
    }
  };



  const FilterSection = () => (
    <div className="mb-4 p-3 bg-white rounded shadow-sm">
      <Row className="g-3">
        <Col md={3}>
          <Form.Control
            placeholder="🔍 Search dishes..."
            value={state.filters.searchQuery}
            onChange={(e) => setState(s => ({ 
              ...s, 
              filters: { ...s.filters, searchQuery: e.target.value } 
            }))}
          />
        </Col>
        <Col md={3}>
          <Form.Select 
            value={state.filters.area}
            onChange={(e) => setState(s => ({ 
              ...s, 
              filters: { ...s.filters, area: e.target.value } 
            }))}
          >
            {state.areas?.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select 
            value={state.filters.specialty}
            onChange={(e) => setState(s => ({ 
              ...s, 
              filters: { ...s.filters, specialty: e.target.value } 
            }))}
          >
            {state.specialties?.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select 
            value={state.filters.mealType}
            onChange={(e) => setState(s => ({ 
              ...s, 
              filters: { ...s.filters, mealType: e.target.value } 
            }))}
          >
            <option value="all">All Meals</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
          </Form.Select>
        </Col>
      </Row>
    </div>
  );

  const updateFood = async (foodData) => {
    try {
      const res = await fetch(`http://localhost:8000/apiV1/smartcity-ke/food/${foodData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(foodData)
      });
      
      if(res.ok) {
        loadData();
        showNotification('Food Updated', `${foodData.title} updated successfully`);
      }
    } catch(err) {
      console.error('Update error:', err);
    }
  };

  const deleteFood = async (foodId) => {
    try {
      await fetch(`http://localhost:8000/apiV1/smartcity-ke/food/${foodId}`, {
        method: 'DELETE'
      });
      loadData();
      showNotification('Food Removed', 'Item removed from your listings');
    } catch(err) {
      console.error('Delete error:', err);
    }
  };

  // Orders Management
  const updateOrderStatus = async (orderId, status) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      loadData();
      showNotification('Order Updated', `Status changed to ${status}`);
    } catch(err) {
      console.error('Order update error:', err);
    }
  };

  // Registration Handlers
  const registerChef = async (formData) => {
    try {
      const res = await fetch('http://localhost:8000/apiV1/smartcity-ke/chef', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId })
      });

      const data = await res.json();
      if(res.ok) {
        localStorage.setItem('chefId', data.chef.id);
        localStorage.setItem('isChef', 'true');
        setState(s => ({ ...s, isChefMode: true, showChefReg: false }));
        showNotification('Chef Mode Activated', 'Welcome to your chef dashboard!');
      }
    } catch(err) {
      console.error('Chef registration error:', err);
    }
  };

  const registerRider = async (formData) => {
    try {
      const res = await fetch('/api/riders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if(res.ok) {
        localStorage.setItem('riderId', data.rider.id);
        localStorage.setItem('isRider', 'true');
        setState(s => ({ ...s, isRiderMode: true, showRiderReg: false }));
        showNotification('Rider Mode Activated', 'Start accepting deliveries!');
      }
    } catch(err) {
      console.error('Rider registration error:', err);
    }
  };


  

  const ChefRegistrationModal = ({ show, onClose, onSubmit }) => (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Chef Registration</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          onSubmit({
            bio: formData.get('bio'),
            speciality: formData.get('speciality'),
            experienceYears: parseInt(formData.get('experienceYears')),
            certifications: formData.get('certifications').split(','),
            location: formData.get('location'),
            city: formData.get('city'),
            latitude: parseFloat(formData.get('latitude')),
            longitude: parseFloat(formData.get('longitude'))
          });
        }}>
          <Form.Group className="mb-3">
            <Form.Label>Bio</Form.Label>
            <Form.Control name="bio" as="textarea" rows={3} required />
          </Form.Group>
  
          <Form.Group className="mb-3">
            <Form.Label>Specialty</Form.Label>
            <Form.Select name="speciality" required>
              <option value="African Cuisine">African Cuisine</option>
              <option value="Continental">Continental</option>
              <option value="Fusion">Fusion</option>
            </Form.Select>
          </Form.Group>
  
          <Form.Group className="mb-3">
            <Form.Label>Years of Experience</Form.Label>
            <Form.Control name="experienceYears" type="number" min="0" required />
          </Form.Group>
  
          <Form.Group className="mb-3">
            <Form.Label>Certifications (comma separated)</Form.Label>
            <Form.Control name="certifications" placeholder="HACCP, Food Safety" />
          </Form.Group>
  
          <Form.Group className="mb-3">
            <Form.Label>Location</Form.Label>
            <Form.Control name="location" required />
          </Form.Group>
  
          <Form.Group className="mb-3">
            <Form.Label>City</Form.Label>
            <Form.Control name="city" defaultValue="Nairobi" required />
          </Form.Group>
  
          <Form.Group className="mb-3">
            <Form.Label>Latitude</Form.Label>
            <Form.Control name="latitude" type="number" step="any" required />
          </Form.Group>
  
          <Form.Group className="mb-3">
            <Form.Label>Longitude</Form.Label>
            <Form.Control name="longitude" type="number" step="any" required />
          </Form.Group>
  
          <Button type="submit" variant="primary" className="w-100">
            Register as Chef
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );


  const RiderRegistrationModal = ({ show, onClose, onSubmit }) => (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Rider Registration</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          onSubmit({
            nationalId: formData.get('nationalId'),
            vehicle: formData.get('vehicle'),
            registrationPlate: formData.get('registrationPlate'),
            workHours: formData.get('workHours'),
            serviceArea: formData.get('serviceArea')
          });
        }}>
          <Form.Group className="mb-3">
            <Form.Label>National ID</Form.Label>
            <Form.Control name="nationalId" required />
          </Form.Group>
  
          <Form.Group className="mb-3">
            <Form.Label>Vehicle Type</Form.Label>
            <Form.Select name="vehicle" required>
              <option value="Bicycle">Bicycle</option>
              <option value="Motorcycle">Motorcycle</option>
              <option value="Car">Car</option>
            </Form.Select>
          </Form.Group>
  
          <Form.Group className="mb-3">
            <Form.Label>License Plate</Form.Label>
            <Form.Control name="registrationPlate" required />
          </Form.Group>
  
          <Form.Group className="mb-3">
            <Form.Label>Work Hours</Form.Label>
            <Form.Control name="workHours" placeholder="9am - 5pm" required />
          </Form.Group>
  
          <Form.Group className="mb-3">
            <Form.Label>Service Area</Form.Label>
            <Form.Control name="serviceArea" required />
          </Form.Group>
  
          <Button type="submit" variant="primary" className="w-100">
            Register as Rider
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
  

  return (
    <Container fluid className="px-lg-4 px-2" style={{ backgroundColor: theme.light }}>
      {/* Header */}
      <header className="header bg-white shadow-sm sticky-top">
  <div className="container">
    <div className="d-flex justify-content-between align-items-center py-3">
      {/* Branding */}
      <div className="d-flex align-items-center gap-3">
        <GiKenya className="text-primary" style={{ fontSize: '2.5rem' }} />
        <h1 className="m-0 brand-title">
          <span className="text-primary">Jikoni</span>
          <span className="text-danger">Express</span>
        </h1>
      </div>

      {/* Actions */}
      <div className="d-flex gap-3 align-items-center">
        {/* Role Buttons */}
        {!state.isChefMode && !state.isRiderMode && (
          <div className="d-flex gap-2">
            <Button 
              variant="outline-primary"
              className="rounded-pill px-4 d-flex align-items-center"
              onClick={() => setState(s => ({ ...s, showChefReg: true }))}
            >
              <Person className="me-2" />
              Chef
            </Button>
            <Button 
              variant="outline-success"
              className="rounded-pill px-4 d-flex align-items-center"
              onClick={() => setState(s => ({ ...s, showRiderReg: true }))}
            >
              <Scooter className="me-2" />
              Rider
            </Button>
          </div>
        )}

        {/* Exit Button */}
        {state.isChefMode && (
          <Button 
            variant="danger"
            className="rounded-pill px-4"
            onClick={() => {
              localStorage.removeItem('chefId');
              setState(s => ({ ...s, isChefMode: false }));
            }}
          >
            Exit Chef Mode
          </Button>
        )}

        {/* Cart Button */}
        <Button 
          variant="warning"
          className="rounded-pill px-4 position-relative"
          onClick={() => setState(s => ({ ...s, showCart: true }))} 
          style={{ minWidth: '120px' }}
        >
          <Cart className="me-2" />
          Cart
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {state.cart.reduce((sum, i) => sum + i.quantity, 0)}
            <span className="visually-hidden">items in cart</span>
          </span>
        </Button>
      </div>
    </div>
  </div>

  <style jsx>{`
    .header {
      border-bottom: 2px solid rgba(0,0,0,0.1);
      z-index: 1000;
    }
    
    .brand-title {
      font-family: 'Pacifico', cursive;
      font-size: 2rem;
      letter-spacing: -1px;
    }
    
    .btn-outline-primary {
      border-color: var(--grenish-color);
      color: var(--grenish-color);
    }
    
    .btn-outline-primary:hover {
      background: var(--grenish-color);
      color: white;
    }
    
    .btn-outline-success {
      border-color: var(--bluish-color);
      color: var(--bluish-color);
    }
    
    .btn-outline-success:hover {
      background: var(--bluish-color);
      color: white;
    }
    
    .btn-warning {
      background: #ffc107;
      border-color: #ffc107;
      color: black;
      transition: all 0.3s ease;
    }
    
    .btn-warning:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 15px rgba(255,193,7,0.3);
    }
    
    .badge {
      font-size: 0.75rem;
      padding: 0.5em 0.75em;
    }
    
    @media (max-width: 768px) {
      .brand-title {
        font-size: 1.5rem;
      }
      
      .btn {
        padding: 0.375rem 0.75rem;
        font-size: 0.875rem;
      }
      
      .btn svg {
        margin-right: 0.25rem !important;
      }
    }
  `}</style>
</header>

      {/* Main Content */}
      {state.isChefMode ? (
        <div className="py-2">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Chef Dashboard</h2>
            <div className="d-flex gap-2">
              <Button variant="success" onClick={() => setState(s => ({ ...s, showFoodPost: true }))}>
                + Post New Food
              </Button>
              <Button variant="info" onClick={() => setState(s => ({ ...s, showAnalytics: true }))}>
                Analytics
              </Button>
              <Button variant="warning" onClick={() => setState(s => ({ ...s, showBikers: true }))}>
                Available Riders
              </Button>
            </div>
          </div>

          <div className="table-responsive">
  <table className="table table-hover align-middle">
    <thead className="table-light">
      <tr>
        <th style={{ width: '100px' }}>Item</th>
        <th>Details</th>
        <th className="d-none d-md-table-cell">Description</th>
        <th>Price</th>
        <th className="d-none d-sm-table-cell">Type</th>
        <th className="d-none d-lg-table-cell">Posted</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {state.foods.map(food => (
        <tr key={food.id}>
          {/* Image Gallery */}
          <td>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <img 
                src={food.photoUrls[0]} 
                alt={food.title}
                className="img-fluid"
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  backgroundColor: '#f8f9fa'
                }}
              />
              {food.photoUrls.length > 1 && (
                <span className="badge bg-dark position-absolute bottom-0 end-0 m-1">
                  +{food.photoUrls.length -1}
                </span>
              )}
            </div>
          </td>

          {/* Title and Mobile Details */}
          <td>
            <div className="d-flex flex-column">
              <strong className="mb-1">{food.title}</strong>
              <div className="d-flex d-md-none gap-1 flex-wrap">
                <span className="badge bg-primary">KES {food.price}</span>
                <span className="badge bg-info">{food.mealType}</span>
                <small className="text-muted">
                  {formatDistanceToNow(new Date(food.createdAt), { addSuffix: true })}
                </small>
              </div>
            </div>
          </td>

          {/* Description (Hidden on mobile) */}
          <td className="d-none d-md-table-cell">
            <p className="text-muted small mb-0 line-clamp-2">
              {food.description}
            </p>
          </td>

          {/* Price (Hidden on mobile - shown in title column) */}
          <td className="d-none d-md-table-cell">
            <span className="badge bg-primary">KES {food.price}</span>
          </td>

          {/* Meal Type (Hidden on mobile - shown in title column) */}
          <td className="d-none d-sm-table-cell">
            <span className="badge bg-info">{food.mealType}</span>
          </td>

          {/* Posted Date (Hidden on mobile) */}
          <td className="d-none d-lg-table-cell">
            <small className="text-muted">
              {formatDistanceToNow(new Date(food.createdAt), { addSuffix: true })}
            </small>
          </td>

          {/* Actions */}
          <td>
          <div className="d-flex gap-2 align-items-center">
  {/* Edit Button */}
  <button
    type="button"
    className="btn blue btn-sm hover-effect"
    onClick={() => setState(prev => ({ ...prev, showEditFood: food }))}
  >
    <i className="bi bi-pencil me-1"></i> Edit
  </button>

  {/* Delete Button */}
  <button
    type="button"
    className="btn red btn-sm hover-effect text-white"
    onClick={() => deleteFood(food.id)}
  >
    <i className="bi bi-trash me-1  "></i> Delete
  </button>
</div>

          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
          <Form
  onSubmit={async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const response = await fetch("http://localhost:8000/apiV1/smartcity-ke/create/food", {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    console.log(data);
  }}
  encType="multipart/form-data"
>
  <Form.Group>
    <Form.Label>Title</Form.Label>
    <Form.Control name="title" required />
  </Form.Group>

  <Form.Group>
    <Form.Label>Description</Form.Label>
    <Form.Control name="description" as="textarea" required />
  </Form.Group>

  <Form.Group>
    <Form.Label>Price</Form.Label>
    <Form.Control name="price" type="number" required />
  </Form.Group>

  <Form.Group>
    <Form.Label>Meal Type</Form.Label>
    <Form.Control name="mealType" required />
  </Form.Group>

  <Form.Group>
    <Form.Label>Upload Food Images</Form.Label>
    <Form.Control name="images" type="file" multiple required />
  </Form.Group>

  <Form.Group>
    <Form.Label>Area</Form.Label>
    <Form.Control name="area" required />
  </Form.Group>

  <Form.Group>
    <Form.Label>Chef ID</Form.Label>
    <Form.Control name="chefId" required />
  </Form.Group>

  <Button type="submit">Create</Button>
</Form>



          {/* Edit Food Modal */}
          <Modal show={!!state.showEditFood} onHide={() => setState(s => ({ ...s, showEditFood: null }))}>
            <Modal.Header closeButton>
              <Modal.Title>Edit {state.showEditFood?.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                updateFood({
                  id: state.showEditFood.id,
                  ...Object.fromEntries(formData.entries())
                });
              }}>
                {/* Form fields */}
              </Form>
            </Modal.Body>
          </Modal>



          {/* Analytics Sidebar */}
          <Offcanvas show={state.showAnalytics} onHide={() => setState(s => ({ ...s, showAnalytics: false }))} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Chef Analytics</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <div className="mb-4">
          <h5>Total Earnings</h5>
          <h2 className="text-success">KES {state.orders.reduce((sum, o) => sum + o.total, 0)}</h2>
        </div>
        <div className="mb-4">
          <h5>Completed Orders</h5>
          <h3>{state.orders.filter(o => o.status === 'delivered').length}</h3>
        </div>
        <div>
          <h5>Order Status Distribution</h5>
          <ProgressBar className="mb-2">
            <ProgressBar variant="success" now={
              (state.orders.filter(o => o.status === 'delivered').length / state.orders.length) * 100
            } />
            <ProgressBar variant="warning" now={
              (state.orders.filter(o => o.status === 'preparing').length / state.orders.length) * 100
            } />
          </ProgressBar>
        </div>
      </Offcanvas.Body>
    </Offcanvas>


          {/* Riders Sidebar */}
      <Offcanvas show={state.showBikers} onHide={() => setState(s => ({ ...s, showBikers: false }))} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Available Riders</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <ListGroup>
          {state.riders.map(rider => (
            <ListGroup.Item key={rider.id}>
              <div className="d-flex justify-content-between">
                <div>
                  <h6>{rider.name}</h6>
                  <small>{rider.vehicle} ({rider.plate})</small>
                </div>
                <Button size="sm" variant="outline-primary">
                  Assign Order
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Offcanvas.Body>
    </Offcanvas>
  </div>
) : (
         // User Marketplace
         <div className="py-4 container-xl">
         {/* Stories Section */}
         <div className="mb-5">
  <h5 className="mb-3 fw-bold text-secondary">Jikoni Culture Stories!!</h5>
  <div className="stories-container">
    <div className="stories-scroll">
      {filteredFoods.map(food => (
        <div 
          key={food.id}
          className="story-item"
          onClick={() => navigate(`/chef/${food.chefId}`)}
        >
          <div className="story-image-wrapper">
            <img
              src={food.photoUrls?.[0] || '/placeholder-food.jpg'}
              alt={food.title}
              className="story-img"
            />
            <div className="gradient-overlay"></div>
            <Badge pill className="location-badge">
              {food.area}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  </div>

  <style jsx>{`
    .stories-container {
      position: relative;
      padding: 0 1rem;
    }

    .stories-scroll {
      display: flex;
      overflow-x: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--grenish-color) transparent;
      gap: 1rem;
      padding-bottom: 1rem;
      -webkit-overflow-scrolling: touch;
    }

    .stories-scroll::-webkit-scrollbar {
      height: 6px;
    }

    .stories-scroll::-webkit-scrollbar-thumb {
      background: var(--grenish-color);
      border-radius: 4px;
    }

    .story-item {
      flex: 0 0 auto;
      position: relative;
      width: 100px;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .story-item:hover {
      transform: translateY(-3px);
    }

    .story-image-wrapper {
      position: relative;
      width: 100px;
      height: 100px;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      border: 2px solid transparent;
      transition: border-color 0.2s ease;
    }

    .story-item:hover .story-image-wrapper {
      border-color: var(--grenish-color);
    }

    .story-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .gradient-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 40%;
      background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%);
    }

    .location-badge {
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--grenish-color) !important;
      color: var(--black-color) !important;
      font-weight: 600;
      font-size: 0.7rem;
      padding: 4px 8px;
      border: 1px solid rgba(255,255,255,0.2);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    @media (max-width: 768px) {
      .story-item {
        width: 85px;
      }
      
      .story-image-wrapper {
        width: 85px;
        height: 85px;
      }
    }
  `}</style>
</div>


         {/* Food Grid */}
         <div className="food-platform" style={{ backgroundColor: colors.light }}>


      <Row xs={1} sm={2} md={3} lg={4} className="g-4 p-4">
        {state.foods.map(food => (
          <Col key={food.id}>
            <Card className="h-100 shadow-lg border-0 overflow-hidden food-card">
              {/* Image Section */}
              <div className="position-relative">
                <Carousel interval={null} indicators={food.photoUrls.length > 1}>
                  {food.photoUrls.map((img, i) => (
                    <Carousel.Item key={i}>
                      <div className="ratio ratio-4x3">
                        <img
                          src={img}
                          alt={`${food.title} - Photo ${i+1}`}
                          className="card-img-top object-fit-cover"
                          style={{ filter: 'brightness(0.95)' }}
                        />
                      </div>
                    </Carousel.Item>
                  ))}
                </Carousel>
                
                {/* Floating Price Tag */}
                <div className="position-absolute top-0 end-0 m-3">
                  <Badge pill className="price-tag">
                    KES {food.price}
                  </Badge>
                </div>
              </div>

              {/* Card Body */}
              <Card.Body className="d-flex flex-column pt-4">
                {/* Food Metadata */}
                <div className="mb-3">
                  <Badge pill className="meal-type me-2">
                    {food.mealType}
                  </Badge>
                  <small className="text-muted">
                    <Clock className="me-1" />
                    {formatDistanceToNow(new Date(food.createdAt))} ago
                  </small>
                </div>

                {/* Food Title */}
                <h3 className="mb-3 fw-bold food-title">{food.title}</h3>

                {/* Food Description */}
                <p className="text-secondary mb-4 flex-grow-1">{food.description}</p>

                {/* Dietary Tags */}
                <div className="d-flex flex-wrap gap-2 mb-4">
                  <Badge pill className="dietary-tag speciality">
                    {food.speciality}
                  </Badge>
                  <Badge pill className="dietary-tag cuisine">
                    {food.cuisineType}
                  </Badge>
                  <Badge pill className="dietary-tag dietary">
                    {food.dietary}
                  </Badge>
                </div>

                {/* Chef Profile */}
                <div className="chef-profile bg-white p-3 rounded-3">
                  <div className="d-flex align-items-center mb-3">
                    <img
                      src={food.chef.avatar || '/images/chef.png'}
                      alt={food.chef.user.Name}
                      className="chef-avatar me-3"
                    />
                    <div>
                      <h6 className="mb-0 fw-bold">{food.chef.user.Name}</h6>
                      <div className="d-flex align-items-center">
                        <StarFill className="text-warning me-1" />
                        <span className="small">{food.chef.rating}</span>
                        <span className="mx-2">•</span>
                        <span className="small">{food.chef.experienceYears} yrs</span>
                      </div>
                    </div>
                  </div>

                  {/* Certifications */}
                  {food.chef.certifications.length > 0 && (
                    <div className="certifications">
                      <span className="text-muted small d-block mb-2">Certifications:</span>
                      <div className="d-flex flex-wrap gap-2">
                        {food.chef.certifications.map((cert, i) => (
                          <Badge key={i} pill className="cert-badge">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Add to Cart Button */}
                <Button 
                  variant="primary" 
                  className="add-to-cart-btn mt-4"
                  onClick={() => updateCart(food, 1)}
                >
                  <CartPlus className="me-2" />
                  Add to Cart
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Global Styles */}
      <style jsx global>{`
        :root {
          --primary-color: ${colors.primary};
          --secondary-color: ${colors.secondary};
          --accent-color: ${colors.accent};
          --dark-color: ${colors.dark};
          --light-color: ${colors.light};
        }

        .food-card {
          border-radius: 1.5rem;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          background: var(--light-color);
        }

        .food-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
        }

        .price-tag {
          background: var(--accent-color);
          color: white;
          font-size: 1.1rem;
          padding: 0.5rem 1.25rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .meal-type {
          background: var(--secondary-color);
          color: var(--dark-color);
          font-weight: 600;
          padding: 0.5rem 1rem;
        }

        .food-title {
          color: var(--dark-color);
          font-size: 1.5rem;
          line-height: 1.3;
        }

        .dietary-tag {
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
          font-weight: 500;
          
          &.speciality {
            background: var(--primary-color);
            color: var(--dark-color);
          }
          
          &.cuisine {
            background: var(--secondary-color);
            color: var(--dark-color);
          }
          
          &.dietary {
            background: var(--accent-color);
            color: white;
          }
        }

        .chef-profile {
          border: 2px solid var(--secondary-color);
          background: rgba(255, 255, 255, 0.9);
        }

        .chef-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 2px solid var(--primary-color);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .cert-badge {
          background: var(--primary-color);
          color: var(--dark-color);
          font-weight: 500;
          padding: 0.5rem 1rem;
        }

        .add-to-cart-btn {
          background: var(--accent-color);
          border: none;
          padding: 1rem;
          font-weight: 600;
          border-radius: 1rem;
          transition: all 0.3s ease;
          
          &:hover {
            background: var(--dark-color);
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
    
       </div>
     )}


      {/* Registration Modals */}
      <ChefRegistrationModal 
        show={state.showChefReg}
        onClose={() => setState(s => ({ ...s, showChefReg: false }))}
        onSubmit={registerChef}
      />

      <RiderRegistrationModal
        show={state.showRiderReg}
        onClose={() => setState(s => ({ ...s, showRiderReg: false }))}
        onSubmit={registerRider}
      />

      {/* Cart Sidebar */}
      <CartSidebar
        show={state.showCart}
        onClose={() => setState(s => ({ ...s, showCart: false }))}
        cart={state.cart}
      />
    </Container>
  );
};



// Registration Components
const ChefRegistration = ({ show, onClose, onSubmit }) => (
  <Modal show={show} onHide={onClose} centered>
    <Modal.Header closeButton>
      <Modal.Title>Chef Registration</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form
        onSubmit={e => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData.entries());

          // convert stringified values to appropriate types
          data.certifications = formData.get("certifications")?.split(",").map(s => s.trim());
          data.experienceYears = parseInt(data.experienceYears);
          data.latitude = parseFloat(data.latitude);
          data.longitude = parseFloat(data.longitude);

          onSubmit(data);
        }}
      >
        <Form.Group className="mb-3">
          <Form.Label>Bio</Form.Label>
          <Form.Control name="bio" as="textarea" rows={2} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Specialty</Form.Label>
          <Form.Select name="speciality" required>
            <option>African Cuisine</option>
            <option>Continental</option>
            <option>Fusion</option>
            <option>Pastry & Baking</option>
            <option>Vegetarian</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Years of Experience</Form.Label>
          <Form.Control name="experienceYears" type="number" min="0" required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Profile Picture</Form.Label>
          <Form.Control name="profilePicture" type="text"  required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Certifications</Form.Label>
          <Form.Control
            name="certifications"
            type="text"
            placeholder="e.g. HACCP, Culinary School"
          />
          <Form.Text className="text-muted">Separate multiple certifications with commas</Form.Text>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Location</Form.Label>
          <Form.Control name="location" type="text" placeholder="Exact address or neighborhood" required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>City</Form.Label>
          <Form.Control name="city" type="text" defaultValue="Nairobi" required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Latitude</Form.Label>
          <Form.Control name="latitude" type="number" step="any" placeholder="-1.2921" />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Longitude</Form.Label>
          <Form.Control name="longitude" type="number" step="any" placeholder="36.8219" />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check
            name="terms"
            type="checkbox"
            label="I agree to the Terms and Conditions"
            required
          />
        </Form.Group>

        <Button type="submit" variant="primary" block>
          Register
        </Button>
      </Form>
    </Modal.Body>
  </Modal>
);

const RiderRegistration = ({ show, onClose, onSubmit }) => (
  <Modal show={show} onHide={onClose} centered>
    <Modal.Header closeButton>
      <Modal.Title>Rider Registration</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form
        onSubmit={e => {
          e.preventDefault();
          onSubmit(Object.fromEntries(new FormData(e.target)));
        }}
      >
        <Form.Group className="mb-3">
          <Form.Label>National ID</Form.Label>
          <Form.Control name="nationalId" type="text" required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>City</Form.Label>
          <Form.Control name="city" type="text" required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Area</Form.Label>
          <Form.Control name="area" type="text" required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Neighborhood</Form.Label>
          <Form.Control name="neighborhood" type="text" required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Vehicle Type</Form.Label>
          <Form.Select name="vehicle" required>
            <option>Bicycle</option>
            <option>Motorcycle</option>
            <option>Car</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Registration Number Plate</Form.Label>
          <Form.Control name="registrationPlate" type="text" required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Preferred Work Hours</Form.Label>
          <Form.Control name="workHours" type="text" placeholder="e.g. 9am - 5pm" required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Service Area</Form.Label>
          <Form.Control name="serviceArea" type="text" required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check
            name="terms"
            type="checkbox"
            label="I agree to the Terms and Conditions"
            required
          />
        </Form.Group>

        <Button type="submit" variant="primary" block>
          Register
        </Button>
      </Form>
    </Modal.Body>
  </Modal>
);

const CartSidebar = ({ show, cart, updateCart, onClose, userId, loadingOrders = false, orders = [] }) => (


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

export default FoodPlatform;