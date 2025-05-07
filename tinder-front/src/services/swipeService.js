import api from './api';

const swipe = async (targetUserId, action) => {
  try {
    const response = await api.post('/swipe', {
      target_user_id: targetUserId,
      action: action, // 'like' or 'dislike'
    });
    return response.data; // { message: '...', match: true/false, matched_user_id (optional) }
  } catch (error) {
    console.error('Swipe error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Swipe action failed');
  }
};

const getMatches = async () => {
  try {
    const response = await api.get('/matches');
    console.log(response.data.matches)
    return response.data.matches; // Array of match objects
  } catch (error) {
    console.error('Get matches error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch matches');
  }
};

const unmatch = async (matchId) => {
  try {
    const response = await api.delete(`/matches/${matchId}`);
    return response.data;
  } catch (error) {
    console.error('Unmatch error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Unmatch action failed');
  }
};

export default {
  swipe,
  getMatches,
  unmatch,
};