// src/pages/MatchesPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import swipeService from '../services/swipeService'; // Assuming this service exists and works
import MatchCard from '../components/MatchCard'; // Assuming this component is defined
// import './MatchesPage.css'; // Optional: if you have specific styles

const MatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await swipeService.getMatches();
      // Your backend returns { matches: formattedMatches }
      // So, access data.matches
      setMatches(data.matches || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch matches.';
      setError(errorMessage);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleUnmatch = async (matchId) => {
    if (window.confirm('Are you sure you want to unmatch this user?')) {
      try {
        await swipeService.unmatch(matchId);
        setMatches(prevMatches => prevMatches.filter(m => m.match_id !== matchId));
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to unmatch.';
        setError(errorMessage); // You might want to display this error more prominently
        alert(`Error: ${errorMessage}`); // Simple alert for now
      }
    }
  };

  const handleChatWithMatch = (match) => {
    // Navigate to ChatPage and pass the match info.
    // ChatPage will use this to either find an existing conversation or setup for a new one.
    // The 'match' object from your backend 'getMatches' endpoint contains 'match_id' and 'user' (the other person).
    navigate('/chat', {
        state: {
            matchToChat: {
                match_id: match.match_id, // Crucial for sending the first message
                user: match.user // The other user's details (name, images etc.)
            }
        }
    });
  };

  if (loading) return <p>Loading matches...</p>;
  // Let MatchCard handle its own specific error rendering for unmatch if needed.
  // Global error for fetching matches is fine.
  if (error && matches.length === 0) return <p style={{ color: 'red' }}>Error: {error} <button onClick={fetchMatches}>Try Again</button></p>;


  return (
    <div className="matches-page-container" style={{ padding: '20px' }}> {/* Added basic styling for consistency */}
      <h2>Your Matches</h2>
      {error && matches.length > 0 && <p style={{ color: 'red', textAlign: 'center' }}>Notice: {error}</p>} {/* Show non-critical errors */}
      {matches.length > 0 ? (
        <div className="matches-grid"> {/* Using the class from previous CSS for layout */}
          {matches.map(match => (
            <MatchCard
              key={match.match_id}
              match={match}
              onUnmatch={handleUnmatch}
              onChat={handleChatWithMatch} // Pass the chat handler to MatchCard
            />
          ))}
        </div>
      ) : (
        <p>No matches yet. Keep swiping!</p>
      )}
    </div>
  );
};

export default MatchesPage;