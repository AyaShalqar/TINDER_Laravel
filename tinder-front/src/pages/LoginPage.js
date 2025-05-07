import React from 'react';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const { login } = useAuth();

  const handleLogin = async (credentials) => {
    await login({ email: credentials.email, password: credentials.password });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Login</h2>
        <AuthForm onSubmit={handleLogin} submitText="Login" />
        <p className="register-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>

  );
};

export default LoginPage;