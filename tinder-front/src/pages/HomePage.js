import React, { useState, useEffect, useCallback } from 'react';
import userService from '../services/userService';
import swipeService from '../services/swipeService';
import UserCard from '../components/UserCard';
import { useAuth } from '../hooks/useAuth';

const HomePage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [matchMessage, setMatchMessage] = useState('');
  const { user } = useAuth(); // Get current user for potential filtering

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError('');
    setMatchMessage('');
    try {
      let fetchedUsers = await userService.getRecommendations();
      // Filter out the current user from recommendations, if backend doesn't do it
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
  }, [user]); // Add user as dependency

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleSwipe = async (targetUserId, action) => {
    setMatchMessage(''); // Clear previous match message
    try {
      const result = await swipeService.swipe(targetUserId, action);
      if (result.match) {
        setMatchMessage(`It's a match with user ID ${result.matched_user_id}!`);
        // You might want to fetch the matched user's details to show their name
      } else {
        setMatchMessage(`You ${action}d user ID ${targetUserId}.`);
      }
      // Move to next user or show message if no more users
      if (currentIndex < recommendations.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Out of users, maybe fetch more or show a message
        setRecommendations([]); // Clear current list
        setCurrentIndex(0);
        // Optionally, re-fetch recommendations after a delay or on user action
         setTimeout(() => fetchRecommendations(), 1000); // Re-fetch after a short delay
      }
    } catch (err) {
      setError(err.message || `Failed to ${action}.`);
       // If swipe fails (e.g., already swiped), still move to next if possible
      if (currentIndex < recommendations.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setRecommendations([]);
        setCurrentIndex(0);
        setTimeout(() => fetchRecommendations(), 1000);
      }
    }
  };

  if (loading) return <p>Loading recommendations...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error} <button onClick={fetchRecommendations}>Try Again</button></p>;

  const currentUser = recommendations[currentIndex];

  return (
    <div>
      <h2>Find Your Match!</h2>
      {matchMessage && <p style={{ color: 'blue', fontWeight: 'bold' }}>{matchMessage}</p>}
      {currentUser ? (
        <UserCard
          user={currentUser}
          onLike={(id) => handleSwipe(id, 'like')}
          onDislike={(id) => handleSwipe(id, 'dislike')}
        />
      ) : (
        <p>No more users to show right now. Check back later! <button onClick={fetchRecommendations}>Refresh</button></p>
      )}
    </div>
  );
};

export default HomePage;