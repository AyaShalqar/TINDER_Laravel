import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import userService from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import ImageUpload from '../components/ImageUpload';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, updateUserContext } = useAuth(); // Get user from context for initial state and update

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await userService.getProfile();
      setProfile(data);
      updateUserContext(data); // Keep auth context in sync
    } catch (err) {
      setError(err.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, [updateUserContext]);

  useEffect(() => {
    // If profile already in AuthContext and matches current user, use it
    // Otherwise, fetch fresh data
    if (user && user.id && (!profile || profile.id !== user.id)) {
        fetchProfile();
    } else if (user) {
        setProfile(user); // Use user from context if it's up-to-date
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


  if (loading) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error} <button onClick={fetchProfile}>Try Again</button></p>;
  if (!profile) return <p>No profile data found. <button onClick={fetchProfile}>Load Profile</button></p>;

  return (
    <div>
      <h2>My Profile</h2>
      <Link to="/profile/edit" style={{marginBottom: '20px', display: 'inline-block'}}>Edit Profile Details</Link>

      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Phone:</strong> {profile.phone_number}</p>
      <p><strong>Gender:</strong> {profile.gender}</p>
      <p><strong>Age:</strong> {calculateAge(profile.birth_date)} (Born: {new Date(profile.birth_date).toLocaleDateString()})</p>
      <p><strong>Sexual Orientation:</strong> {profile.sexual_orientation || 'Not specified'}</p>

      <h3>Bio Details</h3>
      {profile.user_bio ? (
        <>
          <p><strong>About Me:</strong> {profile.user_bio.bio || 'Not specified'}</p>
          <p><strong>Height:</strong> {profile.user_bio.height ? `${profile.user_bio.height} cm` : 'Not specified'}</p>
          <p><strong>Relationship Goals:</strong> {profile.user_bio.goals_relation || 'Not specified'}</p>
          <p><strong>Languages:</strong> {profile.user_bio.languages?.join(', ') || 'Not specified'}</p>
          <p><strong>Zodiac:</strong> {profile.user_bio.zodiac_sign || 'Not specified'}</p>
          <p><strong>Education:</strong> {profile.user_bio.education || 'Not specified'}</p>
          <p><strong>Children Preference:</strong> {profile.user_bio.children_preference || 'Not specified'}</p>
          <p><strong>Location:</strong> {profile.user_bio.location_name || 'Not specified'} ({profile.user_bio.latitude}, {profile.user_bio.longitude})</p>
        </>
      ) : (
        <p>No bio information set yet.</p>
      )}

      <h3>Interests</h3>
      {profile.interests && profile.interests.length > 0 ? (
        <ul>
          {profile.interests.map(interest => <li key={interest.id}>{interest.name}</li>)}
        </ul>
      ) : (
        <p>No interests added yet.</p>
      )}

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