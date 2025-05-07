import React, { useState, useEffect, useContext } from 'react';
import {
  Button, Form, Spinner, Alert,
  Badge, Container, Dropdown, Modal
} from 'react-bootstrap';
import {
  FaThumbsUp, FaRegThumbsUp, FaPen, FaTimes,
  FaMoon, FaSun, FaTrash, FaRegComment, FaShare, 
  FaEye, FaPaperPlane, FaUserPlus, FaUserCheck
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
  position: relative;
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
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const ProfileModalContent = styled.div`
  background: ${props => props.theme.postBg};
  border-radius: 12px;
  padding: 1.5rem;
  color: ${props => props.theme.text};
`;

const VoiceButton = styled(Button)`
  background: ${props => props.voiced ? '#10b981' : '#3b82f6'};
  border: none;
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.voiced ? '#059669' : '#2563eb'};
    transform: scale(1.05);
  }
`;

const FollowerCount = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.text};
  background: ${props => props.theme.commentBg};
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
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
  return colors[char?.charCodeAt(0) % colors.length] || '#3b82f6';
};

const ReviewSection = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showComments, setShowComments] = useState({});
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userId, setUserId] = useState(null);
  const [viewedPosts, setViewedPosts] = useState(new Set());
  const [formData, setFormData] = useState({ content: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [followers, setFollowers] = useState({});
  const [following, setFollowing] = useState({});

  useEffect(() => {
    const userId = getUserIdFromToken();
    setUserId(userId);
    fetchPosts();
    fetchFollowers();
    
    const interval = setInterval(fetchPosts, 120000);
    return () => clearInterval(interval);
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}/posts`);
      setPosts(data);
      setError('');
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowers = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/users/followers/${userId}`);
      setFollowers(data.followers);
      setFollowing(data.following);
    } catch (err) {
      console.error('Error fetching followers:', err);
    }
  };

  const toggleComments = (postId) => {
    setShowComments(prev => {
      const newState = { ...prev };
      if (newState[postId]) {
        delete newState[postId];
      } else {
        Object.keys(newState).forEach(key => delete newState[key]);
        newState[postId] = true;
      }
      return newState;
    });
  };

  const trackView = async (postId) => {
    const numericPostId = parseInt(postId, 10);
    if (!viewedPosts.has(numericPostId)) {
      try {
        await axios.post(`${BASE_URL}/posts/${numericPostId}/view`, { userId });
        setViewedPosts(prev => new Set([...prev, numericPostId]));
        setPosts(prev =>
          prev.map(post =>
            post.id === numericPostId ? { ...post, views: post.views + 1 } : post
          )
        );
      } catch (err) {
        console.error('View tracking error:', err);
      }
    }
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await axios.put(`${BASE_URL}/posts/${postId}/like`, { userId });
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, likes: data.likes } : post
      ));
    } catch (err) {
      setError('Failed to update like');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${BASE_URL}/posts`, {
        content: formData.content,
        authorId: userId
      });
      setPosts(prev => [data, ...prev]);
      setFormData({ content: '' });
      setShowReviewForm(false);
      setSuccess('Post created successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to create post');
    }
  };

  const handleCommentSubmit = async (postId, commentText) => {
    try {
      const { data } = await axios.post(`${BASE_URL}/posts/${postId}/comments`, {
        content: commentText,
        authorId: userId
      });
      setPosts(prev => prev.map(post => 
        post.id === postId ? { 
          ...post, 
          comments: [...(post.comments || []), data] 
        } : post
      ));
    } catch (err) {
      setError('Failed to add comment');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`${BASE_URL}/posts/${postId}`);
      setPosts(prev => prev.filter(post => post.id !== postId));
      setSuccess('Post deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete post');
    }
  };

  const handleVoiceAction = async (targetUserId) => {
    try {
      const isCurrentlyFollowing = following[targetUserId];
      const { data } = await axios.post(`${BASE_URL}/users/${targetUserId}/voice`, {
        userId,
        action: isCurrentlyFollowing ? 'unvoice' : 'voice'
      });

      setFollowers(prev => ({
        ...prev,
        [targetUserId]: data.newFollowerCount
      }));

    

      setFollowing(prev => ({
        ...prev,
        [targetUserId]: !isCurrentlyFollowing
      }))

    } catch (err) {
      setError('Failed to update voice status');
    }
  };

  const handleUserClick = async (userId) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/users/${userId}/posts`);
      const profileData = await axios.get(`${BASE_URL}/users/${userId}/profile`);
      
      setSelectedUser({
        ...profileData.data,
        posts: data
      });
    } catch (err) {
      setError('Failed to load user profile');
    }
  };

  const PostCard = React.memo(({ post }) => {
    const theme = useContext(ThemeContext);
    const [comment, setComment] = useState('');
    const userInitial = post.author?.name?.[0] || 'U';
    const avatarColor = getAvatarColor(userInitial);

    useEffect(() => {
      if (post?.id) trackView(post.id);
    }, [post?.id]);

    return (
      <PostBubble theme={theme}>
        <div className="d-flex gap-2 align-items-start">
          <UserAvatar 
            color={avatarColor} 
            onClick={() => handleUserClick(post.author.id)}
          >
            {userInitial}
          </UserAvatar>
          
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 
                  className="mb-0 fw-medium" 
                  style={{ fontSize: '0.9rem', cursor: 'pointer' }}
                  onClick={() => handleUserClick(post.author.id)}
                >
                  {post.author?.name || 'Anonymous'}
                </h6>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <FollowerCount theme={theme}>
                    <FaUserCheck />
                    {followers[post.author.id] || 0}
                  </FollowerCount>
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {timeAgo.format(new Date(post.createdAt))}
                  </small>
                </div>
              </div>
              
              <div className="d-flex align-items-center gap-2">
                <Badge bg="dark" className="rounded-pill" style={{ fontSize: '0.7rem' }}>
                  <FaEye className="me-1" /> {post.views || 0}
                </Badge>
                {post.author?.id === userId && (
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
                onClick={() => toggleComments(post.id)}
              >
                <FaRegComment style={{ fontSize: '0.9rem' }} />
                <span style={{ fontSize: '0.8rem' }}>{post.comments?.length || 0}</span>
              </Button>

              <Button 
                variant="link" 
                className="text-muted p-0"
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)}
              >
                <FaShare style={{ fontSize: '0.9rem' }} />
              </Button>
            </div>

            {showComments[post.id] && (
              <div className="mt-3">
                <div className="mb-2">
                  {post.comments?.map(comment => (
                    <CommentBubble key={comment.id} theme={theme}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <UserAvatar 
                            color={getAvatarColor(comment.author?.name?.[0])}
                            style={{ width: '28px', height: '28px', fontSize: '0.7rem' }}
                            onClick={() => handleUserClick(comment.author.id)}
                          >
                            {comment.author?.name?.[0]}
                          </UserAvatar>
                          <span 
                            className="fw-medium" 
                            style={{ fontSize: '0.8rem', cursor: 'pointer' }}
                            onClick={() => handleUserClick(comment.author.id)}
                          >
                            {comment.author?.name || 'Anonymous'}
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
                    onClick={() => {
                      handleCommentSubmit(post.id, comment);
                      setComment('');
                    }}
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

  const ProfileModal = () => (
    <Modal 
      show={!!selectedUser} 
      onHide={() => setSelectedUser(null)}
      centered
      size="lg"
    >
      <ProfileModalContent theme={darkMode ? darkTheme : lightTheme}>
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div className="d-flex align-items-center gap-3">
            <UserAvatar 
              color={getAvatarColor(selectedUser?.name?.[0])}
              style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}
            >
              {selectedUser?.name?.[0]}
            </UserAvatar>
            <div>
              <h4 className="mb-1">{selectedUser?.name}</h4>
              <FollowerCount theme={darkMode ? darkTheme : lightTheme}>
                <FaUserCheck />
                {followers[selectedUser?.id] || 0} Voices
              </FollowerCount>
            </div>
          </div>
          <VoiceButton
            voiced={following[selectedUser?.id]}
            onClick={() => handleVoiceAction(selectedUser?.id)}
          >
            {following[selectedUser?.id] ? (
              <>
                <FaUserCheck />
                Unvoice
              </>
            ) : (
              <>
                <FaUserPlus />
                Voice Up
              </>
            )}
          </VoiceButton>
        </div>

        <div className="posts-container">
          {userPosts.map(post => (
            <PostBubble key={post.id} theme={darkMode ? darkTheme : lightTheme}>
              <p className="mb-2" style={{ fontSize: '0.85rem' }}>{post.content}</p>
              <div className="d-flex align-items-center gap-3 text-muted">
                <small>
                  <FaThumbsUp className="me-1" />
                  {post.likes?.length || 0}
                </small>
                <small>
                  <FaRegComment className="me-1" />
                  {post.comments?.length || 0}
                </small>
                <small>
                  <FaEye className="me-1" />
                  {post.views || 0}
                </small>
              </div>
            </PostBubble>
          ))}
        </div>
      </ProfileModalContent>
    </Modal>
  );

  return (
    <ThemeContext.Provider value={darkMode ? darkTheme : lightTheme}>
      <HubContainer>
        <Container style={{ maxWidth: '800px' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0 fw-bold" style={{ fontSize: '1rem' }}>Free Speech Hub</h5>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-primary" 
                onClick={() => setDarkMode(!darkMode)}
                className="rounded-circle p-1"
                style={{ width: '32px', height: '32px' }}
              >
                {darkMode ? <FaSun size={10} /> : <FaMoon size={10} />}
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowReviewForm(true)}
                className="rounded-pill px-2"
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
          ) : posts.length > 0 ? (
            posts.map(post => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="text-center text-muted py-4">
              No posts available yet
            </div>
          )}

          {showReviewForm && (
            <StickyReviewForm theme={darkMode ? darkTheme : lightTheme}>
              <div className="position-relative p-5">
                <Button 
                  variant="link" 
                  onClick={() => setShowReviewForm(false)}
                  className="position-absolute top-0 end-0 p-1"
                >
                  <FaTimes className="fs-6" />
                </Button>

                <h6 className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                  Create New Post
                </h6>

                <Form onSubmit={handleReviewSubmit}>
                  <div className="position-relative">
                    <Form.Control
                      type="text"
                      value={formData.content}
                      onChange={(e) => setFormData({ content: e.target.value })}
                      placeholder="Share your thoughts..."
                      className="rounded-pill pe-2 py-1"
                      style={{
                        fontSize: '0.85rem',
                        paddingLeft: '1rem',
                        backgroundColor: darkMode ? '#1e1e1e' : '#f8f9fa',
                        border: '1px solid #ccc'
                      }}
                    />
                    <Button 
                      type="submit"
                      variant="link"
                      className="position-absolute top-50 end-0 translate-middle-y me-2 p-0"
                    >
                      <FaPaperPlane className="text-primary" />
                    </Button>
                  </div>
                </Form>
              </div>
            </StickyReviewForm>
          )}

          <ProfileModal />
        </Container>
      </HubContainer>
    </ThemeContext.Provider>
  );
};

export default ReviewSection;