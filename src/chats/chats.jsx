import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Button, Form, Spinner, Alert,
  Badge, Container, OverlayTrigger,
  Tooltip, Dropdown
} from 'react-bootstrap';
import {
  FaComment, FaThumbsUp, FaPaperPlane,
  FaPen, FaRegThumbsUp, FaTimes, FaMoon, FaSun,
  FaHeart, FaRegComment, FaBell, FaTrash, FaShare, FaEye
} from 'react-icons/fa';
import axios from 'axios';
import styled, { ThemeContext } from 'styled-components';
import { getUserIdFromToken } from '../components/handler/tokenDecoder';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');

// Styled Components
const HubContainer = styled.div`
  background: ${props => props.theme.background};
  min-height: 100vh;
  padding: 1rem;
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 0.875rem;
`;

const PostBubble = styled.div`
  background: ${props => props.theme.postBg};
  color: ${props => props.theme.text};
  border-radius: 8px;
  padding: 1rem;
  margin: 0.5rem 0;
  border: 1px solid ${props => props.theme.border};
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
`;

const CommentBubble = styled.div`
  background: ${props => props.theme.commentBg};
  color: ${props => props.theme.text};
  border-radius: 6px;
  padding: 0.75rem;
  margin: 0.3rem 0 0.3rem 1.2rem;
  font-size: 0.8rem;
  position: relative;
  border: 1px solid ${props => props.theme.commentBorder};
  
  &::before {
    content: '';
    position: absolute;
    left: -0.6rem;
    top: 0.5rem;
    border: 5px solid transparent;
    border-right-color: ${props => props.theme.commentBg};
  }
`;

const StickyReviewForm = styled.div`
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  width: 95%;
  max-width: 600px;
  background: ${props => props.theme.formBg};
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.border};
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  z-index: 1000;
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.color || props.theme.avatarBg};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  border: 1.5px solid ${props => props.theme.avatarBorder};
  flex-shrink: 0;
`;

// Themes
const lightTheme = {
  background: '#f8f9fa',
  postBg: '#ffffff',
  commentBg: '#f3f4f6',
  commentBorder: '#e5e7eb',
  formBg: '#ffffff',
  text: '#1f2937',
  border: '#e5e7eb',
  avatarBg: '#3b82f6',
  avatarBorder: '#bfdbfe',
};

const darkTheme = {
  background: '#111827',
  postBg: '#1f2937',
  commentBg: '#374151',
  commentBorder: '#4b5563',
  formBg: '#1f2937',
  text: '#f3f4f6',
  border: '#374151',
  avatarBg: '#6366f1',
  avatarBorder: '#818cf8',
};

const BASE_URL = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";

const getAvatarColor = (char) => {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  return colors[char.charCodeAt(0) % colors.length];
};

const ReviewSection = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showComments, setShowComments] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userId, setUserId] = useState(null);
  const [viewedPosts, setViewedPosts] = useState(new Set());
  const [formData, setFormData] = useState({ content: '' });

  useEffect(() => {
    const userId = getUserIdFromToken();
    setUserId(userId);
    fetchPosts();
    
    const interval = setInterval(fetchPosts, 120000);
    return () => clearInterval(interval);
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}/posts`);
      setPosts(data.map(p => ({ ...p, id: p.id ?? p._id })));
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const trackView = async (postId) => {
    if (!viewedPosts.has(postId)) {
      try {
        await axios.post(`${BASE_URL}/posts/${postId}/view`, { userId });
        setViewedPosts(prev => new Set([...prev, postId]));
        setPosts(prev => prev.map(post => 
          post.id === postId ? { ...post, views: (post.views || 0) + 1 } : post
        ));
      } catch (err) {
        console.error('View tracking error:', err);
      }
    }
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await axios.put(`${BASE_URL}/${postId}/like`, { userId });
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, likes: data.likes } : post
      ));
    } catch (err) {
      setError('Failed to update like');
    }
  };

  const handleCommentSubmit = async (postId, commentText) => {
    try {
      const { data } = await axios.post(`${BASE_URL}/${postId}/comments`, {
        content: commentText,
        author: userId
      });
      
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, comments: [...post.comments, data] } : post
      ));
      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      setError('Failed to add comment');
    }
  };

  const PostCard = React.memo(({ post }) => {
    const theme = useContext(ThemeContext);
    const [comment, setComment] = useState('');
    const userInitial = post.author?.Name?.[0] || 'U';
    const avatarColor = getAvatarColor(userInitial);

    useEffect(() => {
      trackView(post.id);
    }, []);

    return (
      <PostBubble theme={theme}>
        <div className="d-flex gap-2 align-items-start">
          <UserAvatar color={avatarColor}>{userInitial}</UserAvatar>
          
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 className="mb-0 fw-medium" style={{ fontSize: '0.9rem' }}>
                  {post.author?.Name}
                </h6>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {timeAgo.format(new Date(post.createdAt))}
                </small>
              </div>
              
              <div className="d-flex align-items-center gap-2">
                <Badge bg="dark" className="rounded-pill" style={{ fontSize: '0.7rem' }}>
                  <FaEye className="me-1" /> {post.views || 0}
                </Badge>
                {post.author?._id === userId && (
                  <Dropdown>
                    <Dropdown.Toggle variant="link" className="p-0">
                      <FaTrash className="text-danger" style={{ fontSize: '0.8rem' }} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleDeletePost(post.id)}>
                        Delete Post
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </div>
            </div>

            <p className="mb-2" style={{ fontSize: '0.85rem' }}>{post.content}</p>

            <div className="d-flex gap-3 align-items-center">
              <Button 
                variant="link" 
                className="d-flex align-items-center gap-1 text-muted p-0"
                onClick={() => handleLike(post.id)}
              >
                {post.likes?.includes(userId) ? (
                  <FaThumbsUp className="text-primary" style={{ fontSize: '0.9rem' }} />
                ) : (
                  <FaRegThumbsUp style={{ fontSize: '0.9rem' }} />
                )}
                <span style={{ fontSize: '0.8rem' }}>{post.likes?.length || 0}</span>
              </Button>

              <Button
                variant="link"
                className="d-flex align-items-center gap-1 text-muted p-0"
                onClick={() => setShowComments(prev => ({
                  ...prev,
                  [post.id]: !prev[post.id]
                }))}
              >
                <FaRegComment style={{ fontSize: '0.9rem' }} />
                <span style={{ fontSize: '0.8rem' }}>{post.comments?.length || 0}</span>
              </Button>

              <Button 
                variant="link" 
                className="text-muted p-0"
                onClick={() => handleShare(post.id)}
              >
                <FaShare style={{ fontSize: '0.9rem' }} />
              </Button>
            </div>

            {showComments[post.id] && (
              <div className="mt-3">
                <div className="mb-2">
                  {post.comments?.map((comment, index) => (
                    <CommentBubble key={index} theme={theme}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <UserAvatar 
                            color={getAvatarColor(comment.author?.Name?.[0])}
                            style={{ width: '28px', height: '28px', fontSize: '0.7rem' }}
                          >
                            {comment.author?.Name?.[0]}
                          </UserAvatar>
                          <span className="fw-medium" style={{ fontSize: '0.8rem' }}>
                            {comment.author?.Name}
                          </span>
                        </div>
                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                          {timeAgo.format(new Date(comment.createdAt))}
                        </small>
                      </div>
                      <p className="mb-0" style={{ fontSize: '0.8rem' }}>{comment.content}</p>
                    </CommentBubble>
                  ))}
                </div>

                <div className="d-flex gap-2">
                  <Form.Control
                    as="textarea"
                    rows={1}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="rounded-2"
                    style={{ 
                      fontSize: '0.8rem',
                      padding: '0.4rem 0.8rem',
                      lineHeight: '1.3'
                    }}
                  />
                  <Button 
                    variant="primary" 
                    className="rounded-2 px-3"
                    onClick={() => handleCommentSubmit(post.id, comment)}
                    style={{ fontSize: '0.8rem' }}
                  >
                    Post
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </PostBubble>
    );
  });

  return (
    <ThemeContext.Provider value={darkMode ? darkTheme : lightTheme}>
      <HubContainer>
        <Container style={{ maxWidth: '800px' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0 fw-bold" style={{ fontSize: '1rem' }}>City Community Hub</h5>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-primary" 
                onClick={() => setDarkMode(!darkMode)}
                className="rounded-circle p-1"
                style={{ width: '32px', height: '32px' }}
              >
                {darkMode ? <FaSun size={14} /> : <FaMoon size={14} />}
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowReviewForm(true)}
                className="rounded-pill px-3"
                style={{ fontSize: '0.8rem' }}
              >
                <FaPen className="me-1" />
                New Post
              </Button>
            </div>
          </div>

          {error && <Alert variant="danger" className="py-2">{error}</Alert>}
          {success && <Alert variant="success" className="py-2">{success}</Alert>}

          {loading ? (
            <div className="text-center mt-4">
              <Spinner animation="border" variant="primary" size="sm" />
            </div>
          ) : (
            posts.map(post => <PostCard key={post.id} post={post} />)
          )}

          {showReviewForm && (
            <StickyReviewForm theme={darkMode ? darkTheme : lightTheme}>
              <div className="position-relative">
                <Button 
                  variant="link" 
                  onClick={() => setShowReviewForm(false)}
                  className="position-absolute top-0 end-0 p-1"
                >
                  <FaTimes className="fs-6" />
                </Button>
                
                <h6 className="mb-2 fw-semibold" style={{ fontSize: '0.9rem' }}>Create New Post</h6>
                <Form onSubmit={(e) => {
                  e.preventDefault();
                  handleReviewSubmit(e);
                }}>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.content}
                    onChange={(e) => setFormData({ content: e.target.value })}
                    placeholder="Share your thoughts..."
                    className="rounded-2 mb-2"
                    style={{ 
                      fontSize: '0.8rem',
                      lineHeight: '1.4',
                      padding: '0.6rem'
                    }}
                  />
                  <div className="d-flex justify-content-end">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="rounded-pill px-3"
                      style={{ fontSize: '0.8rem' }}
                    >
                      <FaPaperPlane className="me-1" />
                      Post
                    </Button>
                  </div>
                </Form>
              </div>
            </StickyReviewForm>
          )}
        </Container>
      </HubContainer>
    </ThemeContext.Provider>
  );
};

export default ReviewSection;