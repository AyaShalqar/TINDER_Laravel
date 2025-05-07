import React from 'react';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import './RegisterPage.css'; // Импортируйте файл CSS

const RegisterPage = () => {
  const { register } = useAuth();

  return (
    <div className="register-page">
          <div className="register-container">
        <h2 className="register-title">Register</h2>
        <div className="register-form-wrapper">
          <AuthForm onSubmit={register} submitText="Register" isRegister={true} />
        </div>
        <p className="login-prompt">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;