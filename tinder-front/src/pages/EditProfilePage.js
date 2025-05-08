import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService'; // Ensure this path is correct
import { useAuth } from '../hooks/useAuth';

const EditProfilePage = () => {
  const { user, updateUserContext } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    email: '',
    gender: 'male',
    sexual_orientation: 'straight',
    birth_date: '',
    bio: '',
    height: '',
    goals_relation: '',
    languages: '',
    zodiac_sign: '',
    education: '',
    children_preference: '',
    latitude: '',
    longitude: '',
    location_name: '',
  });
  const [allInterests, setAllInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState(new Set());
  const [initialUserInterestIds, setInitialUserInterestIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const profileData = await userService.getProfile();
      setFormData({
        name: profileData.name || '',
        phone_number: profileData.phone_number || '',
        email: profileData.email || '',
        gender: profileData.gender || 'male',
        sexual_orientation: profileData.sexual_orientation || 'straight',
        birth_date: profileData.birth_date ? profileData.birth_date.split('T')[0] : '',
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

      const currentUserInterestIds = new Set(profileData.interests?.map(i => i.id) || []);
      setSelectedInterests(currentUserInterestIds);
      setInitialUserInterestIds(currentUserInterestIds);

      const availableInterests = await userService.getAllAvailableInterests(); // Now calls the real API
      setAllInterests(availableInterests || []);
    } catch (err) {
      const errorMessage = err.message || (err.errors ? JSON.stringify(err.errors) : 'Failed to load profile data.');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) { // Only fetch if user is available from useAuth
        fetchProfileData();
    } else {
        // Handle case where user is not yet loaded or not authenticated
        // navigate('/login'); // Or show an appropriate message
        setLoading(false);
        setError("User not authenticated or profile data unavailable.");
    }
  }, [fetchProfileData, user, navigate]);

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
      await userService.updateProfile(basicProfileData);

      // Update bio (which includes location in your UserController@updateBio)
      const bioData = {
        bio: formData.bio,
        height: formData.height ? parseInt(formData.height) : null,
        goals_relation: formData.goals_relation,
        languages: formData.languages ? formData.languages.split(',').map(s => s.trim()).filter(s => s) : [],
        zodiac_sign: formData.zodiac_sign,
        education: formData.education,
        children_preference: formData.children_preference,
        // Location fields are part of bio update in your UserController
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        location_name: formData.location_name,
      };
      await userService.updateBio(bioData);
      
      // Note: If you want to update location separately, you would call:
      // await userService.updateLocation({ 
      //   latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      //   longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      //   location_name: formData.location_name 
      // });
      // However, your UserController@updateBio already handles these. If you split it, adjust here.

      const interestsToAdd = Array.from(selectedInterests).filter(id => !initialUserInterestIds.has(id));
      const interestsToRemove = Array.from(initialUserInterestIds).filter(id => !selectedInterests.has(id));

      if (interestsToAdd.length > 0) {
        await userService.addInterests(interestsToAdd);
      }
      if (interestsToRemove.length > 0) {
        await userService.removeInterests(interestsToRemove);
      }
      
      const fullUpdatedProfile = await userService.getProfile();
      updateUserContext(fullUpdatedProfile); 
      
      const newInterestIds = new Set(fullUpdatedProfile.interests?.map(i => i.id) || []);
      setSelectedInterests(newInterestIds);
      setInitialUserInterestIds(newInterestIds);

      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      let errorMessage = 'Failed to update profile.';
      if (err.errors) { // Laravel validation errors
        const firstErrorKey = Object.keys(err.errors)[0];
        errorMessage = `Validation Error: ${err.errors[firstErrorKey][0]}`;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading editor...</p>;
  // Removed the !formData.name condition for error display to show errors even if form partially loaded
  if (error && !success) return <p style={{ color: 'red' }}>Error: {error}</p>;


  return (
    <div style={{ maxWidth: '700px', margin: '20px auto', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Edit Profile</h2>
      {error && !success && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {success && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h4>Basic Information</h4>
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required 
               style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}/>
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required 
               style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}/>
        <input type="tel" name="phone_number" placeholder="Phone Number" value={formData.phone_number} onChange={handleChange} 
               style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}/>
        <select name="gender" value={formData.gender} onChange={handleChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="non-binary">Non-binary</option>
          <option value="other">Other</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
        <select name="sexual_orientation" value={formData.sexual_orientation} onChange={handleChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
            <option value="straight">Straight</option>
            <option value="gay">Gay</option>
            <option value="lesbian">Lesbian</option>
            <option value="bisexual">Bisexual</option>
            <option value="pansexual">Pansexual</option>
            <option value="asexual">Asexual</option>
            <option value="queer">Queer</option>
            <option value="questioning">Questioning</option>
            <option value="other">Other</option>
        </select>
        <label htmlFor="birth_date">Birth Date:</label>
        <input id="birth_date" type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} required 
               style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}/>

        <h4>Bio & Details</h4>
        <textarea name="bio" placeholder="About me..." value={formData.bio} onChange={handleChange} 
                  style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }}></textarea>
        <input type="number" name="height" placeholder="Height (cm)" value={formData.height} onChange={handleChange} min="0" 
               style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}/>
        <input type="text" name="goals_relation" placeholder="Relationship Goals" value={formData.goals_relation} onChange={handleChange} 
               style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}/>
        <input type="text" name="languages" placeholder="Languages (comma-separated)" value={formData.languages} onChange={handleChange} 
               style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}/>
        <input type="text" name="zodiac_sign" placeholder="Zodiac Sign" value={formData.zodiac_sign} onChange={handleChange} 
               style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}/>
        <input type="text" name="education" placeholder="Education" value={formData.education} onChange={handleChange} 
               style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}/>
        <input type="text" name="children_preference" placeholder="Children Preference" value={formData.children_preference} onChange={handleChange} 
               style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}/>
        
        <h4>Location (Part of Bio Details)</h4>
        <input type="text" name="location_name" placeholder="Location Name (e.g., Paris, France)" value={formData.location_name} onChange={handleChange} 
               style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}/>
        <input type="number" step="any" name="latitude" placeholder="Latitude" value={formData.latitude} onChange={handleChange} 
               style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}/>
        <input type="number" step="any" name="longitude" placeholder="Longitude" value={formData.longitude} onChange={handleChange} 
               style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}/>

        <h4>Interests</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', maxHeight:'200px', overflowY:'auto', border:'1px solid #ccc', padding:'10px', borderRadius: '5px' }}>
          {allInterests.length > 0 ? allInterests.map(interest => (
            <label key={interest.id} style={{display:'inline-block', padding:'6px 12px', border:'1px solid #eee', borderRadius:'15px', cursor:'pointer', backgroundColor: selectedInterests.has(interest.id) ? 'lightblue' : '#f8f9fa', transition: 'background-color 0.2s', fontSize: '0.9em' }}>
              <input
                type="checkbox"
                checked={selectedInterests.has(interest.id)}
                onChange={() => handleInterestChange(interest.id)}
                style={{marginRight: '5px', verticalAlign: 'middle'}}
              />
              {interest.name}
            </label>
          )) : <p>No interests available. Try refreshing or contact support if this persists.</p>}
        </div>
        
        <button type="submit" disabled={loading} style={{ padding: '12px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px', fontSize: '1em', fontWeight: 'bold' }}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditProfilePage;