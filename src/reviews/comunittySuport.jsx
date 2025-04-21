import React, { useEffect } from "react";

import { useNavigate  } from "react-router-dom";
import { Button, Card } from "react-bootstrap";
import { 
  FaComments, 
  FaBriefcase, 
  FaPlusCircle, 
  FaTools, 
  FaUserCircle,
  FaArrowRight
} from "react-icons/fa";
import { getUserNameFromToken} from "../handler/tokenDecoder";
import { useState } from "react";
const CommunityHub = () => {
  const navigate = useNavigate();



  const [username, setUsername] = useState('');

  
    useEffect(() => {
      const userData = getUserNameFromToken();
      if (userData) {
        console.log(userData);
    
        setUsername(userData.name);

      }
    }, []);
 
  const hubCards = [
    { 
      title: "Reviews & Discussions",
      icon: <FaComments className="fs-2" />,
      action: () => navigate("/e-chats"),
      color: "primary"
    },
    { 
      title: "Job Listings",
      icon: <FaBriefcase className="fs-2" />,
      action: () => navigate("/jobs-list"),
      color: "success"
    },
    { 
      title: "Post New Job",
      icon: <FaPlusCircle className="fs-2" />,
      action: () => navigate("/create-jobs"),
      color: "danger"
    },
    { 
      title: "Services Directory",
      icon: <FaTools className="fs-2" />,
      action: () => navigate("/services/list-view"),
      color: "info"
    },
    { 
      title: "Offer Service",
      icon: <FaPlusCircle className="fs-2" />,
      action: () => navigate("/services/create"),
      color: "warning"
    }
  ];

  return (
    <Card className="shadow-lg border-0 rounded-3 my-5">
      <Card.Body className="p-5">
        <div className="text-center mb-5">
          <FaUserCircle className="text-secondary mb-3" size="3rem" />
          <h1 className="display-5 fw-bold text-dark mb-2">
            Welcome back, {username}!
          </h1>
          <p className="lead text-muted">
            Nairobi's Community Hub - Connect, Collaborate, Grow
          </p>
        </div>

        <div className="row g-4">
          {hubCards.map((card, index) => (
            <div key={index} className="col-12 col-md-6 col-lg-4">
              <Button
                variant={card.color}
                onClick={card.action}
                className="d-flex align-items-center justify-content-between p-4 w-100 h-100 text-start shadow-sm"
                style={{ borderRadius: "15px" }}
              >
                <div>
                  <div className="mb-3 text-white">{card.icon}</div>
                  <h3 className="h5 text-white mb-0">{card.title}</h3>
                </div>
                <FaArrowRight className="text-white ms-3" />
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-5">
          <p className="text-muted mb-0">
            Need help? Contact our community support
          </p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CommunityHub;