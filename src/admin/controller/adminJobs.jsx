import React, { useEffect, useState } from 'react';
import { Container, Table, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const BASE_URL = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";

export default function AdminJobs() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [jobs, setJobs] = useState([]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(response.data);
      setErr(null);
    } catch (error) {
      setErr("Failed to fetch jobs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <Container className="mt-4">
      <h2>Available Jobs</h2>

      {loading && <Spinner animation="border" />}
      {err && <Alert variant="danger">{err}</Alert>}
      {!loading && jobs.length === 0 && <Alert variant="info">No jobs found</Alert>}

      {!loading && jobs.length > 0 && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Title</th>
              <th>Location</th>
              <th>Posted On</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job._id}>
                <td>{job._id.slice(-6).toUpperCase()}</td>
                <td>{job.title}</td>
                <td>{job.location}</td>
                <td>{new Date(job.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
