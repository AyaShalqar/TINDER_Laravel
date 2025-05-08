import React from 'react';
import { Link } from 'react-router-dom';
import tinderLogo from '../assets/images/tinder-logo.svg';
import './WelcomePage.css'; 

const WelcomePage = () => {
  return (
    <div className="welcome-page">
      <div className="welcome-overlay"></div>
      <div className="welcome-content">

        <img src={tinderLogo} alt="Flame Logo" className="welcome-logo-image" />
        <h1 className="welcome-logo-text">Tinder</h1>         
        <p className="welcome-tagline">
          Swipe Right® on your next adventure.
        </p>
        <div className="welcome-actions">
          <Link to="/login" className="welcome-button login">
            Log In
          </Link>
          <Link to="/register" className="welcome-button register">
            Create Account
          </Link>
        </div>
        <p className="welcome-terms">
          By tapping Create Account or Log In, you agree to our <a href="/terms" target="_blank" rel="noopener noreferrer">Terms</a>. 
          Learn how we process your data in our <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and <a href="/cookies" target="_blank" rel="noopener noreferrer">Cookies Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default WelcomePage;