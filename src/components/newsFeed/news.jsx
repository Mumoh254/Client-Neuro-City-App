import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FiHeart, FiThumbsDown, FiChevronUp, FiTrendingUp, FiChevronDown, 
  FiShare, FiAlertTriangle, FiAward, FiBarChart2, FiUsers, FiFlag,
  FiClock, FiFileText, FiFolder, FiUser, FiLink, FiExternalLink
} from 'react-icons/fi';

import { Pie, Bar } from 'react-chartjs-2';
import io from 'socket.io-client';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { getUserIdFromToken } from '../handler/tokenDecoder';

Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// Styled Components
const Container = styled.div`
  padding: 1rem;
`;
const MediaContainer = styled.div`
  margin: 1rem 0;
  img {
    width: 100%;
    border-radius: 8px;
    max-height: 400px;
    object-fit: cover;
  }
`;

const SocialLinksContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  a {
    color: #3B82F6;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;
const AnalyticsContainer = styled.div`
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;


const ExpandButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #3B82F6;
  cursor: pointer;
  padding: 0.5rem;
  margin-top: 1rem;
`;

const AnalyticsCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const PriorityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: ${props => props.color}15;
  border-radius: 8px;
  margin: 0.5rem 0;
`;

const NewsCard = styled.div`
  background: ${({ sentiment }) =>
    sentiment === 'positive' ? '#ECFDF5' :
    sentiment === 'negative' ? '#FEF2F2' :
    '#F9FAFB'};
  border-left: 5px solid ${({ sentiment }) =>
    sentiment === 'positive' ? '#10B981' :
    sentiment === 'negative' ? '#EF4444' : '#D1D5DB'};
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: ${({ active, color }) => active ? color : '#E5E7EB'};
  color: ${({ active }) => active ? 'white' : '#374151'};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;
const ShareButton = styled.button`
  display: flex;
  align-items: center;

  gap: 0.5rem;  // Smaller gap between the icon and text
  padding: 0.5rem 1rem;  // Reduced padding
  font-size: 0.875rem;  // Smaller font size
  background-color: #3b82f6;  // Your preferred color
  color: white;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #2563eb;  // Darker color on hover
  }

  svg {
    font-size: 1rem;  // Adjust icon size if needed
  }
`;



const ExpandedContent = styled.div`
  margin-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
`;

const NewsImage = styled.img`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  display: block;
  border-radius: 12px;
  cursor: zoom-in;
  transition: transform 0.2s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);

  &:hover {
    transform: scale(1.02);
  }
`;

const ContentSection = styled.div`
  padding: 1rem 0;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.5rem 0;
  color: #4b5563;
  font-size: 0.95rem;

  svg {
    flex-shrink: 0;
    color: #6b7280;
  }
`;

const MetaGrid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
`;

const InteractionStats = styled.div`
  display: flex;
  gap: 1rem;
  margin: 1.5rem 0;
`;

const StatBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border-radius: 20px;
  font-weight: 500;
`;

const SocialLinksSection = styled.div`
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
`;

const LinkGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const LinkChip = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #3b82f610;
  color: #3b82f6;
  border-radius: 20px;
  text-decoration: none;
  transition: all 0.2s;
  border: 1px solid #3b82f620;

  &:hover {
    background: #3b82f620;
    transform: translateY(-1px);
  }

  svg {
    color: inherit;
  }
`;

const ContentText = styled.p`
  line-height: 1.6;
  color: #374151;
  margin: 0.5rem 0 0 2rem;
  white-space: pre-wrap;
`;

const NewsFeed = () => {
  const BASE_URL = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";
  const SOCKET_URL = "https://neuro-apps-api-express-js-production-redy.onrender.com";



   const [userId, setUserId] = useState(null);
    
      useEffect(() => {
        const userId = getUserIdFromToken();
        setUserId(userId);
    
      }, []);
    
  

  const [news, setNews] = useState([]);
  const [engagements, setEngagements] = useState([]);
  const [analytics, setAnalytics] = useState({});
  console.log(analytics)
  const [loading, setLoading] = useState(true);
  const socket = io(SOCKET_URL);



// toggle onClick


  useEffect(() => {
    const fetchData = async () => {
      try {
        const newsRes = await axios.get(`${BASE_URL}/get-news`);
        const fetchedNews = Array.isArray(newsRes.data) ? newsRes.data : [];
  
        const newsWithSentiment = fetchedNews.map(post => ({
          ...post,
          likes: post.feedsLikes || [],
          dislikes: post.commentFeeds || [],
          sentiment: calculateSentiment(post.feedsLikes?.length || 0, post.commentFeeds?.length || 0)
        }));
  
        setNews(newsWithSentiment);
        console.log("✅ News loaded:", newsWithSentiment);
  
        // Fetch engagements & analytics
        const [engagementsRes, analyticsRes] = await Promise.all([
          axios.get(`${BASE_URL}/engagements`),
          axios.get(`${BASE_URL}/get-comprehensive-analytics`)
        ]);
  
        setEngagements(engagementsRes.data || []);
        console.log(engagementsRes.data);
        setAnalytics(analyticsRes.data || {});
        console.log(analyticsRes.data)
      } catch (error) {
       
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const analyticsRes = await axios.get(`${BASE_URL}/get-comprehensive-analytics`);
        setAnalytics(analyticsRes.data || {});
        console.log("📊 Analytics loaded:", analyticsRes.data);
      } catch (error) {
        Swal.fire("Error", "Failed to load analytics data", "error");
        console.error("❌ Error loading analytics:", error);
      }
    };
  
    fetchAnalytics();
  }, []);
  
  // Add sentiment field to post
  const addSentiment = (post) => ({
    ...post,
    sentiment: calculateSentiment(post.likes?.length || 0, post.dislikes?.length || 0)
  });

  const calculateSentiment = (likes, dislikes) => {
    const total = likes + dislikes;
    if (total === 0) return 'neutral';
    const ratio = likes / total;
    return ratio > 0.7 ? 'positive' : ratio < 0.3 ? 'negative' : 'neutral';
  };

  const handleInteraction = async (type, id, option = null) => {
    try {
      await axios.post(`${BASE_URL}/like-news/${parseInt(id)}/like`, {
        userId,
        option,
      });
  
      // Update frontend state
      setNews(prevNews =>
        prevNews.map(post => {
          if (post.id !== id) return post;
  
          const alreadyLiked = post.likes.some(like => like.userId === userId);
          const alreadyDisliked = post.dislikes?.some(dislike => dislike.userId === userId);
  
          // Handle "like"
          if (option === 'like') {
            return {
              ...post,
              likes: alreadyLiked
                ? post.likes.filter(like => like.userId !== userId) // toggle off
                : [...post.likes, { userId }],
              dislikes: alreadyDisliked
                ? post.dislikes.filter(dislike => dislike.userId !== userId)
                : post.dislikes || [],
            };
          }
  
          // Handle "dislike"
          if (option === 'dislike') {
            return {
              ...post,
              dislikes: alreadyDisliked
                ? post.dislikes.filter(dislike => dislike.userId !== userId) // toggle off
                : [...(post.dislikes || []), { userId }],
              likes: alreadyLiked
                ? post.likes.filter(like => like.userId !== userId)
                : post.likes,
            };
          }
  
          return post;
        })
      );
  
    } catch (error) {
      Swal.fire('Error!', 'Interaction failed', 'error');
      console.error("Interaction error:", error);
    }
  };
  

 
  const [expandedPost, setExpandedPost] = useState(null);

  const handleShare = async (post) => {
    try {
      const shareData = {
        title: post.title,
        text: post.content,
        url: window.location.href
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        Swal.fire('Link copied!', 'Share this news using the link', 'success');
      }
    } catch (error) {
      console.error('Sharing failed:', error);
    }
  };

  const toggleExpand = (postId) => {
    setExpandedPost(expandedPost === postId ? null : postId);
  };  

  
  const newsChartData = {
    labels: analytics.mostLiked?.map(post => post.title) || [],
    datasets: [{
      label: 'Approval Rating',
      data: analytics.mostLiked?.map(post => {
        const total = post.likes + post.dislikes;
        return total > 0 ? Math.round((post.likes / total) * 100) : 0;
      }) || [],
      backgroundColor: '#10B981'
    }]
  };
  
  
  {analytics?.mostLiked?.map(post => {
    const likes = post.likes || 0;
    const dislikes = post.dislikes || 0;
    const total = likes + dislikes;
    const percentage = total > 0 ? Math.round((likes / total) * 100) : 0;
  
    return (
      <PriorityBadge key={post.id} color="#10B981">
        <FiAward />
        {post.title.trim()} ({percentage}%)
      </PriorityBadge>
    );
  })}
  
  const engagementChartData = (engagement) => ({
    labels: Object.keys(engagement.options || {}),
    datasets: [{
      label: 'Votes',
      data: Object.keys(engagement.options || {}).map(opt =>
        engagement.votes?.[opt]?.length || 0
      ),
      backgroundColor: ['#6366f1', '#10b981', '#f59e0b']
    }]
  });
  

  return (
    <Container>
      <h2><FiBarChart2 /> Community Priorities Dashboard</h2>
      <AnalyticsContainer>
      <AnalyticsCard>
          <h3><FiTrendingUp /> Top Approved Initiatives</h3>
          {analytics.mostLiked?.map(post => {
            const likes = post.likes || 0;
            const dislikes = post.dislikes || 0;
            const total = likes + dislikes;
            const percentage = total > 0 ? Math.round((likes / total) * 100) : 0;
            return (
              <PriorityBadge key={post.id} color="#10B981">
                <FiAward />
                {post.title.trim()} ({percentage}%)
              </PriorityBadge>
            );
          })}
        </AnalyticsCard>

        <AnalyticsCard>
  <h3><FiAlertTriangle /> Community Concerns</h3>
  {analytics.mostDisliked?.map(post => {
    const likes = post.likes || 0;
    const dislikes = post.dislikes || 0;
    const total = likes + dislikes;
    const percentage = total > 0 ? Math.round((dislikes / total) * 100) : 0;
    
    return (
      <PriorityBadge key={post.id} color="#EF4444">
        <FiFlag />
        {post.title.trim()} ({percentage}%)
      </PriorityBadge>
    );
  })}
</AnalyticsCard>

      
      </AnalyticsContainer>

      <h2><FiUsers /> Active Community Decisions</h2>
    {engagements.length > 0 ? (
  engagements.map(engagement => (
    <NewsCard key={engagement.id}>
      <h3>{engagement.title}</h3>
      <p>{engagement.description}</p>
      <div style={{ height: '200px', margin: '1rem 0' }}>
        <Pie data={engagementChartData(engagement)} options={{ plugins: { legend: { position: 'bottom' } } }} />
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {Object.entries(engagement.options).map(([key, label]) => (
          <ActionButton
            key={key}
            onClick={() => handleInteraction('engagements', engagement.id, key)}
            active={engagement.votes[key]?.includes("current_user_id")}
            color="#3B82F6"
          >
            {label} ({engagement.votes[key]?.length || 0})
          </ActionButton>
        ))}
      </div>
    </NewsCard>
  ))
) : (
  <p>No active engagements available</p>
)}

      <h2><FiFlag /> City Updates & Community Feedback</h2>
      {news.map(post => (
  <NewsCard key={post.id} sentiment={post.sentiment}>
    <h3>{post.title}</h3>
    <p>{post.content}</p>

    {expandedPost === post.id && (
  <ExpandedContent>
    {/* Image with constrained size */}
    {post.media?.image && (
      <MediaContainer>
        <NewsImage 
          src={post.media.image} 
          alt={post.title}
          onClick={() => window.open(post.media.image, '_blank')}
        />
      </MediaContainer>
    )}

    {/* Content Section */}
    <ContentSection>
      <DetailItem>
        <FiFileText />
        <strong>Content:</strong>
        <ContentText>{post.content}</ContentText>
      </DetailItem>

      <MetaGrid>
        {post.category && (
          <DetailItem>
            <FiFolder />
            <strong>Category:</strong>
            <span>{post.category}</span>
          </DetailItem>
        )}

        {post.author?.Name && (
          <DetailItem>
            <FiUser />
            <strong>Author:</strong>
            <span>{post.author.Name}</span>
          </DetailItem>
        )}

        {post.createdAt && (
          <DetailItem>
            <FiClock />
            <strong>Posted:</strong>
            <span>{new Date(post.createdAt).toLocaleString()}</span>
          </DetailItem>
        )}
      </MetaGrid>

      <InteractionStats>
        <StatBadge>
          <FiHeart />
          {post.feedsLikes?.length || 0} Likes
        </StatBadge>
        <StatBadge>
          <FiThumbsDown />
          {post.FeedsDislike?.length || 0} Dislikes
        </StatBadge>
      </InteractionStats>

      {post.socialLinks && Object.entries(post.socialLinks).length > 0 && (
        <SocialLinksSection>
          <strong><FiLink /> Related Links:</strong>
          <LinkGrid>
            {Object.entries(post.socialLinks).map(([key, value]) => (
              <LinkChip 
                key={key}
                href={value} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <FiExternalLink />
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </LinkChip>
            ))}
          </LinkGrid>
        </SocialLinksSection>
      )}
    </ContentSection>
  </ExpandedContent>
)}


    
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <ActionButton
          onClick={() => handleInteraction('news', post.id, 'like')}
          active={post.likes.some(like => like.userId === userId)}
          color="#10B981"
        >
          <FiHeart /> {post.likes.length}
        </ActionButton>

        <ActionButton
          onClick={() => handleInteraction('news', post.id, 'dislike')}
          active={post.dislikes?.some(dislike => dislike.userId === userId)}
          color="#EF4444"
        >
          <FiThumbsDown /> {post.dislikes?.length || 0}
        </ActionButton>
      </div>

      <div style={{ }}>
      <ShareButton onClick={() => handleShare(post)}>
    <FiShare /> Share
  </ShareButton>
        <ExpandButton onClick={() => toggleExpand(post.id)}>
          {expandedPost === post.id ? (
            <>
              <FiChevronUp /> View Less
            </>
          ) : (
            <>
              <FiChevronDown /> View More
            </>
          )}
        </ExpandButton>
      </div>
    </div>

    {post.sentiment !== 'neutral' && (
      <PriorityBadge color={post.sentiment === 'positive' ? '#10B981' : '#EF4444'}>
        {post.sentiment === 'positive' ? (
          <>
            <FiTrendingUp /> Community Approval:{' '}
            {Math.round(
              (post.likes.length /
                (post.likes.length + post.dislikes.length || 1)) * 100
            )}%
          </>
        ) : (
          <>
            <FiAlertTriangle /> Community Concern:{' '}
            {Math.round(
              (post.dislikes.length /
                (post.likes.length + post.dislikes.length || 1)) * 100
            )}%
          </>
        )}
      </PriorityBadge>
    )}
  </NewsCard>
))}

</Container>
  );
};

export default NewsFeed;
