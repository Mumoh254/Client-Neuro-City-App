import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FiHeart, FiThumbsDown, FiTrendingUp, FiAlertTriangle,
  FiAward, FiBarChart2, FiUsers, FiFlag
} from 'react-icons/fi';
import { Pie, Bar } from 'react-chartjs-2';
import io from 'socket.io-client';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// Styled Components
const Container = styled.div`
  padding: 2rem;
`;

const AnalyticsContainer = styled.div`
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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

const NewsFeed = () => {

  const  BASE_URl = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";

  const [news, setNews] = useState([]);
  const [engagements, setEngagements] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [socket] = useState(() => io(`${BASE_URl}:5000`));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsRes, engagementsRes, analyticsRes] = await Promise.all([
          axios.get(`{BASE_URL/get-news`),
          axios.get(`${BASE_URl}/engagements`),
          axios.get(`${BASE_URl}/api/analytics`)
        ]);
        
        setNews(newsRes.data.map(addSentiment));
        setEngagements(engagementsRes.data);
        setAnalytics(analyticsRes.data);
      } catch (error) {
        Swal.fire('Error!', 'Failed to load data', 'error');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    socket.on('news-update', updatedPost => {
      setNews(prev => prev.map(post => 
        post.id === updatedPost.id ? addSentiment(updatedPost) : post
      ));
    });

    socket.on('engagement-update', updatedEngagement => {
      setEngagements(prev => prev.map(eng => 
        eng.id === updatedEngagement.id ? updatedEngagement : eng
      ));
    });

    socket.on('analytics-update', newAnalytics => {
      setAnalytics(newAnalytics);
    });

    return () => socket.disconnect();
  }, [socket]);

  const addSentiment = (post) => ({
    ...post,
    sentiment: calculateSentiment(post.likes.length, post.dislikes.length)
  });

  const calculateSentiment = (likes, dislikes) => {
    const total = likes + dislikes;
    if (total === 0) return 'neutral';
    const ratio = likes / total;
    return ratio > 0.7 ? 'positive' : ratio < 0.3 ? 'negative' : 'neutral';
  };

  const handleInteraction = async (type, id, option = null) => {
    try {
      await axios.post(`${BASE_URl}/${type}/${id}/react`, {
        userId: "current_user_id",
        option: option
      });
    } catch (error) {
      Swal.fire('Error!', 'Action failed', 'error');
    }
  };

  const newsChartData = {
    labels: analytics.mostLiked?.map(post => post.title),
    datasets: [{
      label: 'Approval Rating',
      data: analytics.mostLiked?.map(post => {
        const dislikedPost = analytics.mostDisliked?.find(d => d.id === post.id);
        const dislikes = dislikedPost?.dislikes || 0;
        return (post.likes / (post.likes + dislikes)) * 100;
      }),
      backgroundColor: '#10B981'
    }]
  };

  const engagementChartData = (engagement) => ({
    labels: Object.keys(engagement.options),
    datasets: [{
      label: 'Votes',
      data: Object.values(engagement.options).map(opt => 
        engagement.votes[opt]?.length || 0
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
          {analytics.mostLiked?.map(post => (
            <PriorityBadge key={post.id} color="#10B981">
              <FiAward />
              {post.title} ({Math.round(post.likes / (post.likes + post.dislikes) * 100)}%)
            </PriorityBadge>
          ))}
        </AnalyticsCard>

        <AnalyticsCard>
          <h3><FiAlertTriangle /> Community Concerns</h3>
          {analytics.mostDisliked?.map(post => (
            <PriorityBadge key={post.id} color="#EF4444">
              <FiFlag />
              {post.title} ({Math.round(post.dislikes / (post.likes + post.dislikes) * 100)}%)
            </PriorityBadge>
          ))}
        </AnalyticsCard>

        <AnalyticsCard>
          <h3><FiUsers /> Active Engagements</h3>
          <Bar data={{
            labels: engagements.map(eng => eng.title),
            datasets: [{
              label: 'Total Participants',
              data: engagements.map(eng => 
                Object.values(eng.votes).reduce((sum, votes) => sum + votes.length, 0)
              ),
              backgroundColor: '#3B82F6'
            }]
          }} />
        </AnalyticsCard>
      </AnalyticsContainer>

      <h2><FiUsers /> Active Community Decisions</h2>
      {engagements.map(engagement => (
        <NewsCard key={engagement.id}>
          <h3>{engagement.title}</h3>
          <p>{engagement.description}</p>
          <div style={{ height: '200px', margin: '1rem 0' }}>
            <Pie
              data={engagementChartData(engagement)}
              options={{ plugins: { legend: { position: 'bottom' } } }}
            />
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
      ))}

      <h2><FiFlag /> City Updates & Community Feedback</h2>
      {news.map(post => (
        <NewsCard key={post.id} sentiment={post.sentiment}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <ActionButton
              onClick={() => handleInteraction('news', post.id, 'like')}
              active={post.likes.some(like => like.userId === "current_user_id")}
              color="#10B981"
            >
              <FiHeart /> {post.likes.length}
            </ActionButton>

            <ActionButton
              onClick={() => handleInteraction('news', post.id, 'dislike')}
              active={post.dislikes.some(dislike => dislike.userId === "current_user_id")}
              color="#EF4444"
            >
              <FiThumbsDown /> {post.dislikes.length}
            </ActionButton>
          </div>

          {post.sentiment !== 'neutral' && (
            <PriorityBadge color={post.sentiment === 'positive' ? '#10B981' : '#EF4444'}>
              {post.sentiment === 'positive' ? (
                <>
                  <FiTrendingUp /> Community Approval: {Math.round((post.likes.length / (post.likes.length + post.dislikes.length)) * 100)}%
                </>
              ) : (
                <>
                  <FiAlertTriangle /> Community Concern: {Math.round((post.dislikes.length / (post.likes.length + post.dislikes.length)) * 100)}%
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
