import React, { useState } from 'react';
import { Link } from 'react-router-dom';
const SoftwareFeedback = () => {
  const [form, setForm] = useState({ review: '', rating: '' });

  const softwareInfo = {
    name: 'The Neuro-City-App',
    developer: 'Peter Mumo Itumo - CEO & Founder, Welt Tallis Group',
    extra: 'Email: infowelttallis@gmail.com | Call: +25470045355',
    support: " Null",
    review:  "Ester  ,  John  ,  Veronica",
    systemID: 'WELT-TALLIS-NEURO-NBO-PROD-v1.0.0.0',
    version: 'v1.0.0.0',
    lastUpdate: 'April 12, 2025',
    techStack: 'HTML  ,  CSS    ,  JAVASCRIPT , React 19, Bootstrap-5,  OpenWeather API, TomTom, Leaflet Maps, Node.js, Google-Analytics, Prisma ORM, PostgreSQL on Neon DB, MONGO-DB , CLOUDINARY , SheetDB, GEO-Location , WEB SOCKETS ,  PWA-SUPPORT',
    description:
      'Neuro City App is a civic tech platform created to improve how citizens of Nairobi interact with their city. The system empowers people to report corruption, access vital services, get real-time traffic and weather updates, discover safe places to stay or visit, and help shape how the city runs. It’s a one-stop solution for urban engagement, governance transparency, and smart city evolution.'
  };

  const features = [
    {
      title: '🛡️ Report & Track Corruption',
      description: 'Expose and follow up on corruption cases happening in Nairobi using geo-tagged evidence.',
      link: '/report-corruption'
    },
    {
      title: '🗑️ Garbage Collection Points',
      description: 'Locate and report garbage hotspots, and track the county’s response time.',
      link: '/garbage'
    },
    {
      title: '🔁 Plastic Recycling Stations',
      description: 'Find eco-friendly plastic disposal and recycling points near you.',
      link: '/plastic-recycle'
    },
    {
      title: '📍 Places to Visit (With Prices)',
      description: 'Discover tourist attractions, cultural spots, and fun destinations across Nairobi.',
      link: '/features/visit-places'
    },
    {
      title: '🛌 Best Places to Stay',
      description: 'Explore trusted accommodation options in Nairobi with verified user ratings.',
      link: '/features/places-to-stay'
    },
    {
      title: '🎲 Betting Zones & Centers',
      description: 'Get details on safe and regulated betting centers in Nairobi.',
      link: '/features/betting-places'
    },
    {
      title: '📊 Citizen Comments on City Government',
      description: 'Read and share insights on how Nairobi County is performing in service delivery.',
      link: '/citizen-reviews'
    },
    {
      title: '🚨 Most Corrupt Facilities (Watchlist)',
      description: 'Check a live database of the most corrupt offices and facilities reported by users.',
      link: '/report-corruption'
    },
    {
      title: '🚦 Nairobi Traffic & Roads Access',
      description: 'Access real-time traffic routes, blocked roads, and best driving paths via Leaflet & TomTom.',
      link: '/traffic'
    },
    {
      title: '🌦️ Real-Time Weather Updates',
      description: 'Stay informed with hyper-local weather data using OpenWeather API.',
      link: '/weather'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...softwareInfo,
      ...form
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
      <div className="container py-5">
        <div className="card shadow-lg border-0">
          <div className="card-header bg-gradient-primary text-white py-4">
            <h1 className="display-4 text-center mb-0">
              <i className="fas fa-brain me-2"></i>
              Neuro City App Feedback Portal
            </h1>
          </div>
  
          <div className="card-body p-4 p-lg-5">
            {/* Review Form */}
            <section className="mb-5">
              <h2 className="h3 mb-4 text-primary">
                <i className="fas fa-comment-dots me-2"></i>
                Share Your Experience
              </h2>
              
              <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                <div className="mb-4">
                  <label htmlFor="review" className="form-label fw-bold">Your Review</label>
                  <textarea
                    id="review"
                    value={form.review}
                    onChange={(e) => setForm({ ...form, review: e.target.value })}
                    placeholder="Share your thoughts about the app..."
                    required
                    className="form-control form-control-lg"
                    rows="4"
                    style={{ minHeight: '120px' }}
                  />
                  <div className="invalid-feedback">Please share your review</div>
                </div>
  
                <div className="mb-4">
                  <label htmlFor="rating" className="form-label fw-bold">Rating</label>
                  <div className="input-group">
                    <span className="input-group-text bg-primary text-white">
                      <i className="fas fa-star"></i>
                    </span>
                    <input
                      type="number"
                      id="rating"
                      min="1"
                      max="5"
                      value={form.rating}
                      onChange={(e) => setForm({ ...form, rating: e.target.value })}
                      placeholder="Rate from 1 to 5 stars"
                      required
                      className="form-control form-control-lg"
                      style={{ maxWidth: '150px' }}
                    />
                  </div>
                </div>
  
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 py-3 fw-bold"
                >
                  <i className="fas fa-paper-plane me-2"></i>
                  Submit Review
                </button>
              </form>
            </section>
  
            {/* Software Details */}
            <section className="mb-5">
              <h3 className="h4 mb-4 text-success">
                <i className="fas fa-info-circle me-2"></i>
                Application Details
              </h3>
              
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="card h-100 border-success">
                    <div className="card-body">
                      <h5 className="card-title text-success mb-3">
                        <i className="fas fa-microchip me-2"></i>
                        Technical Specifications
                      </h5>
                      <ul className="list-unstyled">
                        <li className="mb-2  ">
                          <strong className="text-dark">System ID:</strong> 
                          <span className="badge bg-success ms-2  p-2">{softwareInfo.systemID}</span>
                        </li>
                        <li className="mb-2">
                          <strong className="text-dark">Version:</strong> 
                          <span className="badge bg-info ms-2 p-2">{softwareInfo.version}</span>
                        </li>
                        <li className="mb-2">
                          <strong className="text-dark">Tech Stack:</strong>
                          <div className="d-flex flex-wrap gap-2 mt-2">
                            {softwareInfo.techStack.split(', ').map((tech, i) => (
                              <span key={i} className="badge bg-dark p-2">{tech.trim()}</span>
                            ))}
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
  
                <div className="col-md-6">
                  <div className="card h-100 border-primary">
                    <div className="card-body">
                      <h5 className="card-title text-primary mb-3">
                        <i className="fas fa-user-tie me-2"></i>
                        Development Team
                      </h5>
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <strong>Developer:</strong> {softwareInfo.developer}
                        </li>
                        <li className="mb-2">
                          <strong>Last Updated:</strong> 
                          <span className="text-muted ms-2">{softwareInfo.lastUpdate}</span>
                        </li>
                      </ul>


                    </div>


                    <div className="card-body">
                      <h5 className="card-title text-primary mb-3">
                        <i className="fas fa-user-tie me-2"></i>
                        Support team |  Review  Team
                      </h5>
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <strong>Review Team:</strong> {softwareInfo.review}
                          <br />
                          <strong>Suport  Team:</strong> {softwareInfo.support}
                        </li>
                        <li className="mb-2">
                          <strong>Etra  Info:</strong> 
                          <span className="text-muted ms-2">{softwareInfo.extra}</span>
                        </li>
                      </ul>

                      
                    </div>

                  </div>
                </div>
              </div>
            </section>
  
            {/* Features Section */}
            <section>
              <h3 className="h4 mb-4 text-purple">
                <i className="fas fa-rocket me-2"></i>
                Key Features
              </h3>
              
              <div className="row row-cols-1 row-cols-md-2 g-4">
                {features.map((feature, index) => (
                  <div key={index} className="col">
                    <div className="card h-100 feature-card hover-shadow">
                      <div className="card-body">
                        <h5 className="card-title">
                          <span className="feature-icon">{feature.title.split(' ')[0]}</span>
                          {feature.title.slice(feature.title.indexOf(' ') + 1)}
                        </h5>
                        <p className="card-text text-muted">{feature.description}</p>
                        <a href={feature.link} className="btn btn-outline-primary btn-sm">
                          Explore Feature <i className="fas fa-arrow-right ms-2"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
  
        <style jsx>{`
          .bg-gradient-primary {
            background: linear-gradient(135deg, #2c3e50, #3498db);
          }
          
          .feature-icon {
            font-size: 1.4em;
            margin-right: 10px;
            vertical-align: middle;
          }
          
          .hover-shadow {
            transition: transform 0.2s, box-shadow 0.2s;
          }
          
          .hover-shadow:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          }
          
          .text-purple {
            color: #6f42c1;
          }
          
          .feature-card {
            border-left: 4px solid #3498db;
          }
          
          .feature-card:nth-child(even) {
            border-left-color: #6f42c1;
          }
        `}</style>
      </div>
    );
  };
  
  export default SoftwareFeedback;