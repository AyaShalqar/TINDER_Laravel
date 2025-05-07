import React from 'react';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const { login } = useAuth();

  const handleLogin = async (credentials) => {
    // AuthForm provides all fields, but login only needs email and password
    await login({ email: credentials.email, password: credentials.password });
  };

  return (
    <div>
      <h2>Login</h2>
      <AuthForm onSubmit={handleLogin} submitText="Login" />
      <p>Don't have an account? <Link to="/register">Register here</Link></p>
    </div>
  );
};

export default LoginPage;