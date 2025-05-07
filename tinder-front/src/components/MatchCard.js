import React from 'react';

const MatchCard = ({ match, onUnmatch }) => {
  const { user } = match; // User is the other person in the match
  const mainImage = user.images && user.images.length > 0 ? user.images[0].image_path : 'https://via.placeholder.com/100';

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px', display: 'flex', alignItems: 'center' }}>
      <img src={mainImage} alt={user.name} style={{ width: '80px', height: '80px', borderRadius: '50%', marginRight: '15px', objectFit: 'cover' }} />
      <div>
        <h4>{user.name}</h4>
        <p>Matched on: {new Date(match.created_at).toLocaleDateString()}</p>
        <button onClick={() => onUnmatch(match.match_id)} style={{backgroundColor: 'orange', color: 'white'}}>Unmatch</button>
      </div>
    </div>
  );
};

export default MatchCard;