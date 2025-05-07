// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Make sure this hook is correctly set up
import './Navbar.css'; // Подключаем стили

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // This should clear the token and user state in AuthContext
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div  className="navbar-left">
      <Link to={isAuthenticated ? "/home" : "/"}>TinderClone</Link>
        {isAuthenticated && (
          <>
            <Link to="/home" className="nav-link">Home</Link>
            <Link to="/matches" className="nav-link">Matches</Link>
            <Link to="/chat" className="nav-link">Chat</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
          </>
        )}
      </div>
      <div className="navbar-right">
        {isAuthenticated ? (
          <>
            <span>Welcome, {user?.name || 'User'}!</span>
            <button onClick={handleLogout} className="navbar-logout-button">Logout</button>
          </> 
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;