// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Make sure this hook is correctly set up

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // This should clear the token and user state in AuthContext
    navigate('/login');
  };

  return (
    <nav style={{
        padding: '10px 15px', // Added some horizontal padding
        background: '#f0f0f0', // Slightly different background
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center', // Vertically align items
        borderBottom: '1px solid #ddd' // Subtle bottom border
    }}>
      <div>
        {/* Changed Home link to / if not authenticated, /home if authenticated */}
        <Link to={isAuthenticated ? "/home" : "/"} style={{ marginRight: '15px', fontWeight: 'bold', color: '#333', textDecoration: 'none' }}>
          TinderClone
        </Link>
        {isAuthenticated && (
          <>
            <Link to="/home" style={linkStyle}>Home</Link> {/* Assuming /home is recommendations */}
            <Link to="/matches" style={linkStyle}>Matches</Link>
            <Link to="/chat" style={linkStyle}>Chat</Link> {/* Added Chat Link */}
            <Link to="/profile" style={linkStyle}>Profile</Link>
          </>
        )}
      </div>
      <div>
        {isAuthenticated ? (
          <>
            <span style={{ marginRight: '15px', color: '#555' }}>Welcome, {user?.name || 'User'}!</span>
            <button onClick={handleLogout} style={buttonNavStyle}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/register" style={linkStyle}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

// Basic styles for links and button (consider a CSS file)
const linkStyle = {
  marginRight: '15px',
  color: '#007bff',
  textDecoration: 'none',
};

const buttonNavStyle = {
  padding: '5px 10px',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

export default Navbar;