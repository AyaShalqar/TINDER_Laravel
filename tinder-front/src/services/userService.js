import api from './api'; 

const getProfile = async () => {
  try {
    const response = await api.get('/profile');
    return response.data.user;
  } catch (error) {
    console.error('Get profile error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch profile');
  }
};

const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/profile', profileData); 
    return response.data;
  } catch (error) {
    console.error('Update profile error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to update profile');
  }
};

const updateBio = async (bioData) => {
  try {
    const response = await api.post('/profile/bio', bioData); 
    return response.data;
  } catch (error) {
    console.error('Update bio error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to update bio');
  }
};

const updateLocation = async (locationData) => {
  try {
    const response = await api.post('/profile/location', locationData); 
    return response.data;
  } catch (error) {
    console.error('Update location error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to update location');
  }
};

const uploadImage = async (formData) => { 
  try {
    const response = await api.post('/profile/images', formData, { 
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Upload image error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to upload image');
  }
};

const deleteImage = async (imageId) => {
  try {
    
    const response = await api.delete(`/profile/images/${imageId}`); 
    return response.data;
  } catch (error) {
    console.error('Delete image error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to delete image');
  }
};

const addInterests = async (interestIds) => { 
  try {
   
    const response = await api.post('/profile/interests', { interests: interestIds }); 
    return response.data;
  } catch (error) {
    console.error('Add interests error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to add interests');
  }
};

const removeInterests = async (interestIds) => { 
  try {
   
    const response = await api.delete('/profile/interests', { data: { interests: interestIds } }); 
    return response.data;
  } catch (error) {
    console.error('Remove interests error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to remove interests');
  }
};

const getAllAvailableInterests = async () => {
  try {
    const response = await api.get('/interests'); 
    return response.data.interests; 
  } catch (error) {
    console.error('Get all interests error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch all interests');
  }
};

const getRecommendations = async () => {
  try {
    const response = await api.get('/recommendations'); 
    return response.data;
  } catch (error) {
    console.error('Get recommendations error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch recommendations');
  }
};


const userService = { 
  getProfile,
  updateProfile,
  updateBio,
  updateLocation,
  uploadImage,
  deleteImage,
  addInterests,
  removeInterests,
  getAllAvailableInterests,
  getRecommendations,

};

export default userService; 