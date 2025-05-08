import React, { useState, useEffect, useCallback } from 'react';
import userService from '../services/userService';
import swipeService from '../services/swipeService';
import UserCard from '../components/UserCard';
import { useAuth } from '../hooks/useAuth';
import './HomePage.css';

const HomePage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [matchMessage, setMatchMessage] = useState('');
  const { user } = useAuth(); 

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError('');
    setMatchMessage('');
    try {
      let fetchedUsers = await userService.getRecommendations();
      if (user && fetchedUsers) {
        fetchedUsers = fetchedUsers.filter(u => u.id !== user.id);
      }
      setRecommendations(fetchedUsers || []);
      setCurrentIndex(0);
    } catch (err) {
      setError(err.message || 'Failed to fetch recommendations.');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleSwipe = async (targetUserId, action) => {
    setMatchMessage('');
    try {
      const result = await swipeService.swipe(targetUserId, action);
      if (result.match) {
        setMatchMessage(`It's a match with user ID ${result.matched_user_id}!`);
      } else {
        setMatchMessage(`You ${action}d user ID ${targetUserId}.`);
      }
      if (currentIndex < recommendations.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setRecommendations([]);
        setCurrentIndex(0);
        setTimeout(() => fetchRecommendations(), 1000);
      }
    } catch (err) {
      setError(err.message || `Failed to ${action}.`);
      if (currentIndex < recommendations.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setRecommendations([]);
        setCurrentIndex(0);
        setTimeout(() => fetchRecommendations(), 1000);
      }
    }
  };

  const currentUser = recommendations[currentIndex];

  if (loading) return (
    <div className="home-page">
      <p className="loading-message">Loading recommendations...</p>
    </div>
  );

  if (error) return (
    <div className="home-page">
      <div className="error-message">
        Error: {error}
        <button className="action-button" onClick={fetchRecommendations}>Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="home-page">
      <h2 className="home-title">Find Your Match!</h2>

      {matchMessage && <div className="match-message">{matchMessage}</div>}

      <div className="card-container">
        {currentUser ? (
          <UserCard
            user={currentUser}
            onLike={(id) => handleSwipe(id, 'like')}
            onDislike={(id) => handleSwipe(id, 'dislike')}
          />
        ) : (
          <div className="empty-state">
            <p>No more users to show right now.</p>
            <button className="action-button" onClick={fetchRecommendations}>
              Refresh
            </button>
          </div>
        )}
      </div>

      <div className="bottom-nav">
      </div>
    </div>
  );
};

export default HomePage;
