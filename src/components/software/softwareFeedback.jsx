import React, { useState  , useEffect} from 'react';
import { Link } from 'react-router-dom';
import  { getUserNameFromToken}  from '../handler/tokenDecoder'
const SoftwareFeedback = () => {
  const [form, setForm] = useState({ review: '', rating: '' });
    const [username, setUsername] = useState('');
      useEffect(() => {
        const userData = getUserNameFromToken();
        if (userData) {
          console.log(userData);
          setUsername(userData.name);
        }
      }, []);
    
  // Color Scheme
  const colors = {
    primary: '#8b5cf6',
    primaryDark: '#7c3aed',
    secondary: '#3b82f6',
    secondaryDark: '#2563eb',
    accent: '#ef4444',
    accentDark: '#dc2626',
    success: '#10b981',
    successDark: '#059669'
  };

  const softwareInfo = {
    name: 'The Neuro-City-App',
    developer: 'Peter Mumo Itumo - CEO & Founder, Welt Tallis Group',
    extra: 'Email: infowelttallis@gmail.com | Call: 0104148448 , Whats-App: 0740045355',
    support: "24/7 Support Team Available",
    review: "Peter Noel",
    systemID: 'WELT-TALLIS-NEURO-NBO-PROD-v1.0.0.0',
    companyname: "Welt Tallis",
    version: 'v1.0.0.0',
    lastUpdate: 'April 22, 2025 | 12.00 pm ',
    techStack: 'HTML, CSS, JavaScript, React 19, Node.js, MongoDB, PostgreSQL, PWA-Suport , Index-DB , Express-Js  , Node-Mailer, Sheets-Db',  
    description:
      'Neuro City App is a comprehensive civic tech platform enhancing urban living through real-time services, community engagement, and smart city solutions for Nairobi residents.'
  };

  const features = [
    {
      title: '📰 News Favorites',
      description: 'Save and organize your favorite local news articles from trusted sources.',
      link: '/e-city-news-feed'
    },
    {
      title: '💬 Nairobi E-Chat',
      description: 'Real-time community chat for neighborhood discussions and announcements.',
      link: '/e-chats'
    },
    {
      title: '💼 Jobs Services',
      description: 'Find and apply for local jobs across various industries in Nairobi.',
      link: '/get-jobs-lis'
    },
    {
      title: '🌤️ Weather Analytics',
      description: 'Detailed weather forecasts with precipitation maps and storm alerts.',
      link: '/weather'
    },
    {
      title: '📈 Report Coruption Cases & Real-time Analytics',
      description: 'Interactive dashboards tracking corruption reports and most  corrupt  facilities  in realtime .',
      link: '/report/coruption-Real-time/analytics'
    },
    {
      title: '🛡️ Nairobi  Recidents  Favourites',
      description: 'Acess  to what  nairobians  love and  hidden  gems.',
      link: '/peoples/favourites'
    },
    {
      title: '🛡️ Plastics  Recycles',
      description: 'Recycle  your  plastic  wastes  and  help  build  a  clean  city .',
      link: '/plastics-recycles'
    }

    
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      date: new Date().toISOString()
    };

    try {
      await fetch("https://sheetdb.io/api/v1/1vzkihvzanc8w", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: payload })
      });
      alert("✅ Review submitted successfully!");
      setForm({ review: '', rating: '' });
    } catch (err) {
      alert("❌ Failed to submit review.");
      console.error(err);
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh',
      padding: '1rem 0'
    }}>
      <div className="container">
        <div style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
            padding: '1rem',
            color: 'white',
            textAlign: 'center',
            fontSize: '0.9rem'
          }}>
            <h1 style={{
              fontSize: '1rem',
              margin: 0,
              fontWeight: '500',
              letterSpacing: '-0.025em'
            }}>
             <i className="fas fa-comments" style={{ marginRight: '0.5rem' }}></i>
             Hellow <span>{username}</span> Share  your  feed back  tell us  how  we  can  improve the app for you
            </h1>
          </div>

          {/* Main Content */}
          <div style={{ padding: '0rem' }}>
            {/* Feedback Form */}
            <section style={{ marginBottom: '3rem' }}>
              <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '0rem'
              }}>
                <h2 style={{
                  color: colors.primary,
                  fontSize: '1.25rem',
                  marginBottom: '1.5rem',
                  fontWeight: '400'
                }}>
                
                </h2>
                
                <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: '500',
                      color: colors.primary
                    }}>
                      Your Review
                    </label>
                    <textarea
                      value={form.review}
                      onChange={(e) => setForm({ ...form, review: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: `2px solid ${colors.primary}30`,
                        minHeight: '120px',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: '500',
                      color: colors.primary
                    }}>
                      Rating (1-5)
                    </label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div style={{
                        backgroundColor: colors.primary,
                        color: 'white',
                        padding: '0.75rem',
                        borderRadius: '8px'
                      }}>
                        <i className="fas fa-star"></i>
                      </div>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={form.rating}
                        onChange={(e) => setForm({ ...form, rating: e.target.value })}
                        required
                        style={{
                          width: '100px',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: `2px solid ${colors.primary}30`
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{
                      backgroundColor: colors.primary,
                      color: 'white',
                      padding: '1rem 2rem',
                      borderRadius: '8px',
                      border: 'none',
                      width: '100%',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s ease'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = colors.primaryDark}
                    onMouseOut={(e) => e.target.style.backgroundColor = colors.primary}
                  >
                    <i className="fas fa-paper-plane" style={{ marginRight: '0.5rem' }}></i>
                    Submit Feedback
                  </button>
                </form>
              </div>
            </section>

            {/* Platform Details */}
            <section style={{ marginBottom: '3rem' }}>
              <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                padding: '1rem'
              }}>
                <h2 style={{
                  color: colors.secondary,
                  fontSize: '1rem',
                  marginBottom: '1.5rem',
                  fontWeight: '400',
                  textAlign: 'start'
                }}>
                  <i className="fas fa-info-circle" style={{ marginRight: '0.5rem' }}></i>
                  Platform Details
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {/* Technical Specs */}
                  <div style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '10px',
                    borderLeft: `4px solid ${colors.primary}`
                  }}>
                    <h3 style={{
                      color: colors.primary,
                      fontSize: '1rem',
                      marginBottom: '1rem',
                      fontWeight: '400'
                    }}>
                      <i className="fas fa-microchip" style={{ marginRight: '0.5rem' }}></i>
                      Technical Specifications
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      <li style={{ marginBottom: '1rem' }}>
                        <strong>System ID:</strong> 
                        <span style={{
                          backgroundColor: `${colors.primary}20`,
                          color: colors.primary,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          marginLeft: '0.5rem'
                        }}>
                          {softwareInfo.systemID}
                        </span>
                      </li>
                      <li style={{ marginBottom: '1rem' }}>
                        <strong>Version:</strong> 
                        <span style={{
                          backgroundColor: `${colors.secondary}20`,
                          color: colors.secondary,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          marginLeft: '0.5rem'
                        }}>
                          {softwareInfo.version}
                        </span>
                      </li>
                      <li>
                        <strong>Tech Stack:</strong>
                        <div style={{ 
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                          marginTop: '0.5rem'
                        }}>
                          {softwareInfo.techStack.split(', ').map((tech, i) => (
                            <span key={i} style={{
                              backgroundColor: '#e2e8f0',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.875rem'
                            }}>
                              {tech.trim()}
                            </span>
                          ))}
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Development Team */}
                  <div style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '10px',
                    borderLeft: `4px solid ${colors.secondary}`
                  }}>
                    <h3 style={{
                      color: colors.secondary,
                      fontSize: '1rem',
                      marginBottom: '1rem',
                      fontWeight: '400'
                    }}>
                      <i className="fas fa-users" style={{ marginRight: '0.5rem' }}></i>
                      Development Team
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      <li style={{ marginBottom: '1rem' }}>
                        <div style={{ fontWeight: '500' }}>Lead Developer:</div>
                        <div>{softwareInfo.developer}</div>
                      </li>
                      <li style={{ marginBottom: '1rem' }}>
                        <div style={{ fontWeight: '500' }}>Last Updated:</div>
                        <div>{softwareInfo.lastUpdate}</div>
                      </li>

                      <li style={{ marginBottom: '1rem' }}>
                        <div style={{ fontWeight: '500' }}>Review Team:</div>
                        <div>{softwareInfo.review}</div>
                      </li>

                      <li>
                        <div style={{ fontWeight: '500' }}>Contact:</div>
                        <div>{softwareInfo.extra}</div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section>
              <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                padding: '1rem'
              }}>
                <h2 style={{
                  color: colors.success,
                  fontSize: '1rem',
                  marginBottom: '1.5rem',
                  fontWeight: '400',
                  textAlign: 'center'
                }}>
                  <i className="fas fa-rocket" style={{ marginRight: '0.5rem' }}></i>
                  Key Features & Services
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {features.map((feature, index) => (
                    <div key={index} style={{
                      backgroundColor: 'white',
                      padding: '1rem',
                      borderRadius: '10px',
                      borderLeft: `4px solid ${index % 2 === 0 ? colors.primary : colors.secondary}`,
                      transition: 'transform 0.3s ease',
                      cursor: 'pointer',
                      ':hover': {
                        transform: 'translateY(-5px)'
                      }
                    }}>
                      <h3 style={{
                        color: index % 2 === 0 ? colors.primary : colors.secondary,
                        fontSize: '1rem',
                        marginBottom: '0.75rem',
                        fontWeight: '400'
                      }}>
                        {feature.title}
                      </h3>
                      <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
                        {feature.description}
                      </p>
                      <Link 
                        to={feature.link}
                        style={{
                          color: index % 2 === 0 ? colors.primary : colors.secondary,
                          fontWeight: '600',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'color 0.3s ease'
                        }}
                      >
                        Explore Feature
                        <i className="fas fa-arrow-right" style={{ marginLeft: '0.5rem' }}></i>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoftwareFeedback;