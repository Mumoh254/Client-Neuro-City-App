import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Button, Spinner, Alert, Badge,
  Modal, Form, Offcanvas, ListGroup, Tabs, Tab , ButtonGroup, Carousel, ProgressBar
} from 'react-bootstrap';
import {
  GeoAlt, Clock, Star, StarHalf   ,Cart, Person, Scooter,
  CheckCircle, EggFried, FilterLeft, Plus, CartPlus , Dash, Trash, Pencil, Bell
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

           <header className="d-flex flex-wrap justify-content-between align-items-center py-3">
        <h1 className="mb-0" style={{ color: theme.primary }}>
          <GiKenya className="me-2 m-3" />
          Jikoni Express Culture!
        </h1>

        <div className="d-flex flex-wrap gap-2 align-items-center">
          {!state.isChefMode && !state.isRiderMode && (
            <>
              <Button variant="primary" size="sm"
                onClick={() => setState(s => ({ ...s, showChefReg: true }))}>
                <Person className="me-1" /> Chef
              </Button>
              <Button variant="primary" size="sm"
                onClick={() => setState(s => ({ ...s, showRiderReg: true }))}>
                <Scooter className="me-1" /> Rider
              </Button>
            </>
          )}

          {state.isChefMode && (
            <Button variant="danger" size="sm"
              onClick={() => {
                localStorage.removeItem('chefId');
                localStorage.setItem('isChef', 'true');
                setState(s => ({ ...s, isChefMode: false }));
              }}>
              Exit Chef Mode
            </Button>
          )}

          <Button variant="primary" size="sm"
            onClick={() => setState(s => ({ ...s, showCart: true }))}>
            <Cart className="me-1" />
            Cart ({state.cart.reduce((sum, i) => sum + i.quantity, 0)})
          </Button>
        </div>
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
           <h5 className="mb-3 fw-bold text-secondary"> Jikoni  Culture  Stories !!</h5>
           <StoriesContainer>
             <Row className="flex-nowrap overflow-auto pb-3 gx-3">
               {filteredFoods.map(food => (
                 <Col xs="auto" key={food.id}>
                   <div 
                     className="story-item position-relative rounded-4 overflow-hidden cursor-pointer"
                     onClick={() => navigate(`/chef/${food.chefId}`)} // Navigate on click
                   >
                     <img 
                       src={food.photoUrls?.[0] || '/placeholder-food.jpg'} 
                       alt={food.title}
                       className="story-image rounded-4"
                       style={{ 
                         width: '90px', 
                         height: '80px',
                         objectFit: 'cover',
                         border: '0px solid #fff',
                         boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                       }}
                     />
                     <div className="position-absolute bottom-0 start-0 end-0 p-2 gradient-overlay">
                       <Badge pill  className="text-dark fw-medium px-2 bg-info text-white">
                         {food.area}
                       </Badge>
                     </div>
                   </div>
                 </Col>
               ))}
             </Row>
           </StoriesContainer>
         </div>
       
         {/* Food Grid */}
         <Row xs={1} sm={2} md={3} lg={4} className="g-4">
           {state.foods.map(food => (
             <Col key={food.id}>
               <ResponsiveCard className="h-100 shadow-sm hover-shadow-lg transition-all">
                 <Carousel interval={null} indicators={food.photoUrls.length > 1}>
                   {food.photoUrls.map((img, i) => (
                     <Carousel.Item key={i}>
                       <div className="ratio ratio-4x3">
                         <img 
                           src={img} 
                           alt={`${food.title} - Photo ${i+1}`}
                           className="card-img-top object-fit-cover"
                           onError={(e) => e.target.src = '/placeholder-food.jpg'}
                         />
                       </div>
                     </Carousel.Item>
                   ))}
                 </Carousel>
       
                 <Card.Body className="d-flex flex-column">
                   <div className="d-flex justify-content-between align-items-start mb-2">
                     <div>
                       <h5 className="fw-bold mb-0">{food.title}</h5>
                       <small className="text-muted">{food.mealType}</small>
                     </div>
                     <Badge pill bg="success" className="fs-6">KES {food.price}</Badge>
                   </div>
       
                   <p className="small text-secondary mb-3 flex-grow-1">{food.description}</p>
       
                   <div className="d-flex gap-2 flex-wrap mb-3">
                     <Badge pill bg="primary">{food.speciality}</Badge>
                     <Badge pill bg="warning" text="dark">{food.cuisineType}</Badge>
                     <Badge pill bg="info">{food.dietary}</Badge>
                   </div>
       
                   {/* Chef Profile */}
                   <div className="d-flex align-items-center gap-3 border-top pt-3">
                     <img
                       src={food.chef.avatar || '/images/chef.png'}
                       alt={food.chef.user.Name}
                       className="rounded-circle border"
                       style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                     />
                     <div>
                       <div className="fw-bold small">{food.chef.user.Name}</div>
                       <div className="text-muted small">
                         <StarHalf className="text-warning" /> {food.chef.rating} ({food.chef.experienceYears} yrs)
                       </div>
                     </div>
                   </div>
       
                   {/* Certifications */}
                   {food.chef.certifications.length > 0 && (
                     <div className="mt-3">
                       <small className="d-block text-muted mb-1">Certifications:</small>
                       <div className="d-flex gap-2 flex-wrap">
                         {food.chef.certifications.map((cert, i) => (
                           <Badge key={i} pill bg="light" text="dark" className="small border">
                             {cert}
                           </Badge>
                         ))}
                       </div>
                     </div>
                   )}
       
                   {/* Social Links */}
                   <div className="mt-3 d-flex gap-2">
                     {Object.entries(food.chef.socialLinks).map(([platform, url]) => (
                       url && (
                         <a
                           key={platform}
                           href={url}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="text-decoration-none"
                         >
                           <Button variant="outline-dark" size="sm" className="rounded-pill px-3">
                             <i className={`bi bi-${platform.toLowerCase()} me-1`} />
                             {platform}
                           </Button>
                         </a>
                       )
                     ))}
                   </div>
       
                   {/* Add to Cart */}
                   <Button
                     variant="primary"
                     className="mt-3 w-100 rounded-pill fw-bold py-2"
                     onClick={() => updateCart(food, 1)}
                   >
                     <CartPlus className="me-2" /> Add to Cart
                   </Button>
                 </Card.Body>
               </ResponsiveCard>
             </Col>
           ))}
         </Row>
       
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