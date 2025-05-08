import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import userService from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import ImageUpload from '../components/ImageUpload';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, updateUserContext } = useAuth(); 

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await userService.getProfile();
      setProfile(data);
      updateUserContext(data); 
    } catch (err) {
      setError(err.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, [updateUserContext]);

  useEffect(() => {

    if (user && user.id && (!profile || profile.id !== user.id)) {
        fetchProfile();
    } else if (user) {
        setProfile(user); 
        setLoading(false);
    }
  }, [user, fetchProfile, profile]);


  const handleImageUploaded = (newImage) => {
    setProfile(prevProfile => ({
      ...prevProfile,
      images: [...(prevProfile.images || []), newImage],
    }));
  };

  const handleDeleteImage = async (imageId) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await userService.deleteImage(imageId);
        setProfile(prevProfile => ({
          ...prevProfile,
          images: prevProfile.images.filter(img => img.id !== imageId),
        }));
      } catch (err) {
        setError(err.message || 'Failed to delete image.');
      }
    }
  };
  
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


  if (loading) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error} <button onClick={fetchProfile}>Try Again</button></p>;
  if (!profile) return <p>No profile data found. <button onClick={fetchProfile}>Load Profile</button></p>;

  return (
    <div className="profile-container">
      <h2 className="profile-title">My Profile</h2>
      <Link to="/profile/edit" className="edit-profile-link">Edit Profile Details</Link>

      <div className="profile-section">
  <p className="profile-detail">
    <span className="detail-label">Name:</span>
    <span className="detail-value">{profile.name}</span>
  </p>
  <p className="profile-detail">
    <span className="detail-label">Email:</span>
    <span className="detail-value">{profile.email}</span>
  </p>
  <p className="profile-detail">
    <span className="detail-label">Phone:</span>
    <span className="detail-value">{profile.phone_number}</span>
  </p>
  <p className="profile-detail">
    <span className="detail-label">Gender:</span>
    <span className="detail-value">{profile.gender}</span>
  </p>
  <p className="profile-detail">
    <span className="detail-label">Age:</span>
    <span className="detail-value">{calculateAge(profile.birth_date)} (Born: {new Date(profile.birth_date).toLocaleDateString()})</span>
  </p>
  <p className="profile-detail">
    <span className="detail-label">Sexual Orientation:</span>
    <span className="detail-value">{profile.sexual_orientation || 'Not specified'}</span>
  </p>
</div>

<div className="profile-section">
  <h3 className="section-title">Bio Details</h3>
  {profile.user_bio ? (
    <>
      <p className="profile-detail">
        <span className="detail-label">About Me:</span>
        <span className="detail-value">{profile.user_bio.bio || 'Not specified'}</span>
      </p>
      <p className="profile-detail">
        <span className="detail-label">Height:</span>
        <span className="detail-value">{profile.user_bio.height ? `${profile.user_bio.height} cm` : 'Not specified'}</span>
      </p>
      <p className="profile-detail">
        <span className="detail-label">Relationship Goals:</span>
        <span className="detail-value">{profile.user_bio.goals_relation || 'Not specified'}</span>
      </p>
      <p className="profile-detail">
        <span className="detail-label">Languages:</span>
        <span className="detail-value">{profile.user_bio.languages?.join(', ') || 'Not specified'}</span>
      </p>
      <p className="profile-detail">
        <span className="detail-label">Zodiac:</span>
        <span className="detail-value">{profile.user_bio.zodiac_sign || 'Not specified'}</span>
      </p>
      <p className="profile-detail">
        <span className="detail-label">Education:</span>
        <span className="detail-value">{profile.user_bio.education || 'Not specified'}</span>
      </p>
      <p className="profile-detail">
        <span className="detail-label">Children Preference:</span>
        <span className="detail-value">{profile.user_bio.children_preference || 'Not specified'}</span>
      </p>
      <p className="profile-detail">
        <span className="detail-label">Location:</span>
        <span className="detail-value">{profile.user_bio.location_name || 'Not specified'} ({profile.user_bio.latitude}, {profile.user_bio.longitude})</span>
      </p>
    </>
  ) : (
    <p className="detail-value">No bio information set yet.</p>
  )}
</div>


<div className="profile-section">
  <h3 className="section-title">Interests</h3>
  {profile.interests?.length > 0 ? (
    <ul className="interests-list">
      {profile.interests.map(interest => (
        <li key={interest.id} className="interest-item">
          {interest.name}
        </li>
      ))}
    </ul>
  ) : (
    <p className="detail-value">No interests added yet.</p>
  )}
</div>


      <h3>My Images</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {profile.images && profile.images.map(image => (
          <div key={image.id} style={{ border: '1px solid #ddd', padding: '5px' }}>
            <img src={image.image_path} alt={`User ${profile.name}`} style={{ width: '150px', height: '150px', objectFit: 'cover' }} />
            <button onClick={() => handleDeleteImage(image.id)} style={{display: 'block', marginTop: '5px', backgroundColor: 'salmon'}}>Delete</button>
          </div>
        ))}
      </div>
      <ImageUpload onImageUploaded={handleImageUploaded} />
    </div>
  );
};

export default ProfilePage;