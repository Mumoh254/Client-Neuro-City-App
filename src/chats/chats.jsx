import React, { useState, useEffect, useRef } from 'react';
import {
  Card, Form, Button, Spinner, Alert,
  Badge, Modal, ListGroup, Container
} from 'react-bootstrap';
import {
  FaComment, FaThumbsUp, FaPaperPlane, FaUser,
  FaPen, FaRegThumbsUp, FaPlus, FaTimes
} from 'react-icons/fa';
import axios from 'axios';
import styled from 'styled-components';
import { getUserIdFromToken, getUserNameFromToken } from '../components/handler/tokenDecoder';

const HubContainer = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100vh;
  padding-bottom: 120px;
`;

const PostBubble = styled.div`
  background: ${props => props.$even ? '#ffffff' : '#f8f9fa'};
  border-radius: 20px;
  padding: 2rem;
  margin: 1rem 0;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0,0,0,0.05);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  }
`;

const CommentBubble = styled.div`
  background: #f0f2f5;
  border-radius: 15px;
  padding: 1.25rem;
  margin: 0.75rem 0 0.75rem 2rem;
  font-size: 0.95em;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: -1rem;
    top: 1rem;
    width: 0;
    height: 0;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-right: 10px solid #f0f2f5;
  }

  .reaction-bar {
    display: flex;
    gap: 4px;
    margin-top: 8px;
  }
  
  .reaction-btn {
    border: none;
    background: none;
    padding: 2px;
    cursor: pointer;
    transition: transform 0.2s;
    font-size: 1.2rem;
  }
  
  .reaction-btn:hover {
    transform: scale(1.2);
  }
  
  .reaction-btn.active {
    transform: scale(1.3);
    filter: drop-shadow(0 0 2px rgba(0,0,0,0.2));
  }
`;

const StickyReviewForm = styled.div`
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 800px;
  background: white;
  padding: 1.5rem;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  z-index: 1000;
`;

const UserAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.25rem;
`;

const ContentWrapper = styled(Container)`
  max-width: 1200px;
  padding: 2rem 1rem;
`;

const ReviewSection = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showComments, setShowComments] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    stickers: []
  });
  const [userId, setUserId] = useState(null);
  const [commentReactions, setCommentReactions] = useState({});
  const commentInputRef = useRef(null);

  const REACTIONS = ['👍', '❤️', '😂', '😲', '😢', '👎', '👏', '🎉', '💩', '🤔'];
  const STICKERS = ['🚀', '💡', '🌟', '✨', '🔥', '💯', '✅', '❌', '⚠️', '🌈'];
  const BASE_URL = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";

  useEffect(() => {
    const userId = getUserIdFromToken();
    setUserId(userId);
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}/posts`);
      const normalized = (data || []).map(p => ({ ...p, id: p.id ?? p._id }));
      setPosts(normalized);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };


  const handleCommentInputChange = (postId, value) => {
    setCommentTexts(prev => ({
      ...prev,
      [postId]: value
    }));
    
    // Maintain focus after state update
    setTimeout(() => {
      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
    }, 0);
  }; 
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const newPost = {
        content: formData.content,
        stickers: formData.stickers,
        authorId: userId,
        likes: [],
        comments: []
      };

      const response = await axios.post(`${BASE_URL}/posts`, newPost);
      setPosts([response.data, ...posts]);
      setFormData({ content: '', stickers: [] });
      setShowReviewForm(false);
      setSuccess('Review posted!');
    } catch (err) {
      setError('Failed to post review');
    }
  };

  const handleLike = async (postId) => {
    try {
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          const likes = post.likes.includes(userId)
            ? post.likes.filter(id => id !== userId)
            : [...post.likes, userId];
          return { ...post, likes };
        }
        return post;
      });

      setPosts(updatedPosts);
      await axios.put(`${BASE_URL}/${postId}/like`, { userId });
    } catch (err) {
      setError('Failed to update like');
    }
  };

  const handleCommentSubmit = async (postId) => {
    const content = commentTexts[postId];
    if (!content?.trim()) return;

    try {
      const newComment = {
        content,
        userId,
        createdAt: new Date().toISOString()
      };

      const response = await axios.post(`${BASE_URL}/${postId}/comments`, newComment);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, comments: [...post.comments, response.data] }
          : post
      ));
      setCommentTexts({ ...commentTexts, [postId]: '' });
      setSuccess('Comment posted!');
    } catch (err) {
      setError('Failed to post comment');
    }
  };

  const handleCommentReaction = async (postId, commentId, reaction) => {
    try {
      const updatedReactions = { ...commentReactions };
      const reactionKey = `${postId}-${commentId}`;
      
      if (updatedReactions[reactionKey] === reaction) {
        delete updatedReactions[reactionKey];
      } else {
        updatedReactions[reactionKey] = reaction;
      }
      
      setCommentReactions(updatedReactions);
      await axios.put(`${BASE_URL}/comments/${commentId}/react`, { userId, reaction });
    } catch (err) {
      setError('Failed to save reaction');
    }
  };

  const handleStickerSelect = (sticker) => {
    setFormData(prev => ({
      ...prev,
      stickers: [...prev.stickers, sticker],
      content: prev.content + sticker
    }));
  };

  const PostCard = ({ post, index }) => (
    <PostBubble $even={index % 2 === 0}>
      <div className="d-flex align-items-start gap-3 mb-3">
        <UserAvatar>{post.author?.Name[0] || 'A'}</UserAvatar>
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h5 className="mb-0 fw-semibold text-primary">{post.author?.Name}</h5>
              <small className="text-muted">
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </small>
            </div>
            <Badge bg="light" text="primary" className="fs-6">
              {post.role}
            </Badge>
          </div>
          <p className="mt-3 mb-4 fs-5 text-dark">{post.content}</p>
          
          <div className="d-flex gap-3 align-items-center">
            <Button 
              variant="outline-primary" 
              className="d-flex align-items-center gap-2"
              onClick={() => handleLike(post.id)}
            >
              {post.likes?.includes(userId) ? <FaThumbsUp /> : <FaRegThumbsUp />}
              <span>{post.likes?.length || 0}</span>
            </Button>

            <Button 
              variant="outline-secondary" 
              className="d-flex align-items-center gap-2"
              onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
            >
              <FaComment />
              <span>{post.comments?.length || 0}</span>
            </Button>
          </div>
        </div>
      </div>

      {showComments[post.id] && (
        <div className="mt-4">
          <h6 className="mb-3 fw-semibold text-muted">Community Perspectives</h6>
          <div className="comments">
            {post.comments?.map((comment, index) => {
              const reactionKey = `${post.id}-${comment.id}`;
              const currentReaction = commentReactions[reactionKey];

              return (
                <CommentBubble key={index}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <UserAvatar style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}>
                      {comment.author?.Name[0]}
                    </UserAvatar>
                    <div>
                      <h6 className="mb-0 fw-semibold">{comment.author?.Name}</h6>
                      <small className="text-muted">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                  <p className="mb-0">{comment.content}</p>
                  <div className="reaction-bar">
                    {REACTIONS.map((reaction) => (
                      <button
                        key={reaction}
                        className={`reaction-btn ${currentReaction === reaction ? 'active' : ''}`}
                        onClick={() => handleCommentReaction(post.id, comment.id, reaction)}
                      >
                        {reaction}
                      </button>
                    ))}
                  </div>
                </CommentBubble>
              );
            })}
          </div>

          <div className="mt-4 d-flex gap-2">
            <Form.Control
              ref={commentInputRef}
              as="textarea"
              rows={2}
              value={commentTexts[post.id] || ''}
              onChange={(e) => setCommentTexts(prev => ({
                ...prev,
                [post.id]: e.target.value
              }))}
              placeholder="Add your perspective..."
              className="flex-grow-1"
              style={{ borderRadius: '15px' }}
            />
            <Button 
              variant="primary" 
              onClick={() => handleCommentSubmit(post.id)}
              style={{ borderRadius: '15px', padding: '0.5rem 1.5rem' }}
            >
              Post
            </Button>
          </div>
        </div>
      )}
    </PostBubble>
  );

  return (
    <HubContainer>
      <ContentWrapper>
        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

        <div className="d-flex justify-content-between align-items-center mb-5 p-4 bg-white rounded-3 shadow-sm">
          <div>
            <h1 className="display-5 fw-bold mb-2 text-primary">Free Speech & The E-Chats</h1>
            <p className="lead text-muted mb-0">Community-Driven Urban Solutions</p>
          </div>
          <Button 
            variant="primary" 
            onClick={() => setShowReviewForm(true)}
            className="d-flex align-items-center gap-2 py-2 px-4 rounded-pill"
          >
            <FaPen className="fs-5" />
            <span className="d-none d-md-inline">Start Discussion</span>
          </Button>
        </div>

        {posts.map((post, index) => (
          <PostCard key={post.id} post={post} index={index} />
        ))}

        {showReviewForm && (
          <StickyReviewForm>
            <div className="position-relative">
              <Button 
                variant="link" 
                onClick={() => setShowReviewForm(false)}
                className="position-absolute top-0 end-0 p-2"
              >
                <FaTimes className="fs-5 text-secondary" />
              </Button>
              
              <h5 className="mb-4 fw-semibold text-primary">New Civic Discussion</h5>
              <Form onSubmit={handleReviewSubmit}>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Share your urban innovation idea or civic concern..."
                  className="mb-3 border-0 shadow-sm rounded-3 p-3"
                  style={{ minHeight: '120px' }}
                />
                
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex gap-2 flex-wrap">
                    {STICKERS.map((sticker, i) => (
                      <Button
                        key={i}
                        variant="outline-primary"
                        className="rounded-circle p-2"
                        onClick={() => handleStickerSelect(sticker)}
                      >
                        {sticker}
                      </Button>
                    ))}
                  </div>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="rounded-pill px-4 py-2 d-flex align-items-center gap-2"
                  >
                    <FaPaperPlane className="fs-5" />
                    Publish Idea
                  </Button>
                </div>
              </Form>
            </div>
          </StickyReviewForm>
        )}

        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" className="me-2" />
            <span className="text-muted">Loading Community Insights...</span>
          </div>
        )}
      </ContentWrapper>
    </HubContainer>
  );
};

export default ReviewSection;