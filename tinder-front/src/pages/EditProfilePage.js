import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import { useAuth } from '../hooks/useAuth';

const EditProfilePage = () => {
  const { user, updateUserContext } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    email: '',
    gender: '',
    sexual_orientation: '',
    birth_date: '',
    // Bio fields
    bio: '',
    height: '',
    goals_relation: '',
    languages: '', // Store as comma-separated string for input
    zodiac_sign: '',
    education: '',
    children_preference: '',
    latitude: '',
    longitude: '',
    location_name: '',
  });
  const [allInterests, setAllInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const profileData = await userService.getProfile(); // Fetches user with bio, images, interests
      setFormData({
        name: profileData.name || '',
        phone_number: profileData.phone_number || '',
        email: profileData.email || '',
        gender: profileData.gender || 'male',
        sexual_orientation: profileData.sexual_orientation || 'straight',
        birth_date: profileData.birth_date ? profileData.birth_date.split('T')[0] : '', // Format for date input
        bio: profileData.user_bio?.bio || '',
        height: profileData.user_bio?.height || '',
        goals_relation: profileData.user_bio?.goals_relation || '',
        languages: profileData.user_bio?.languages?.join(', ') || '',
        zodiac_sign: profileData.user_bio?.zodiac_sign || '',
        education: profileData.user_bio?.education || '',
        children_preference: profileData.user_bio?.children_preference || '',
        latitude: profileData.user_bio?.latitude || '',
        longitude: profileData.user_bio?.longitude || '',
        location_name: profileData.user_bio?.location_name || '',
      });
      setSelectedInterests(new Set(profileData.interests?.map(i => i.id) || []));
      const availableInterests = await userService.getAllAvailableInterests();
      setAllInterests(availableInterests);
    } catch (err) {
      setError(err.message || 'Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInterestChange = (interestId) => {
    setSelectedInterests(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(interestId)) {
        newSelected.delete(interestId);
      } else {
        newSelected.add(interestId);
      }
      return newSelected;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update basic profile
      const basicProfileData = {
        name: formData.name,
        phone_number: formData.phone_number,
        email: formData.email,
        gender: formData.gender,
        sexual_orientation: formData.sexual_orientation,
        birth_date: formData.birth_date,
      };
      const updatedUser = await userService.updateProfile(basicProfileData);

      // Update bio
      const bioData = {
        bio: formData.bio,
        height: formData.height ? parseInt(formData.height) : null,
        goals_relation: formData.goals_relation,
        languages: formData.languages ? formData.languages.split(',').map(s => s.trim()).filter(s => s) : [],
        zodiac_sign: formData.zodiac_sign,
        education: formData.education,
        children_preference: formData.children_preference,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        location_name: formData.location_name,
      };
      await userService.updateBio(bioData);
      
      // Update interests
      // First, get current interests from the initial fetch or context
      const currentInterestIds = new Set(user.interests?.map(i => i.id) || []);
      const interestsToAdd = Array.from(selectedInterests).filter(id => !currentInterestIds.has(id));
      const interestsToRemove = Array.from(currentInterestIds).filter(id => !selectedInterests.has(id));

      if (interestsToAdd.length > 0) {
        await userService.addInterests(interestsToAdd);
      }
      if (interestsToRemove.length > 0) {
        await userService.removeInterests(interestsToRemove);
      }
      
      // Fetch the full updated profile to update context
      const fullUpdatedProfile = await userService.getProfile();
      updateUserContext(fullUpdatedProfile); 
      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate('/profile'), 1500); // Redirect back after success
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
      if (err.errors) { // Laravel validation errors
        const firstErrorKey = Object.keys(err.errors)[0];
        setError(`Validation Error: ${err.errors[firstErrorKey][0]}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.name) return <p>Loading editor...</p>; // Initial load of form
  if (error && !formData.name) return <p style={{ color: 'red' }}>Error: {error}</p>;


  return (
    <div>
      <h2>Edit Profile</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '600px' }}>
        <h4>Basic Information</h4>
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
        <input type="tel" name="phone_number" placeholder="Phone Number" value={formData.phone_number} onChange={handleChange} />
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <select name="sexual_orientation" value={formData.sexual_orientation} onChange={handleChange}>
            <option value="straight">Straight</option>
            <option value="gay">Gay</option>
            {/* Add other options as in register */}
        </select>
        <label>Birth Date:</label>
        <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} />

        <h4>Bio & Details</h4>
        <textarea name="bio" placeholder="About me..." value={formData.bio} onChange={handleChange}></textarea>
        <input type="number" name="height" placeholder="Height (cm)" value={formData.height} onChange={handleChange} />
        <input type="text" name="goals_relation" placeholder="Relationship Goals" value={formData.goals_relation} onChange={handleChange} />
        <input type="text" name="languages" placeholder="Languages (comma-separated)" value={formData.languages} onChange={handleChange} />
        <input type="text" name="zodiac_sign" placeholder="Zodiac Sign" value={formData.zodiac_sign} onChange={handleChange} />
        <input type="text" name="education" placeholder="Education" value={formData.education} onChange={handleChange} />
        <input type="text" name="children_preference" placeholder="Children Preference" value={formData.children_preference} onChange={handleChange} />
        
        <h4>Location</h4>
        <input type="text" name="location_name" placeholder="Location Name (e.g., Paris, France)" value={formData.location_name} onChange={handleChange} />
        <input type="number" step="any" name="latitude" placeholder="Latitude" value={formData.latitude} onChange={handleChange} />
        <input type="number" step="any" name="longitude" placeholder="Longitude" value={formData.longitude} onChange={handleChange} />

        <h4>Interests</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', maxHeight:'200px', overflowY:'auto', border:'1px solid #ccc', padding:'10px' }}>
          {allInterests.map(interest => (
            <label key={interest.id} style={{display:'block', padding:'5px', border:'1px solid #eee', borderRadius:'5px', cursor:'pointer', backgroundColor: selectedInterests.has(interest.id) ? '#e0f7fa' : 'transparent' }}>
              <input
                type="checkbox"
                checked={selectedInterests.has(interest.id)}
                onChange={() => handleInterestChange(interest.id)}
                style={{marginRight: '5px'}}
              />
              {interest.name}
            </label>
          ))}
        </div>
        
        <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
      </form>
    </div>
  );
};

export default EditProfilePage;