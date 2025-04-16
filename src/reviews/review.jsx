import React, { useEffect, useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { 
  FaComment, 
  FaThumbsUp, 
  FaUser, 
  FaPaperPlane, 
  FaRegSmileBeam, 
  FaCaretDown, 
  FaCaretUp 
} from 'react-icons/fa';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import Swal from 'sweetalert2';
import 'sweetalert2/src/sweetalert2.scss';
import styled, { createGlobalStyle } from 'styled-components';

// Global styles for overall app look
const GlobalStyles = createGlobalStyle`
  body {
    font-family: 'Segoe UI', sans-serif;
    background: #f0f2f5;
  }
`;

// Styled components
const PostCard = styled(Card)`
  border: none;
  border-radius: 15px;
  margin-bottom: 1rem;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const UserAvatar = styled.div`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: #1877f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: bold;
  font-size: 1rem;
`;

const StickyNav = styled.div`
  position: sticky;
  top: 0;
  background: #fff;
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;
  z-index: 1000;
`;

const StickyBottomForm = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 10px;
  border-top: 1px solid #e0e0e0;
  z-index: 1000;
`;

const PostInput = styled(Form.Control)`
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  &:focus {
    border-color: #1877f2;
    box-shadow: none;
  }
`;

const GradientButton = styled(Button)`
  background: #1877f2;
  border: none;
  &:hover {
    background: #1558b0;
  }
`;

const EmojiPickerContainer = styled.div`
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  margin-top: 5px;
`;

const StickerPickerContainer = styled.div`
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  margin-top: 5px;
  img {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: border 0.2s;
    &:hover {
      border: 1px solid #1877f2;
    }
  }
`;

const TimeStamp = ({ date }) => (
  <small style={{ color: '#6c757d' }}>
    {formatDistanceToNow(new Date(date), { addSuffix: true })}
  </small>
);

const CommentContainer = styled.div`
  background: #f9f9f9;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 8px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const CommentDisplay = ({ comment }) => (
  <CommentContainer>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
      <UserAvatar style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
        {comment.author?.name?.charAt(0) || 'C'}
      </UserAvatar>
      <div style={{ marginLeft: '8px', fontWeight: '600' }}>
        {comment.author?.name || 'Anonymous'}
      </div>
      <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#6c757d' }}>
        <TimeStamp date={comment.createdAt} />
      </div>
    </div>
    <div style={{ fontSize: '0.9rem', color: '#333' }}>
      {comment.content}
    </div>
  </CommentContainer>
);

const Post = ({
  post,
  handleLike,
  handleComment,
  commentContent,
  setCommentContent,
  showEmojiPicker,
  toggleEmojiPicker,
  handleEmojiClick,
  showStickerPicker,
  toggleStickerPicker,
  handleStickerClick,
  showComments,
  toggleComments,
  visibleComments
}) => {
  const commentCount = post.comments?.length || 0;
  const displayedComments = visibleComments[post.id] 
    ? post.comments 
    : post.comments?.slice(0, 3);

  return (
    <PostCard>
      <Card.Body>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <UserAvatar>{post.author?.name?.charAt(0) || 'N'}</UserAvatar>
          <div style={{ marginLeft: '10px' }}>
            <div style={{ fontWeight: '600', color: '#333' }}>
              {post.author?.name || 'Nairobi Citizen'}
            </div>
            <TimeStamp date={post.createdAt} />
          </div>
        </div>
        {/* Content */}
        <div style={{ marginBottom: '15px', color: '#333', fontSize: '1rem' }}>
          {post.content}
        </div>
        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#6c757d', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FaThumbsUp style={{ marginRight: '4px' }} />
            <span style={{ marginRight: '12px' }}>{post.likes?.length || 0}</span>
            <FaComment style={{ marginRight: '4px' }} />
            <span>{commentCount}</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <GradientButton 
              variant="outline-primary"
              size="sm"
              onClick={() => handleLike(post.id)}
              style={{ borderRadius: '20px' }}
            >
              Like
            </GradientButton>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={() => toggleComments(post.id)}
              style={{ borderRadius: '20px' }}
            >
              {showComments[post.id] ? <FaCaretUp /> : <FaCaretDown />} Comments
            </Button>
          </div>
        </div>
        {/* Comments Section */}
        {showComments[post.id] && (
          <div style={{ marginBottom: '15px' }}>
            {commentCount > 0 && (
              <h6 style={{ marginBottom: '15px', fontWeight: '600', color: '#1877f2' }}>
                Comments ({commentCount})
              </h6>
            )}
            {displayedComments?.map(comment => (
              <CommentDisplay key={comment.id} comment={comment} />
            ))}
            {commentCount > 3 && !visibleComments[post.id] && (
              <Button 
                variant="link" 
                onClick={() => toggleComments(post.id)}
                style={{ textDecoration: 'none', color: '#1877f2', padding: '0' }}
              >
                View more comments...
              </Button>
            )}
            <Form onSubmit={(e) => { e.preventDefault(); handleComment(post.id); }}>
              <Row className="align-items-center">
                <Col>
                  <div className="position-relative">
                    <Form.Control
                      type="text"
                      value={commentContent[post.id] || ''}
                      onChange={(e) => setCommentContent({
                        ...commentContent,
                        [post.id]: e.target.value
                      })}
                      placeholder="Write your comment..."
                      style={{ 
                        border: '1px solid #e0e0e0',
                        borderRadius: '20px',
                        padding: '10px 20px'
                      }}
                    />
                    <FaRegSmileBeam 
                      className="position-absolute"
                      style={{ right: '20px', top: '10px', cursor: 'pointer', fontSize: '1.2rem', color: '#6c757d' }}
                      onClick={() => toggleEmojiPicker(post.id)}
                    />
                    <Button
                      variant="link"
                      className="position-absolute"
                      style={{ right: '60px', top: '8px', padding: '0' }}
                      onClick={() => toggleStickerPicker(post.id)}
                    >
                      <img 
                        src="https://img.icons8.com/emoji/48/000000/sticker-emoji.png" 
                        alt="Sticker" 
                        style={{ width: '24px', height: '24px' }}
                      />
                    </Button>
                  </div>
                  {showEmojiPicker[post.id] && (
                    <EmojiPickerContainer>
                      {["❤️", "💔", "😂", "👻", "👍", "😄", "😍", "🎉", "🙏", "🔥", "😢", "🚀"].map((emoji, index) => (
                        <span
                          key={index}
                          style={{ cursor: 'pointer', fontSize: '1.5rem' }}
                          onClick={() => handleEmojiClick(post.id, emoji)}
                        >
                          {emoji}
                        </span>
                      ))}
                    </EmojiPickerContainer>
                  )}
                  {showStickerPicker[post.id] && (
                    <StickerPickerContainer>
                      {[
                        "https://img.icons8.com/emoji/48/000000/red-heart.png",
                        "https://img.icons8.com/emoji/48/000000/green-heart.png",
                        "https://img.icons8.com/emoji/48/000000/smiling-face-with-sunglasses.png",
                        "https://img.icons8.com/emoji/48/000000/thumbs-up.png"
                      ].map((stickerUrl, index) => (
                        <img
                          key={index}
                          src={stickerUrl}
                          alt="sticker"
                          onClick={() => handleStickerClick(post.id, stickerUrl)}
                        />
                      ))}
                    </StickerPickerContainer>
                  )}
                </Col>
                <Col xs="auto">
                  <GradientButton 
                    type="submit"
                    className="d-flex align-items-center"
                    style={{ borderRadius: '20px', padding: '10px 20px' }}
                  >
                    <FaPaperPlane className="me-2" />
                    Send
                  </GradientButton>
                </Col>
              </Row>
            </Form>
          </div>
        )}
      </Card.Body>
    </PostCard>
  );
};

const ReviewsSection = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [commentContent, setCommentContent] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState({});
  const [showStickerPicker, setShowStickerPicker] = useState({});
  const [showComments, setShowComments] = useState({});
  const [visibleComments, setVisibleComments] = useState({});
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE = 'http://localhost:8000/apiV1/smartcity-ke';

  const sortPosts = (posts) => {
    switch (sortBy) {
      case 'likes':
        return [...posts].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
      case 'comments':
        return [...posts].sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
      default:
        return posts;
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const response = await axios.post(`${API_BASE}/posts`, {
        content: newPost,
        userId: "smart_ke_WT_318784939",
      });
      setPosts([response.data, ...posts]);
      setNewPost('');
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await axios.put(`${API_BASE}/${postId}/like`, {
        userId: "smart_ke_WT_318784939",
      });
      setPosts(posts.map(post =>
        post.id === postId ? { ...post, likes: response.data.likes } : post
      ));
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleComment = async (postId) => {
    const content = commentContent[postId]?.trim();
    if (!content) return;

    try {
      const response = await axios.post(`${API_BASE}/${postId}/comments`, {
        content,
        userId: "smart_ke_WT_318784939",
      });
      setPosts(posts.map(post =>
        post.id === postId ? { ...post, comments: [...post.comments, response.data] } : post
      ));
      setCommentContent({ ...commentContent, [postId]: '' });
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const toggleEmojiPicker = (postId) => {
    setShowEmojiPicker({
      ...showEmojiPicker,
      [postId]: !showEmojiPicker[postId],
    });
  };

  const toggleStickerPicker = (postId) => {
    setShowStickerPicker({
      ...showStickerPicker,
      [postId]: !showStickerPicker[postId],
    });
  };

  const toggleComments = (postId) => {
    setShowComments({
      ...showComments,
      [postId]: !showComments[postId],
    });

    if (!visibleComments[postId]) {
      setVisibleComments({
        ...visibleComments,
        [postId]: true,
      });
    }
  };

  const handleEmojiClick = (postId, emoji) => {
    setCommentContent({
      ...commentContent,
      [postId]: (commentContent[postId] || '') + emoji,
    });
  };

  const handleStickerClick = (postId, stickerUrl) => {
    setCommentContent({
      ...commentContent,
      [postId]: (commentContent[postId] || '') + ` [sticker:${stickerUrl}] `,
    });
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${API_BASE}/posts`);
        setPosts(response.data || []);
      } catch (err) {
        setError('Failed to load posts');
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) return (
    <div className="text-center py-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-2">Loading feedback...</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-5 text-danger">
      <FaComment size={32} className="mb-3" />
      <p>{error}</p>
    </div>
  );

  return (
    <Container className="reviews-section my-5" style={{ maxWidth: '800px', paddingBottom: '120px' }}>
      <StickyNav>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h2 className="text-primary fw-bold d-flex align-items-center mb-0">
            <div className="icon-wrapper bg-primary rounded-circle me-3" style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaComment size={28} className="text-white" />
            </div>
            Nairobi
          </h2>
          <div className="d-flex gap-2">
            <Button
              variant={sortBy === 'recent' ? 'primary' : 'outline-primary'}
              onClick={() => setSortBy('recent')}
              className="rounded-pill"
            >
              Newest
            </Button>
            <Button
              variant={sortBy === 'likes' ? 'primary' : 'outline-primary'}
              onClick={() => setSortBy('likes')}
              className="rounded-pill"
            >
              Most Liked
            </Button>
            <Button
              variant={sortBy === 'comments' ? 'primary' : 'outline-primary'}
              onClick={() => setSortBy('comments')}
              className="rounded-pill"
            >
              Most Comments
            </Button>
          </div>
        </div>
      </StickyNav>

      {posts.length === 0 ? (
        <div className="text-center py-5 bg-light rounded-3">
          <FaComment size={48} className="text-muted mb-3" />
          <h5 className="text-muted">No feedback yet. Be the first to share!</h5>
        </div>
      ) : (
        sortPosts(posts).map(post => (
          <Post 
            key={post.id} 
            post={post} 
            handleLike={handleLike}
            handleComment={handleComment}
            commentContent={commentContent}
            setCommentContent={setCommentContent}
            showEmojiPicker={showEmojiPicker}
            toggleEmojiPicker={toggleEmojiPicker}
            handleEmojiClick={handleEmojiClick}
            showStickerPicker={showStickerPicker}
            toggleStickerPicker={toggleStickerPicker}
            handleStickerClick={handleStickerClick}
            showComments={showComments}
            toggleComments={toggleComments}
            visibleComments={visibleComments}
          />
        ))
      )}

      <StickyBottomForm>
        <PostCard className="border-0 shadow-lg">
          <Card.Body className="bg-light rounded-3">
            <Form onSubmit={handleSubmitPost}>
              <Form.Group>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share your thoughts about city services..."
                  className="mb-3 fs-5 border-0 bg-white shadow-sm post-textarea"
                  style={{ borderRadius: '15px' }}
                />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <GradientButton 
                  type="submit"
                  className="rounded-pill px-4 py-2 d-flex align-items-center"
                >
                  <FaPaperPlane className="me-2" />
                  Post Feedback
                </GradientButton>
              </div>
            </Form>
          </Card.Body>
        </PostCard>
      </StickyBottomForm>

      <GlobalStyles />

      <style jsx>{`
        .reviews-section {
          margin-top: 2rem;
        }
        .post-textarea {
          resize: none;
        }
        .icon-wrapper {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        /* Make analytics modal scrollable if content overflows */
        .analytics-modal {
          max-height: 90vh;
          overflow-y: auto;
        }
        /* Sticky nav adjustments */
        .sticky-nav {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: white;
          padding: 1rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
      `}</style>
    </Container>
  );
};

export default ReviewsSection;
