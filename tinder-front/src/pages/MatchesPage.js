import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; 
import swipeService from '../services/swipeService'; 
import MatchCard from '../components/MatchCard'; 

const MatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await swipeService.getMatches();

      setMatches(data || []);
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
        setError(errorMessage); 
        alert(`Error: ${errorMessage}`); 
      }
    }
  };

  const handleChatWithMatch = (match) => {
    navigate('/chat', {
        state: {
            matchToChat: {
                match_id: match.match_id, 
                user: match.user
            }
        }
    });
  };

  if (loading) return <p>Loading matches...</p>;

  if (error && matches.length === 0) return <p style={{ color: 'red' }}>Error: {error} <button onClick={fetchMatches}>Try Again</button></p>;


  return (
    <div className="matches-page-container" style={{ padding: '20px' }}> 
      <h2>Your Matches</h2>
      {error && matches.length > 0 && <p style={{ color: 'red', textAlign: 'center' }}>Notice: {error}</p>} 
      {matches.length > 0 ? (
        <div className="matches-grid"> 
          {matches.map(match => (
            <MatchCard
              key={match.match_id}
              match={match}
              onUnmatch={handleUnmatch}
              onChat={handleChatWithMatch} 
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