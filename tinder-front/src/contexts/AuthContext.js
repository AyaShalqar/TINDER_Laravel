import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true); // To check auth status on initial load
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          // You might want an endpoint like /api/user to verify the token
          // and get fresh user data. For now, we'll assume the token means logged in
          // and fetch profile if token exists.
          const currentUser = JSON.parse(localStorage.getItem('authUser'));
          if (currentUser) {
              setUser(currentUser);
          } else {
            // If no user in localStorage but token exists, try fetching profile
            // This requires a /profile endpoint that returns user if token is valid
            // For simplicity, we're skipping a dedicated verify endpoint.
            // If your /profile needs auth and token is invalid, it will fail,
            // then we can clear the token.
            console.warn("Token exists but no user in localStorage. Consider fetching user profile here.");
          }
        } catch (error) {
          console.error('Token verification failed or user fetch failed:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, [token]);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    localStorage.setItem('authToken', data.access_token);
    localStorage.setItem('authUser', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    navigate('/'); // Navigate to home/recommendations
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    localStorage.setItem('authToken', data.access_token);
    localStorage.setItem('authUser', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    navigate('/'); // Navigate to home/recommendations
    return data;
  };

  const logout = () => {
    // Optionally call a backend /logout endpoint if it invalidates the token server-side
    // await authService.logout();
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const updateUserContext = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('authUser', JSON.stringify(updatedUserData));
  };


  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, isAuthenticated: !!token, updateUserContext }}>
      {children}
    </AuthContext.Provider>
  );
};