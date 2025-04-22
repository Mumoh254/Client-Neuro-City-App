// AdminFeedback.js (Protected Component)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD; // Set in .env

  useEffect(() => {
    if (!authenticated) return;

    const fetchFeedback = async () => {
      try {
        const response = await fetch("https://sheetdb.io/api/v1/1vzkihvzanc8w");
        const data = await response.json();
        setFeedback(data);
      } catch (error) {
        console.error("Error fetching feedback:", error);
      }
    };

    fetchFeedback();
  }, [authenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
    } else {
      alert("❌ Incorrect password");
      setPassword('');
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setPassword('');
    navigate('/');
  };

  if (!authenticated) {
    return (
      <div className="container py-5">
        <div className="card shadow-lg border-0" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="card-header bg-danger text-white">
            <h2 className="text-center mb-0">Admin Login</h2>
          </div>
          
          <div className="card-body p-4">
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
              <button type="submit" className="btn btn-danger w-100">
                Access Dashboard
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Feedback Dashboard</h1>
        <button onClick={handleLogout} className="btn btn-danger">
          Logout
        </button>
      </div>

      <div className="card shadow-lg border-0">
        <div className="card-body p-4">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Feedback</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {feedback.map((entry, index) => (
                  <tr key={index}>
                    <td>{new Date(entry.timestamp).toLocaleString()}</td>
                    <td>{entry.review}</td>
                    <td>
                      {Array.from({ length: entry.rating }, (_, i) => (
                        <span key={i} className="text-warning">★</span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedback;