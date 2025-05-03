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

// Styled components
const HubContainer = styled.div`
  background: ${props => props.theme.background};
  min-height: 100vh;
  padding: 0.5rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const PostBubble = styled.div`
  background: ${props => props.isOdd ? props.theme.oddPostBg : props.theme.postBg};
  color: ${props => props.theme.text};
  border-radius: 8px;
  padding: 0.8rem;
  margin: 0.3rem 0;
  border: 1px solid ${props => props.theme.border};
  transition: all 0.15s ease;
  line-height: 1.35;
  font-size: 0.8125rem;
  position: relative;
  
  &:hover {
    transform: translateY(-0.5px);
    box-shadow: ${props => props.theme.shadow};
  }
`;

const CommentBubble = styled.div`
  background: ${props => props.theme.commentBg};
  color: ${props => props.theme.text};
  border-radius: 6px;
  padding: 0.6rem;
  margin: 0.3rem 0 0.3rem 1.2rem;
  font-size: 0.75rem;
  position: relative;
  border: 1px solid ${props => props.theme.commentBorder};
  line-height: 1.3;
  
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
  bottom: 0.6rem;
  left: 50%;
  transform: translateX(-50%);
  width: 96%;
  max-width: 560px;
  background: ${props => props.theme.formBg};
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.border};
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  z-index: 1000;
`;

const UserAvatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${props => props.color || props.theme.avatarBg};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1.5px solid ${props => props.theme.avatarBorder};
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
`;

// Themes
const lightTheme = {
  background: '#fafafa',
  postBg: '#ffffff',
  oddPostBg: '#f8f9fa',
  commentBg: '#f0f2f5',
  commentBorder: 'rgba(0,0,0,0.04)',
  formBg: '#ffffff',
  text: '#2d3436',
  border: 'rgba(0,0,0,0.08)',
  avatarBg: '#6366f1',
  avatarBorder: 'rgba(255,255,255,0.2)',
  shadow: '0 1px 3px rgba(0,0,0,0.03)'
};

const darkTheme = {
  background: '#0a0a0a',
  postBg: '#161616',
  oddPostBg: '#202020',
  commentBg: '#2a2a2a',
  commentBorder: 'rgba(0,0,0,0.3)',
  formBg: '#1a1a1a',
  text: '#e0e0e0',
color:  '#fff',
  avatarBg: '#4f46e5',
  avatarBorder: 'rgba(0,0,0,0.3)',
  shadow: 'rgba(0,0,0,0.3)'
};

const REACTIONS = ['👍', '❤️', '😂', '😲', '😢'];
const STICKERS = ['🚀', '💡', '🌟', '🔥', '💯'];
const BASE_URL = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";

const getAvatarColor = (char) => {
  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
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
  const [notifiedPosts, setNotifiedPosts] = useState(new Set());
  const [formData, setFormData] = useState({ content: '', stickers: [] });
  const [editPostId, setEditPostId] = useState(null);

  useEffect(() => {
    const userId = getUserIdFromToken();
    setUserId(userId);
    fetchPosts();
    checkNotificationPermission();
    const interval = setInterval(fetchPosts, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      await Notification.requestPermission();
    }
  };

  const sendNotification = (post) => {
    if (Notification.permission === 'granted') {
      new Notification(`New Post from ${post.author.Name}`, {
        body: post.content.substring(0, 50) + (post.content.length > 50 ? '...' : ''),
        icon: 'https://cdn-icons-png.flaticon.com/512/1250/1250689.png'
      });
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}/posts`);
      const newPosts = data.map(p => ({ ...p, id: p.id ?? p._id }));
      
      const now = new Date();
      newPosts.forEach(post => {
        const postDate = new Date(post.createdAt);
        const diffMinutes = (now - postDate) / (1000 * 60);
        
        if (diffMinutes <= 10 && !notifiedPosts.has(post.id)) {
          sendNotification(post);
          setNotifiedPosts(prev => new Set([...prev, post.id]));
        }
      });

      setPosts(newPosts);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${BASE_URL}/posts`, {
        content: formData.content,
        author: userId
      });
      setPosts(prev => [data, ...prev]);
      setFormData({ content: '', stickers: [] });
      setShowReviewForm(false);
      setSuccess('Post created successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to create post');
    }
  };

  const handleCommentSubmit = async (postId) => {
    try {
      const commentContent = commentTexts[postId];
      const { data } = await axios.post(`${BASE_URL}/posts/${postId}/comments`, {
        content: commentContent,
        author: userId
      });
      
      setPosts(prev => prev.map(post => 
        post.id === postId ? 
        { ...post, comments: [...post.comments, data] } : post
      ));
      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      setError('Failed to add comment');
    }
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await axios.post(`${BASE_URL}/posts/${postId}/like`, { userId });
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, likes: data.likes } : post
      ));
    } catch (err) {
      setError('Failed to update like');
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

  const handleCommentReaction = async (postId, commentId, reaction) => {
    try {
      const { data } = await axios.post(
        `${BASE_URL}/posts/${postId}/comments/${commentId}/react`,
        { reaction }
      );
      
      setPosts(prev => prev.map(post => 
        post.id === postId ? {
          ...post,
          comments: post.comments.map(comment => 
            comment.id === commentId ? { ...comment, reactions: data.reactions } : comment
          )
        } : post
      ));
    } catch (err) {
      setError('Failed to add reaction');
    }
  };

  const handleShare = async (postId) => {
    try {
      const postUrl = `${window.location.origin}/post/${postId}`;
      await navigator.clipboard.writeText(postUrl);
      setSuccess('Post link copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to copy post link');
    }
  };

  const PostCard = React.memo(({ post, index }) => {
    const theme = useContext(ThemeContext);
    const inputRef = useRef(null);
    const [localComment, setLocalComment] = useState('');
    const userInitial = post.author?.Name?.[0] || 'A';
    const avatarColor = getAvatarColor(userInitial);

    useEffect(() => {
      if (showComments[post.id]) {
        inputRef.current?.focus();
        setLocalComment(commentTexts[post.id] || '');
      }
    }, [showComments[post.id]]);

    const handleSubmit = () => {
      setCommentTexts(prev => ({ ...prev, [post.id]: localComment }));
      handleCommentSubmit(post.id);
      setLocalComment('');
    };

    return (
      <PostBubble theme={theme} isOdd={index % 2 !== 0}>
        <div className="d-flex align-items-start gap-2 mb-2">
          <UserAvatar color={avatarColor}>{userInitial}</UserAvatar>
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-medium">{post.author?.Name}</span>
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>{new Date(post.createdAt).toLocaleString()}</Tooltip>}
                  >
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                      {timeAgo.format(new Date(post.createdAt))}
                    </span>
                  </OverlayTrigger>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Badge bg="secondary" className="fs-7 rounded-pill">
                  {post.role}
                </Badge>
                <div className="d-flex align-items-center gap-1 ms-2">
                  <FaEye className="text-muted" style={{ fontSize: '0.8rem' }} />
                  <small style={{ fontSize: '0.7rem' }}>{post.views || 0}</small>
                </div>
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
            <p className="mt-1 mb-2">{post.content}</p>
            
            <div className="d-flex gap-3 align-items-center">
              <Button 
                variant="link" 
                className="p-0 text-muted d-flex align-items-center gap-1 hover-effect"
                onClick={() => handleLike(post.id)}
              >
                {post.likes?.includes(userId) ? 
                  <FaThumbsUp className="text-primary" /> : 
                  <FaRegThumbsUp />}
                <small style={{ fontSize: '0.7rem' }}>{post.likes?.length || 0}</small>
              </Button>

              <Button 
                variant="link" 
                className="p-0 text-muted d-flex align-items-center gap-1 hover-effect"
                onClick={() => setShowComments(prev => ({
                  ...prev, 
                  [post.id]: !prev[post.id]
                }))}
              >
                <FaRegComment />
                <small style={{ fontSize: '0.7rem' }}>{post.comments?.length || 0}</small>
              </Button>

              <Button 
                variant="link" 
                className="p-0 text-muted hover-effect"
                onClick={() => handleShare(post.id)}
              >
                <FaShare />
              </Button>
            </div>
          </div>
        </div>

        {showComments[post.id] && (
          <div className="mt-2">
            <div className="comments">
              {post.comments?.map((comment, index) => {
                const commentInitial = comment.author?.Name?.[0] || 'U';
                const commentColor = getAvatarColor(commentInitial);

                return (
                  <CommentBubble key={index} theme={theme}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <UserAvatar 
                          color={commentColor}
                          style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}
                        >
                          {commentInitial}
                        </UserAvatar>
                        <small className="fw-medium">{comment.author?.Name}</small>
                      </div>
                      <small className="text-muted" style={{ fontSize: '0.65rem' }}>
                        {timeAgo.format(new Date(comment.createdAt))}
                      </small>
                    </div>
                    <p className="mb-0">{comment.content}</p>
                    <div className="reaction-bar mt-1">
                      {REACTIONS.map(reaction => (
                        <button
                          key={reaction}
                          className="btn btn-link p-0 me-2 fs-7"
                          onClick={() => handleCommentReaction(post.id, comment._id, reaction)}
                        >
                          {reaction}
                        </button>
                      ))}
                    </div>
                  </CommentBubble>
                );
              })}
            </div>

            <div className="mt-2 d-flex gap-2">
              <Form.Control
                ref={inputRef}
                as="textarea"
                rows={1}
                value={localComment}
                onChange={(e) => setLocalComment(e.target.value)}
                placeholder="Add comment..."
                className="flex-grow-1 rounded-pill"
                style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.4rem 0.8rem',
                  background: theme.commentBg,
                  border: 'none'
                }}
              />
              <Button 
                variant="primary" 
                onClick={handleSubmit}
                className="rounded-pill px-2"
                size="sm"
                style={{ fontSize: '0.75rem' }}
              >
                Post
              </Button>
            </div>
          </div>
        )}
      </PostBubble>
    );
  });

  return (
    <ThemeContext.Provider value={darkMode ? darkTheme : lightTheme}>
      <HubContainer>
        <Container className="position-relative" style={{ maxWidth: '800px' }}>
          <div className="d-flex gap-2 position-absolute top-0 end-0 mt-2 me-2">
            <Button 
              variant="link" 
              onClick={() => setDarkMode(!darkMode)}
              style={{ fontSize: '0.9rem' }}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </Button>
            <Button
              variant="link"
              onClick={checkNotificationPermission}
              style={{ fontSize: '0.9rem' }}
            >
              <FaBell />
            </Button>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3 p-5">
            <div>
              <h6 className="mb-0 fw-bold">Free Speech Hub</h6>
              <small className="text-muted" style={{ fontSize: '0.7rem' }}>Express yourself freely</small>
            </div>
            <Button 
              variant="primary" 
              onClick={() => setShowReviewForm(true)}
              className="rounded-pill px-2"
              size="sm"
              style={{ fontSize: '0.75rem' }}
            >
              <FaPen className="me-2" />
              New Post
            </Button>
          </div>

          {error && <Alert variant="danger" className="py-2">{error}</Alert>}
          {success && <Alert variant="success" className="py-2">{success}</Alert>}

          {loading ? (
            <div className="text-center mt-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            posts.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))
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
                
                <h6 className="mb-2 fw-bold" style={{ fontSize: '0.875rem' }}>Create Post</h6>
                <Form onSubmit={handleReviewSubmit}>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      content: e.target.value 
                    }))}
                    placeholder="Share your thoughts..."
                    className="mb-2 rounded-2"
                    style={{ 
                      background: 'transparent',
                      border: 'none',
                      fontSize: '0.75rem',
                      lineHeight: '1.4'
                    }}
                  />
                  
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex gap-1">
                      {STICKERS.map((sticker, i) => (
                        <Button
                          key={i}
                          variant="outline-secondary"
                          className="rounded-circle p-1"
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            content: prev.content + sticker
                          }))}
                        >
                          {sticker}
                        </Button>
                      ))}
                    </div>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="rounded-pill px-2"
                      size="sm"
                      style={{ fontSize: '0.75rem' }}
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