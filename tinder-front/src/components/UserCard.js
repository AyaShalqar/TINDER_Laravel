import React from 'react';

const UserCard = ({ user, onLike, onDislike }) => {
  if (!user) return <p>No more users to show.</p>;

  // Helper to calculate age
  const calculateAge = (birthDateString) => {
    if (!birthDateString) return 'N/A';
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  };

  const mainImage = user.images && user.images.length > 0 ? user.images[0].image_path : 'https://via.placeholder.com/300x400?text=No+Image';

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', margin: '10px auto', maxWidth: '350px', textAlign: 'center' }}>
      <img src={mainImage} alt={user.name} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
      <h3>{user.name}, {calculateAge(user.birth_date)}</h3>
      <p><strong>Gender:</strong> {user.gender}</p>
      {user.user_bio && <p><strong>Bio:</strong> {user.user_bio.bio || 'N/A'}</p>}
      {user.user_bio && <p><strong>Location:</strong> {user.user_bio.location_name || 'N/A'}</p>}
      {user.interests && user.interests.length > 0 && (
        <p><strong>Interests:</strong> {user.interests.map(interest => interest.name).join(', ')}</p>
      )}
      <div style={{ marginTop: '15px' }}>
        <button onClick={() => onDislike(user.id)} style={{ marginRight: '10px', backgroundColor: 'red', color: 'white' }}>Dislike</button>
        <button onClick={() => onLike(user.id)} style={{ backgroundColor: 'green', color: 'white' }}>Like</button>
      </div>
    </div>
  );
};

export default UserCard;