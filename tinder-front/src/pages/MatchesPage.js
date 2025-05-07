import React, { useState, useEffect, useCallback } from 'react';
import swipeService from '../services/swipeService';
import MatchCard from '../components/MatchCard';

const MatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await swipeService.getMatches();
      setMatches(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch matches.');
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
        setError(err.message || 'Failed to unmatch.');
      }
    }
  };

  if (loading) return <p>Loading matches...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error} <button onClick={fetchMatches}>Try Again</button></p>;

  return (
    <div>
      <h2>Your Matches</h2>
      {matches.length > 0 ? (
        matches.map(match => (
          <MatchCard key={match.match_id} match={match} onUnmatch={handleUnmatch} />
        ))
      ) : (
        <p>No matches yet. Keep swiping!</p>
      )}
    </div>
  );
};

export default MatchesPage;