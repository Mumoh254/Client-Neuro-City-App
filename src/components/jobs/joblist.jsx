import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Row, Col, Badge } from 'react-bootstrap';
import { FaClock, FaMapMarkerAlt, FaMoneyBillWave, FaEnvelope } from 'react-icons/fa';
import Swal from 'sweetalert2';
import styled from 'styled-components';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

// Initialize TimeAgo once
TimeAgo.addLocale(en);
const timeAgo = new TimeAgo('en-KE');

const BASE_URL = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";
const DB_NAME = "SmartCityJobsDB";
const STORE_NAME = "jobs";

// Kenyan Date Utilities
const formatKenyanDate = (dateString) => {
  const options = {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  try {
    const date = new Date(dateString);
    return isNaN(date) ? 'N/A' : date.toLocaleString('en-KE', options);
  } catch (e) {
    return 'N/A';
  }
};

const safeTimeAgo = (dateString) => {
  try {
    const date = new Date(dateString);
    return isNaN(date) ? 'Recently' : timeAgo.format(date);
  } catch (e) {
    return 'Recently';
  }
};

// IndexedDB Operations with Kenyan time storage
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 3);
    request.onerror = (event) => reject(`DB Error: ${event.target.error}`);
    
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("timestamp", "timestamp");
      }
    };
  });
};

const storeJobsInDB = async (jobs) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    
    // Clear old entries
    await store.clear();
    
    // Store with Kenyan timestamp
    const kenyanTimestamp = new Date().toLocaleString('en-KE', { 
      timeZone: 'Africa/Nairobi' 
    });
    
    const CHUNK_SIZE = 50;
    for (let i = 0; i < jobs.length; i += CHUNK_SIZE) {
      const chunk = jobs.slice(i, i + CHUNK_SIZE).map(job => ({
        ...job,
        id: job._id,
        timestamp: kenyanTimestamp
      }));
      await Promise.all(chunk.map(job => store.put(job)));
    }

    // Cleanup old entries
    const count = await store.count();
    if (count > 100) {
      const index = store.index('timestamp');
      const cursor = await index.openCursor(null, 'prev');
      const toDelete = [];
      while (cursor && toDelete.length < count - 100) {
        toDelete.push(cursor.primaryKey);
        cursor.continue();
      }
      await Promise.all(toDelete.map(key => store.delete(key)));
    }
    
    await tx.done;
  } catch (error) {
    console.error('IndexedDB Store Error:', error);
  }
};

const getJobsFromDB = async () => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    return await store.getAll();
  } catch (error) {
    console.error('IndexedDB Retrieve Error:', error);
    return [];
  }
};

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const previousJobCount = useRef(0);

  // Network Status Detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Data Fetching Logic
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(
          `${BASE_URL}/jobs${filter !== 'all' ? `?type=${filter}` : ''}`,
          { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        
        const data = await response.json();
        previousJobCount.current = data.length;
        setJobs(data);
        await storeJobsInDB(data);
        
        if (!isOnline) {
          Swal.fire('Back Online', 'Synced with latest jobs', 'success');
          setIsOnline(true);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          Swal.fire('Connection Slow', 'Loading local data...', 'warning');
        }
        
        try {
          const cachedJobs = await getJobsFromDB();
          if (cachedJobs.length) {
            setJobs(cachedJobs);
            if (!isOnline) {
              Swal.fire('Offline Mode', 'Using cached jobs', 'info');
            }
          }
        } catch (cacheError) {
          Swal.fire('Error', 'Failed to load jobs', 'error');
        }
      }
    };

    if (isOnline) {
      fetchJobs();
    } else {
      getJobsFromDB().then(cachedJobs => setJobs(cachedJobs));
    }
  }, [filter, isOnline]);

  // Kenyan Time Notifications
  useEffect(() => {
    if ("Notification" in window && isOnline) {
      Notification.requestPermission().then(perm => {
        if (perm === "granted" && jobs.length > previousJobCount.current) {
          const newJob = jobs[0];
          new Notification("🚀 New Job Posted!", {
            body: `${newJob.title} at ${newJob.company}\nPosted: ${formatKenyanDate(newJob.postedDate)}`,
            icon: "/favicon.ico",
            vibrate: [200, 100, 200]
          });
        }
      });
    }
  }, [jobs.length]);

  return (
    <JobsContainer className="p-4">
      <h2 className="mb-4 fw-bold text-primary">Nairobi Career Opportunities</h2>

      {/* Filter Buttons */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {['all', 'full-time', 'part-time', 'contract', 'remote'].map((type) => (
          <FilterButton
            key={type}
            $active={filter === type}
            onClick={() => setFilter(type)}
          >
            {type.replace(/-/g, ' ').toUpperCase()}
          </FilterButton>
        ))}
      </div>

      <Row className="g-4">
        {jobs.map(job => (
          <ResponsiveCol key={job._id} md={6} lg={4}>
            <JobCard className="h-100">
              <Card.Body className="d-flex flex-column">
                <div className="d-flex align-items-start mb-3">
                  <div className="flex-grow-1">
                    <Card.Title className="fw-bold fs-5 mb-1">{job.title}</Card.Title>
                    <Card.Subtitle className="text-muted small mb-2">
                      <CompanyBadge>{job.company}</CompanyBadge>
                    </Card.Subtitle>
                  </div>
                  <Badge pill className='p' style={{  }}>
  {safeTimeAgo(job.postedDate)}
</Badge>

                </div>

                <div className="d-flex flex-wrap gap-2 mb-3">
                  <JobBadge bg={job.type === 'full-time' ? 'primary' : 'secondary'}>
                    {job.type}
                  </JobBadge>
                  <SalaryBadge>
                    <FaMoneyBillWave className="me-1" />
                    KES {job.salary.toLocaleString('en-KE')}/month
                  </SalaryBadge>
                </div>

                <JobDetailItem>
                  <FaMapMarkerAlt className="me-2" />
                  {job.location}
                </JobDetailItem>
                <JobDetailItem>
                  <FaClock className="me-2" />
                  Apply by: {formatKenyanDate(job.deadline)}
                </JobDetailItem>

                <ContactDetail>
                  <FaEnvelope className="me-2" />
                  <a href={`mailto:${job.contactEmail}`}>{job.contactEmail}</a>
                </ContactDetail>

                <Card.Text className="text-muted small mt-2 mb-3 flex-grow-1">
                  {job.description}
                </Card.Text>

                <div className="mb-3">
                  <h6 className="fw-bold text-dark">Requirements:</h6>
                  <RequirementsList>
                    {job.requirements?.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </RequirementsList>
                </div>

                <ApplyButton
                  variant="primary"
                  href={job.applicationLink}
                  target="_blank"
                >
                  Apply Now
                </ApplyButton>
              </Card.Body>
            </JobCard>
          </ResponsiveCol>
        ))}
      </Row>

      {jobs.length === 0 && (
        <div className="text-center py-5">
          <h4 className="text-muted">No current openings matching your criteria</h4>
          <p className="text-muted">Check back later or try different filters</p>
        </div>
      )}
    </JobsContainer>
  );
};
// Updated Styled Components with new color scheme
const JobsContainer = styled.div`
  background: linear-gradient(to bottom right, #f8fafc, #f0fdfa);
  min-height: 100vh;
  padding: 1rem !important;

  @media (max-width: 768px) {
    padding: 0.5rem !important;
    
    h2 {
      font-size: 1.5rem !important;
      color: #10b981 !important;
    }
  }
`;

const JobCard = styled(Card)`
  border: none;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 2px solid #8b5cf6;
  height: auto; /* Dynamic height based on content */
  min-height: 320px; /* Minimum height for consistency */
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(16, 185, 129, 0.15);
  }

  @media (max-width: 768px) {
    border-radius: 12px;
    min-height: 280px;
  }
`;

const FilterButton = styled.button.attrs(({ $active }) => ({
  'data-active': $active.toString()
}))`
  padding: 8px 20px;
  border-radius: 25px;
  border: 2px solid ${props => props.$active ? '#10b981' : '#e2e8f0'};
  background: ${props => props.$active ? 
    'linear-gradient(135deg, #10b981, #059669)' : 
    'transparent'};
  color: ${props => props.$active ? 'white' : '#475569'};
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    border-color: #059669;
    background: ${props => !props.$active && '#e8f5f0'};
  }

  @media (max-width: 768px) {
    padding: 6px 15px;
    font-size: 0.8rem;
  }
`;

const CompanyBadge = styled.span`
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;

  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  backdrop-filter: blur(4px);
`;

const JobBadge = styled(Badge)`
  font-size: 0.8rem;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 500;
  background: #ef4444 !important;
  color:rgb(243, 243, 243) !important;
  border: 1px solid #ef4444 ;
`;

const SalaryBadge = styled(JobBadge)`
  background: linear-gradient(135deg,#3b82f6, #3b82f6) !important;
  color: white !important;
  border: none;
`;

const JobDetailItem = styled.div`
  display: flex;
  align-items: center;
  color: #475569;
  font-size: 0.9rem;
  margin-bottom: 8px;
  gap: 8px;

  svg {
    color: #ef4444;
    min-width: 20px;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const RequirementsList = styled.ul`
  list-style: none;
  padding-left: 0;
  margin-bottom: 0;
  max-height: 120px;
  overflow-y: auto;

  li {
    position: relative;
    padding-left: 1.5rem;
    margin-bottom: 4px;
    font-size: 0.9rem;
    line-height: 1.4;

    &::before {
      content: '•';
      color: #ef4444;
      position: absolute;
      left: 0;
      font-weight: bold;
    }
  }

  @media (max-width: 768px) {
    li {
      font-size: 0.85rem;
    }
  }
`;

const ResponsiveCol = styled(Col)`
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;


const ContactDetail = styled.div`
  display: flex;
  align-items: center;
  color: #3b82f6;
  font-size: 0.9rem;
  margin-bottom: 8px;
  gap: 8px;

  a {
    color: inherit;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  svg {
    color: #3b82f6;
    min-width: 20px;
    flex-shrink: 0;
  }
`;

const ApplyButton = styled(Button)`
  background: linear-gradient(135deg, #3b82f6, #3b82f6);
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: auto; /* Pushes button to bottom */

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
`;
export default JobsList;