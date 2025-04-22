import React, { useState, useEffect } from 'react';
import {
  Card, Form, Button, Spinner, Alert,
  Badge, Modal, ListGroup
} from 'react-bootstrap';
import {
  FaComment, FaThumbsUp, FaPaperPlane, FaUser,
  FaCalendarAlt, FaPen
} from 'react-icons/fa';
import axios from 'axios';
import styled from 'styled-components';

const HubContainer = styled.div`
  background: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 120px;
`;

const PostBubble = styled.div`
  background: ${props => props.$even ? '#DCF8C6' : '#FFFFFF'};
  border-radius: 15px;
  padding: 15px;
  margin: 10px 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  position: relative;
`;

const CommentBubble = styled.div`
  background: #f0f2f5;
  border-radius: 15px;
  padding: 10px;
  margin: 5px 0 5px 20px;
  font-size: 0.9em;
`;

const StickyReviewForm = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 20px;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`;

const ContentWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
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

  const STICKERS = ['👍', '❤️', '🚀', '💡', '🎉', '👏'];


  const  BASE_URl = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URl}/posts`);
        setPosts(response.data || []);
      } catch (err) {
        setError('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const newPost = {
        content: formData.content,
        stickers: formData.stickers,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString(),
        author: { name: "Current User" }
      };

      const response = await axios.post( `${BASE_URl}/posts`, newPost);
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
        if (post._id === postId) {
          const likes = post.likes.includes("user123") 
            ? post.likes.filter(id => id !== "user123")
            : [...post.likes, "user123"];
          return { ...post, likes };
        }
        return post;
      });
      setPosts(updatedPosts);
      await axios.patch(`${BASE_URl}/${postId}/like`, {
        userId: "user123"
      });
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
        author: { name: "Current User" },
        createdAt: new Date().toISOString()
      };

      const response = await axios.post(
        `${BASE_URl}/posts/${postId}/comments`,
        newComment
      );

      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, comments: [...post.comments, response.data] }
          : post
      ));
      setCommentTexts({ ...commentTexts, [postId]: '' });
      setSuccess('Comment posted successfully!');
    } catch (err) {
      setError('Failed to post comment');
    }
  };

  const PostCard = ({ post, index }) => (
    <PostBubble $even={index % 2 === 0}>
      <div className="d-flex align-items-center mb-2">
        <UserAvatar>
          {post.author?.name?.[0] || <FaUser />}
        </UserAvatar>
        <div className="ms-3">
          <h5 className="mb-0">{post.author?.name || 'Anonymous'}</h5>
          <small className="text-muted">
            {new Date(post.createdAt).toLocaleDateString()}
          </small>
        </div>
      </div>

      <p className="mb-2">{post.content}</p>

      {post.stickers?.length > 0 && (
        <div className="stickers mb-2">
          {post.stickers.map((sticker, i) => (
            <span key={i} className="me-2">{sticker}</span>
          ))}
        </div>
      )}

      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex gap-2">
          <Button 
            variant="link" 
            className="p-0"
            onClick={() => handleLike(post._id)}
          >
            <FaThumbsUp style={{ color: post.likes?.includes("user123") ? '#3498db' : '#6c757d' }} /> 
            {post.likes?.length || 0}
          </Button>
          <Button 
            variant="link" 
            className="p-0"
            onClick={() => setShowComments(prev => ({
              ...prev,
              [post._id]: !prev[post._id]
            }))}
          >
            {showComments[post._id] ? 'Hide Comments' : 'Show Comments'} ({post.comments?.length || 0})
          </Button>
        </div>
      </div>

      {showComments[post._id] && (
        <>
          <div className="comments mt-3">
            {post.comments?.length > 0 ? (
              post.comments.map(comment => (
                <CommentBubble key={comment._id}>
                  <div className="d-flex align-items-center mb-1">
                    <small className="fw-bold me-2">{comment.author?.name}</small>
                    <small className="text-muted">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  <p className="mb-0">{comment.content}</p>
                </CommentBubble>
              ))
            ) : (
              <small className="text-muted">No comments yet.</small>
            )}
          </div>

          <div className="comment-input mt-3">
            <Form.Control
              as="textarea"
              rows={2}
              value={commentTexts[post._id] || ''}
              onChange={(e) => setCommentTexts(prev => ({
                ...prev,
                [post._id]: e.target.value
              }))}
              placeholder="Write a comment..."
              className="mb-2"
            />
            <div className="d-flex justify-content-end gap-2">
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => setShowComments(prev => ({
                  ...prev,
                  [post._id]: false
                }))}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => handleCommentSubmit(post._id)}
              >
                Post Comment
              </Button>
            </div>
          </div>
        </>
      )}
    </PostBubble>
  );

  return (
    <HubContainer>
      <ContentWrapper>
        {error && <Alert variant="danger" dismissible>{error}</Alert>}
        {success && <Alert variant="success" dismissible>{success}</Alert>}

        <div className="mb-4 d-flex justify-content-between align-items-center">
          <h2>Community Reviews</h2>
          <Button 
            variant="primary" 
            onClick={() => setShowReviewForm(true)}
          >
            <FaPen className="me-2" /> Write Review
          </Button>
        </div>

        {posts.map((post, index) => (
          <PostCard key={post._id} post={post} index={index} />
        ))}

        {showReviewForm && (
          <StickyReviewForm>
            <Card>
              <Card.Body>
                <Form onSubmit={handleReviewSubmit}>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      content: e.target.value
                    }))}
                    placeholder="Share your experience..."
                    className="mb-2"
                  />
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex gap-2 flex-wrap">
                      {STICKERS.map((sticker, i) => (
                        <Button
                          key={i}
                          variant="outline-secondary"
                          className="p-1"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            stickers: [...prev.stickers, sticker]
                          }))}
                        >
                          {sticker}
                        </Button>
                      ))}
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-danger"
                        onClick={() => {
                          setShowReviewForm(false);
                          setFormData({ content: '', stickers: [] });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" variant="primary">
                        <FaPaperPlane /> Post
                      </Button>
                    </div>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </StickyReviewForm>
        )}

        {loading && (
          <div className="text-center p-5">
            <Spinner animation="border" variant="primary" />
          </div>
        )}
      </ContentWrapper>
    </HubContainer>
  );
};

export default ReviewSection;