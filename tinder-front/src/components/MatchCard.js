import React from 'react';
// import './MatchCard.css'; 

const MatchCard = ({ match, onUnmatch, onChat }) => {
  if (!match || !match.user) {
    return <div className="match-card error">Invalid match data</div>;
  }

  const user = match.user;
  const imageUrl = user.images && user.images.length > 0 ? user.images[0].image_path : 'https://via.placeholder.com/150?text=No+Image';

  return (
    <div className="match-card" style={cardStyle}>
      <img src={imageUrl} alt={user.name} style={imageStyle} />
      <h3 style={{ marginTop: '10px', marginBottom: '5px' }}>{user.name}</h3>
      <p style={{ fontSize: '0.9em', color: '#555', marginBottom: '15px' }}>
        Matched on: {new Date(match.created_at).toLocaleDateString()}
      </p>
      <div className="match-card-actions" style={{ display: 'flex', justifyContent: 'space-around' }}>
        <button onClick={() => onChat(match)} style={buttonStyle}>
          Chat
        </button>
        <button onClick={() => onUnmatch(match.match_id)} style={{ ...buttonStyle, backgroundColor: '#dc3545' }}>
          Unmatch
        </button>
      </div>
    </div>
  );
};


const cardStyle = {
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '15px',
  textAlign: 'center',
  backgroundColor: '#fff',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  margin: '10px',
  width: '250px', 
};

const imageStyle = {
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  objectFit: 'cover',
  marginBottom: '10px',
};

const buttonStyle = {
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  padding: '8px 15px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '0.9em',
  transition: 'background-color 0.2s',
};


export default MatchCard;