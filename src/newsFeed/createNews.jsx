// frontend/src/components/NewsManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Container, Card, Spinner, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';

const CreateNews = () => {
  const [news, setNews] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    socialLinks: '',
    media: null,
    id: null
  
  });
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Fetch all news
  const fetchNews = async () => {
    try {
      const { data } = await axios.get('http://localhost:8000/apiV1/smartcity-ke/get-news');
      setNews(data);
    } catch (error) {
      Swal.fire('Error!', 'Failed to load news', 'error');
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file input
  const handleFileChange = (e) => {
    setFormData({ ...formData, media: e.target.files[0] });
  };

  // Parse social links
  const parseSocialLinks = (input) => {
    const links = {};
    input.split(',').forEach(part => {
      const [platform, url] = part.split(':').map(s => s.trim());
      if (platform && url) {
        links[platform.toLowerCase()] = url;
      }
    });
    return links;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('content', formData.content);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('socialLinks', JSON.stringify(parseSocialLinks(formData.socialLinks)));
    if (formData.media) formDataToSend.append('media', formData.media);
  
    // ✅ Add the author ID
    formDataToSend.append('userId', 'smart_ke_WT_947225819');
  
    try {
      const url = editMode 
        ? `http://localhost:8000/apiV1/smartcity-ke/create-news/${formData.id}`
        : 'http://localhost:8000/apiV1/smartcity-ke/create-news';
  
      const { data } = await axios[editMode ? 'put' : 'post'](url, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
  
      Swal.fire('Success!', `News ${editMode ? 'updated' : 'created'} successfully!`, 'success');
      resetForm();
      fetchNews();
    } catch (error) {
      Swal.fire('Error!', error.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setLoading(false);
    }
  };
  

  // Edit news
  const handleEdit = (newsItem) => {
    setFormData({
      ...newsItem,
      socialLinks: Object.entries(newsItem.socialLinks)
                       .map(([k, v]) => `${k}: ${v}`).join(', ')
    });
    setEditMode(true);
  };

  // Delete news
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:8000/apiV1/smartcity-ke/news/${id}`);
        Swal.fire('Deleted!', 'News has been deleted.', 'success');
        fetchNews();
      } catch (error) {
        Swal.fire('Error!', 'Deletion failed', 'error');
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ title: '', content: '', category: '', socialLinks: '', media: null, id: null });
    setEditMode(false);
  };

  return (
    <Container className="my-5">
      <h2>{editMode ? 'Edit News' : 'Create News'}</h2>
      <Form onSubmit={handleSubmit} className="mb-5">
        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Content</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Category</Form.Label>
          <Form.Control
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Social Links (format: platform:url, ...)</Form.Label>
          <Form.Control
            name="socialLinks"
            value={formData.socialLinks}
            onChange={handleChange}
            placeholder="facebook: https://..., twitter: https://..."
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Media</Form.Label>
          <Form.Control
            type="file"
            onChange={handleFileChange}
          />
        </Form.Group>

        <div className="d-flex gap-2">
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" /> : editMode ? 'Update' : 'Create'}
          </Button>
          {editMode && <Button variant="secondary" onClick={resetForm}>Cancel</Button>}
        </div>
      </Form>

      <h3>News List</h3>
      <Row>
        {news.map(item => (
          <Col md={4} key={item.id} className="mb-4">
            <Card>
              {item.media && <Card.Img variant="top" src={item.media} />}
              <Card.Body>
                <Card.Title>{item.title}</Card.Title>
                <Card.Text>{item.content}</Card.Text>
                <div className="d-flex gap-2">
                  <Button size="sm" onClick={() => handleEdit(item)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
                    Delete
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default CreateNews;