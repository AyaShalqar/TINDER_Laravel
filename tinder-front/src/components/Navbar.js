import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ padding: '10px', background: '#eee', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <Link to="/" style={{ marginRight: '10px' }}>Home (Recommendations)</Link>
        {isAuthenticated && <Link to="/profile" style={{ marginRight: '10px' }}>Profile</Link>}
        {isAuthenticated && <Link to="/matches" style={{ marginRight: '10px' }}>Matches</Link>}
      </div>
      <div>
        {isAuthenticated ? (
          <>
            <span style={{ marginRight: '10px' }}>Welcome, {user?.name}!</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;