import api from './api';

const register = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Registration failed');
  }
};

const login = async (credentials) => {
  try {
    const response = await api.post('/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Login failed');
  }
};

// Optional: if you have a backend logout
// const logout = async () => {
//   try {
//     await api.post('/logout');
//   } catch (error) {
//     console.error('Logout error:', error.response?.data || error.message);
//     // Don't throw, just log, as client-side logout will proceed
//   }
// };

export default {
  register,
  login,
  // logout,
};